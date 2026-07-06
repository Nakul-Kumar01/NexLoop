
const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const { getIdByLanguage, submitBatch, submitToken } = require('../utils/problem_Utility');
const SolutionVideo = require('../models/solutionVideo');



  
const createProblem = async (req, res) => {
//   console.log(req.body);
    const {
        title, discription, difficulty, tags, bookMark, companies, hint, visibleTestCases, hiddenTestCases, startCode, referenceSolution
    } = req.body;

    // as admin send the problem, before saving it in database first verify its solution on visible test cases
    // verify by Judge0
    // AXIOS : it is updation on Fetch 
    // since, we have limited API, therefore we will send complete batch of visible test cases // and it will verify all of them at once

    try {

        for (const { language, SolutionClass } of referenceSolution) {

            const languageId = getIdByLanguage(language);
            // let temp = completeCode + readInput;
            // console.log(completeCode);
            // Create Submission Batch // for one language , one Submission Batch will be made // let we hv 2 test cases, then we recieve 2 tokens in array
            const addCode = startCode.find(code => code.language === language);
            const completeCode = addCode.HeaderCode + SolutionClass + addCode.FooterCode;
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));
            // console.log(Submissions);

            // Example:
            // per language, we have 2 visible test cases, therefore for each language we get array of two tokens:
            // [{ token: '11a9b3dd-07a7-41ac-8e8e-8e8935e4d433' },{ token: '46d61728-23a9-423e-ada5-f67f4549e17b' }]

            const submitResult = await submitBatch(submissions);
            //   console.log(submitResult);
            // console.log("token Recieved");
            /*
            Judge0 : 2 step process 
            1) first it submit BatchSubmission, and it will return array of tokens
            2) now, we will make GET request with each token and fetch actual result
               - In final result, we hv status ID: 1- in queue, 2-processing , 3- Accepted , 4- wrong ans , 5- tle, 6- compilation error , 7- Runtime error
  
  
             // when we submit BatchSubmission, then it takes some time to run code, now if we wait over there server then there resourses will be used
             // therefore, it gave us token(to identify our submission) // ki thodi derr baad aana
            */

            const resultToken = submitResult.map(value => value.token); // it is format for Judge0: make GET request with array of each Token

            const testResult = await submitToken(resultToken);
            // console.log("Result Recieved");


            for (const test of testResult) {
                // console.log("1st");
                if (test.status_id != 3) {
                    // console.log(test);
                    return res.status(400).send("Error Occured");
                }
                // Mention all other cases of Error i.e. TLE etc
            }
        }

        // now, we can store it in our DB
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })

        res.status(201).send("Problem Saved Successfully");

    }
    catch (err) {
        return res.status(500).send("Error: " + err);
    }
}

const updateProblem = async (req, res) => {

    try {
        // console.log("here",req.body);
        const { id } = req.params;

        const {
            title, discription, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution
        } = req.body;

        if (!id) return res.status(400).send("Missing ID Field");

        const DsaProblem = await Problem.findById(id); // if this id exist in our database
        if (!DsaProblem) return res.status(400).send("Missing ID Field");

        for (const { language, SolutionClass } of referenceSolution) {

            const languageId = getIdByLanguage(language);
            const addCode = startCode.find(code => code.language === language);
            const completeCode = addCode.HeaderCode + SolutionClass + addCode.FooterCode;

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map(value => value.token); // it is format for Judge0: make GET request with array of each Token

            const testResult = await submitToken(resultToken);


            for (const test of testResult) {
                if (test.status_id != 3)
                    return res.status(400).send("Error Occured");
            }
        }

        // when we update: then by default Validator run nhi hote
        // new:true -> also return udated Document

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

        res.status(200).send(newProblem);

    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }


}

const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send("Missing ID Field");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) return res.status(404).send("Problem Not Found");

        res.status(200).send("Problem Deleted Successfully");
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getProblemById = async (req, res) => {
    const { id } = req.params;
    // console.log(typeof(id));

    try {
        if (!id) return res.status(400).send("Missing ID Field");

        const getProblem = await Problem.findById(id).select("-hiddenTestCases  -problemCreator -__v");


        if (!getProblem) return res.status(404).send("Problem Not Found");


        // video ka jo bhi url wagra hai wo bhi bhaj do
        const videos = await SolutionVideo.findOne({ problemId: id });

        if (videos) {
            const responseData = {  // converting mongoose document into js object
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                duration: videos.duration,
                thumbnailUrl: videos.thumbnailUrl,
                cloudinaryPublicId: videos.cloudinaryPublicId
            }
            return res.status(200).send(responseData);
        }


        res.status(200).send(getProblem);
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}


const getAllProblem = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // current page number (default: 1)
        const limit = 10; // number of problems per page
        const skip = (page - 1) * limit; // how many to skip before fetching

        // console.log("hii")
        const allProblem = await Problem.find({})  // same as find()
            .select("_id title difficulty tags")
            .skip(skip)
            .limit(limit);

        const total = await Problem.countDocuments(); // total number of problems

        if (allProblem.length == 0) return res.status(404).send("Problem Not Found");


        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            problems: allProblem,
        });

    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const solvedProblems = async (req, res) => {
    try {
        const userId = req.result._id;
        if(!userId) return res.status(400).send("User ID Missing");
        // const user = await User.findById(userId).populate("problemSolved"); // where problemSolved is pointing bring that data also
        // but this will fetch the complete document of that proble

        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags" // fetch only these fields
        });


        res.status(200).send(user.problemSolved);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const problemSubmissions = async (req, res) => {
    try {
        // console.log("done1");
        const userId = req.result._id;
        const problemId = req.params.pid;
        //    console.log("hii");
        // By Compounding Indexing
        const ans = await Submission.find({ userId, problemId });
        // console.log("done2");
        //    if(ans.length == 0)
        //     res.status(200).send("No Submission Found");
        // console.log(ans)
        res.status(200).send(ans);

    } catch (err) {
        res.status(500).send("Internal Server Errorr:", err);
        console.log(err);
    }
}


const userSubmissionHistory = async (req, res) => {
  try {
    const userId = req.result._id;

    // Calculate date 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find submissions of the last year with accepted status
    const submissions = await Submission.find({
      userId,
      status:{
        id:3,
        description: "Accepted" 
      },
      createdAt: { $gte: oneYearAgo } // greater than or equal to one year ago
    })
    .sort({ createdAt: -1 }); // latest first
    // console.log(submissions);   

    // if (!submissions.length) {
    //   return res.status(404).json({ message: "No accepted submissions found in the past year" });
    // }

    res.status(200).json({
      total: submissions.length,
      submissions
    });
  } catch (err) {
    console.error("Error fetching submission history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedProblems, problemSubmissions,userSubmissionHistory };