const Contest = require("../models/contest");
const ContestUser = require("../models/contestUser");
const Problem = require("../models/problem");
const { getIdByLanguage, submitBatch, submitToken } = require("../utils/problem_Utility");

const createContest = async (req, res) => {
  try {
    const { name, description, startTime, endTime, problems } = req.body;

    // ✅ Validate inputs
    if (!name || !description || !startTime || !endTime || !problems) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // ✅ Validate times
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // ✅ Create contest
    const result = await Contest.create({
      name,
      description,
      startTime: start,
      endTime: end,
      problems
    });

    return res.status(201).json({
      message: "Contest created successfully",
      contest: result
    });

  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


const updateContest = async (req, res) => {

}

const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!id) {
      return res.status(400).json({ message: "Contest ID is required" });
    }

    // ✅ Find & delete contest
    const contest = await Contest.findByIdAndDelete(id);

    // ✅ If contest not found
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    return res.status(200).json({
      message: "Contest deleted successfully",
      deletedContest: contest
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error while deleting contest",
      error: err.message
    });
  }
};

const allContests = async (req, res) => {
  try {
    const contests = await Contest.find({})
      .select('_id name startTime endTime') // select only needed fields
      .sort({ startTime: -1 }) // latest contests first
      .limit(5); // fetch only 5

    return res.status(200).json({
      message: "Latest contests fetched successfully",
      contests
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while fetching contests",
      error: err.message
    });
  }
};



const joinContest = async (req, res) => {
  try {
    const userId = req.result._id;
    const contestId = req.params.id;
    // console.log('hii');
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // 2️⃣ Prevent duplicate joins
    const alreadyJoined = contest.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    );

    if (alreadyJoined) {
      return res
        .status(400)
        .json({ message: "User already joined this contest" });
    }

    contest.participants.push(userId);
    await contest.save();

    const contestUser = await ContestUser.create({
      userId,
      contestId,
    });

    return res.status(200).json({
      message: "Joined contest successfully",
      contest
    })
  }
  catch (err) {
    return res.status(500).json({ message: "Server error while joining contest", error: err.message });
  }
}

const getContestDetails = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.result._id;

    // 1️⃣ Find the contest
    const contest = await Contest.findById(contestId).populate({ path: 'problems', select: 'title difficulty constraints discription startCode visibleTestCases' });;
    // console.log(contest);    
    if (!contest)
      return res.status(404).json({ message: "Contest not found" });

    // 2️⃣ Check if user is a participant
    const isParticipant = contest.participants.some(
      (p) => p._id.toString() === userId.toString()
    );

    if (!isParticipant)
      return res.status(403).json({
        message: "You are not a participant of this contest",
      });

    // 3️⃣ Restrict access before contest start time
    const now = new Date();
    if (now < new Date(contest.startTime))
      return res.status(403).json({
        message: "Contest has not started yet. Please wait until start time.",
        startTime: contest.startTime,
      });

    if (contest.status != 'upcoming' && now > new Date(contest.startTime) && now < new Date(contest.endTime)) {
      contest.status = 'ongoing';
      await contest.save();
    }
    if (now > new Date(contest.endTime) && contest.status != 'ended') {
      contest.status = 'ended';
      await contest.save();
    }

    contest.participants = [];
    return res.status(200).json({
      message: "Contest details fetched successfully",
      contest,
    });
  } catch (err) {
    console.error("Error fetching contest details:", err);
    return res.status(500).json({
      message: "Server error while fetching contest details",
      error: err.message,
    });
  }
}

const codeSubmission = async (req, res) => {
  try {
    const userId = req.result._id;
    const contestId = req.params.id;

    let { code, language, problemId } = req.body;

    if (!userId || !problemId || !code || !language || !contestId)
      return res.status(400).send("some fields missing");

    if (language === "cpp") language = "C++";
    if (language === "python") language = "Python";
    if (language === "java") language = "Java";

    const problem = await Problem.findById(problemId);

    if (language === "C++")
      code = problem.startCode[0].HeaderCode + "\n" + code + "\n" + problem.startCode[0].FooterCode;
    if (language === "Java")
      code = problem.startCode[1].HeaderCode + "\n" + code + "\n" + problem.startCode[1].FooterCode;
    if (language === "Python")
      code = problem.startCode[2].HeaderCode + "\n" + code + "\n" + problem.startCode[2].FooterCode;

    const languageId = getIdByLanguage(language);
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));
    const getToken = await submitBatch(submissions);

    const resultToken = getToken.map(value => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = null;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = test.status;
        errorMessage = test.compile_output;
      }
    }

    if (!status) {
      const contestUser = await ContestUser.findOne({ userId, contestId });
      if (!contestUser.solvedProblems.includes(problemId)) {
        contestUser.solvedProblems.push(problemId);
        await contestUser.save();
      }
      status = {
        id: 3,
        description: "Accepted"
      }
    }

    const submitResult = {
      userId,
      problemId,
      code,
      language,
      testCasesTotal: problem.hiddenTestCases.length,
      testCasesPassed,
      status,
      errorMessage,
      runtime,
      memory
    }

    res.status(201).send(submitResult);
  }
  catch (err) {
    console.log(err);
    res.status(500).send("Error: " + err);
  }
}

