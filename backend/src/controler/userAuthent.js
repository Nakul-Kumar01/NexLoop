const redisClient = require('../config/redis');
const submission = require('../models/submission');
const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
  try {

    validate(req.body);

    // also we can check here whether emailId is already registered or not
    // user.exists({ emailId: req.body.emailId }) // but no need, since already checked schema
    //  console.log("done1");
    req.body.role = "user"; // by default role is user // also if user try to be admin, then he/she demoted to user

    req.body.password = await bcrypt.hash(req.body.password, 10);
    // console.log("done2");
    // console.log(req.body);
    const user = await User.create(req.body);

    // console.log("done3");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id
    }

    // no need of await
    const token = jwt.sign({ _id: user._id, emailId: req.body.emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: '1h' });
    // console.log("done4");
    // res.cookie('token', token, { maxAge: 60 * 60 * 1000 }); // you can also use expire 
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000
     });
    res.status(201).json({
      user: reply,
      message: "Login successful"
    });

  }
  catch (err) {
    // Duplicate email error
    if (err.code === 11000) {
      return res.status(409).send("Email already registered. Try a different email.");
    }
    console.error(err);
    res.status(400).send("Error: " + err); // 400 Bad Request
  }
}



const login = async (req, res) => {

  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error('Invalid credentials');
    }
    // console.log("done1");
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error('Invalid Credentials');
    }
    // console.log(user)
    // console.log("done2");
    // no need of await
    const match = await bcrypt.compare(password, user.password);
    // console.log(match)

    if (!match) {
      throw new Error('Invalid Credentials');
    }
    // console.log("done3");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id
    }

    const token = jwt.sign({ _id: user._id, emailId: req.body.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });
    // console.log("done4");
    // res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000
     });
    res.status(201).json({
      user: reply,
      message: "Login successful"
    });
  }
  catch (err) {
    res.status(401).send("Error: " + err);
  }
}


const logout = async (req, res) => {
  try {

    // validate the token // if Invalid token, then it is already Logged out
    // we will make its Middleware, since we will validate the token Most of the time

    // add token to blacklist in Redis
    const { token } = req.cookies;

    const payload = jwt.decode(token);

    // console.log("first");
    await redisClient.set(`token:${token}`, `blocked`);
    // console.log("second");
    await redisClient.expireAt(`token:${token}`, payload.exp); // set expiry same as token expiry
    // console.log("third");
    // Clear the Cookie
    // res.cookie("token", null, { expires: new Date(Date.now()) });
    res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
     });
    res.status(200).send("Logged out successfully");
  }
  catch (err) {
    res.status(401).send("Error: " + err);
  }
}


const deleteProfile = async (req, res) => {

  try {
    const userId = req.result._id;

    // userSchema delete
    await User.findByIdAndDelete(userId);

    // delete from submission Schema
    //    await submission.deleteMany({userId}); // M-1 

    // M-2 by post method in user Schema

    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
}


const userProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    // 🟢 Fetch user and populate solved problems
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags createdAt",
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // 🟡 Compute total points for the current user
    const pointsMap = { easy: 2, medium: 4, hard: 8 };
    const solved = user.problemSolved || [];

    const totalPoints = solved.reduce((acc, p) => {
      const diff = (p.difficulty || "").toLowerCase();
      return acc + (pointsMap[diff] || 0);
    }, 0);

    // 🧩 Aggregation Pipeline: calculate rank
    const pipeline = [
      {
        $lookup: {
          from: "problems", // ✅ ensure it matches your actual collection name (usually plural)
          localField: "problemSolved",
          foreignField: "_id",
          as: "solvedProblems",
        },
      },
      {
        $unwind: {
          path: "$solvedProblems",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          pointForSolved: {
            $switch: {
              branches: [
                { case: { $eq: ["$solvedProblems.difficulty", "easy"] }, then: 2 },
                { case: { $eq: ["$solvedProblems.difficulty", "medium"] }, then: 4 },
                { case: { $eq: ["$solvedProblems.difficulty", "hard"] }, then: 8 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalPoints: { $sum: "$pointForSolved" },
        },
      },
      {
        $match: { totalPoints: { $gt: totalPoints } },
      },
      {
        $count: "betterCount",
      },
    ];

    const result = await User.aggregate(pipeline);
    const betterCount = result[0]?.betterCount || 0;
    const rank = betterCount + 1;

    // 🟢 Send final response
    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      role: user.role,
      solvedProblems: solved,
      totalPoints,
      rank,
      joinDate: user.createdAt
    });
  } catch (error) {
    console.error("Error in userProfile:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const leaderboard = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Aggregation pipeline:
    // 1) lookup problems referenced in problemSolved
    // 2) compute totalPoints from difficulty
    // 3) compute problemCount
    // 4) project only needed fields
    // 5) sort by totalPoints desc, then problemCount desc, then updatedAt asc (tie-breaker)
    // 6) facet to get total count and page slice
    const pipeline = [
      {
        $lookup: {
          from: 'problems', // collection name of Problem model (adjust if different)
          localField: 'problemSolved',
          foreignField: '_id',
          as: 'solvedProblems',
        },
      },
      {
        $addFields: {
          totalPoints: {
            $sum: {
              $map: {
                input: '$solvedProblems',
                as: 'p',
                in: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$$p.difficulty', 'easy'] }, then: 2 },
                      { case: { $eq: ['$$p.difficulty', 'medium'] }, then: 4 },
                      { case: { $eq: ['$$p.difficulty', 'hard'] }, then: 8 },
                    ],
                    default: 0,
                  },
                },
              },
            },
          },
          problemCount: { $size: '$solvedProblems' },
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          emailId: 1,
          role: 1,
          totalPoints: 1,
          problemCount: 1,
          solvedProblems: { _id: 1, title: 1, difficulty: 1 },
          updatedAt: 1,
        },
      },
      {
        $sort: {
          totalPoints: -1,
          problemCount: -1,
          updatedAt: 1, // tie-breaker
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'totalUsers' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);

    const metadata = result[0].metadata[0] || { totalUsers: 0 };
    const totalUsers = metadata.totalUsers;
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
    const usersPage = result[0].data;

    // Assign absolute rank to each returned user
    const baseRank = skip;
    const usersWithRank = usersPage.map((u, idx) => ({
      _id: u._id,
      firstName: u.firstName,
      totalPoints: u.totalPoints || 0,
      solvedProblems: u.solvedProblems.length || [],
      rank: baseRank + idx + 1,
    }));

    return res.json({
      totalUsers,
      totalPages,
      users: usersWithRank,
    });
  }
  catch (err) {
    res.status(500).send("Internal Server Error");
  }
}


const googleLogin = async (req, res) => {
  try {
    // console.log("login me")
    // console.log("user",req.user);
    const token = jwt.sign({ _id: req.user._id, emailId: req.user.emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: '1h' });

    // res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000
      });
    // console.log("redirect")
    res.redirect(process.env.CLIENT_URL); // step 4: redirect frontend after successful login
  }
  catch (err) {
    console.log("google login error: ", err);
    res.redirect(`${process.env.CLIENT_URL}login`);
  }
}

const githubLogin = async (req, res) => {
  try {
    console.log("user", req.user);
    const token = jwt.sign({ _id: req.user._id, emailId: req.user.emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: '1h' });

    // res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000
     });
     
    console.log("redirect");
    res.redirect(process.env.CLIENT_URL);
  }
  catch (err) {
    console.log("github login error: ", err);
    res.redirect(`${process.env.CLIENT_URL}login`);
  }
}




module.exports = { register, login, logout, deleteProfile, userProfile, leaderboard, googleLogin, githubLogin };