const getUserScoreInContest = async (req, res) => {
  try {
    const userId = req.result._id;
    const contestId = req.params.id;

    const contestUser = await ContestUser.findOne({ userId, contestId })
      .populate({
        path: 'contestId',
        select: 'startTime endTime name'
      });

    if (!contestUser) return res.status(404).send("User not Joined the contest");

    if (contestUser.attempt === false) return res.status(404).send("User has not attempted the contest");

    const contest = contestUser.contestId;
    // 2️⃣ Check if contest has ended
    const now = new Date();
    if (now < contest.endTime)
      return res.status(403).json({
        message: "Contest has not ended yet. Scores are not available.",
        endTime: contest.endTime,
      });

    return res.status(200).json({
      contest: {
        id: contestId,
        name: contest.name,
      },
      score: {
        points: contestUser.points,
        solvedProblems: contestUser.solvedProblems,
      }
    })
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

const getUserContestHistory = async (req, res) => {
  try {
    const userId = req.result._id;

    // 1️⃣ Fetch all contests the user has participated in
    const userHistory = await ContestUser.find({ userId })
      .populate({
        path: "contestId",
        select: "name startTime endTime status", // basic contest info
      })
      .populate({
        path: "solvedProblems",
        select: "title difficulty",
      })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    // 2️⃣ Handle case when user has no contest history
    if (!userHistory || userHistory.length === 0) {
      return res.status(200).json({
        message: "No contest participation history found.",
        history: [],
      });
    }

    // 3️⃣ Format data for cleaner response
    const formattedHistory = userHistory.map((entry) => ({
      contest: {
        id: entry.contestId?._id,
        name: entry.contestId?.name,
        startTime: entry.contestId?.startTime,
        endTime: entry.contestId?.endTime,
        status: entry.contestId?.status,
      },
      points: entry.points,
      attempt: entry.attempt,
      solvedProblems: entry.solvedProblems || [],
      participatedAt: entry.createdAt,
    }));

    // 4️⃣ Return the history
    return res.status(200).json({
      message: "User contest history fetched successfully",
      totalContests: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (err) {
    console.error("Error fetching user contest history:", err);
    return res.status(500).json({
      message: "Server error while fetching user contest history",
      error: err.message,
    });
  }
}

const contestLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;

    // 1️⃣ Check if contest exists
    const contest = await Contest.findById(contestId).select("name endTime status");
    if (!contest)
      return res.status(404).json({ message: "Contest not found" });

    // 2️⃣ Only show leaderboard after contest ends
    const now = new Date();
    if (now < new Date(contest.endTime)) {
      return res.status(403).json({
        message: "Leaderboard is not available until the contest ends.",
        endTime: contest.endTime,
      });
    }

    // 3️⃣ Fetch leaderboard entries
    const leaderboardData = await ContestUser.find({ contestId })
      .populate({
        path: "userId",
        select: "name email",
      })
      .sort({ points: -1, updatedAt: 1 }) // sort by points, then earliest submission
      .lean();

    // 4️⃣ Handle empty leaderboard
    if (!leaderboardData.length) {
      return res.status(200).json({
        message: "No participants found for this contest.",
        leaderboard: [],
      });
    }

    // 5️⃣ Format with ranks
    let rank = 1;
    const leaderboard = leaderboardData.map((entry, index) => {
      // Handle tie points (same rank for equal scores)
      if (index > 0 && entry.points < leaderboardData[index - 1].points) {
        rank = index + 1;
      }
      return {
        rank,
        user: {
          id: entry.userId?._id,
          name: entry.userId?.name,
        },
        points: entry.points,
        solvedProblemsCount: entry.solvedProblems?.length || 0,
        attempt: entry.attempt,
      };
    });

    // 6️⃣ Send response
    return res.status(200).json({
      message: "Contest leaderboard fetched successfully",
      contest: {
        id: contestId,
        name: contest.name,
        status: contest.status,
      },
      leaderboard,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return res.status(500).json({
      message: "Server error while fetching leaderboard",
      error: err.message,
    });
  }
}


module.exports = { allContests, createContest, updateContest, deleteContest, joinContest, getContestDetails, codeSubmission, getUserScoreInContest, getUserContestHistory, contestLeaderboard };