const {createContest,updateContest,deleteContest,joinContest,getContestDetails,codeSubmission,getUserScoreInContest,getUserContestHistory,contestLeaderboard,allContests} = require('../controler/contestControl');

const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

const contestRouter = express.Router();

// for admin
contestRouter.post('/create',adminMiddleware,createContest);
contestRouter.patch('/update/:id',adminMiddleware,updateContest);
contestRouter.delete('/delete/:id',adminMiddleware,deleteContest);


// for Both user and admin
contestRouter.get('/allContests',userMiddleware,allContests);
contestRouter.post('/:id/join',userMiddleware,joinContest);
contestRouter.get('/:id',userMiddleware,getContestDetails);
contestRouter.post('/:id/submitcode',userMiddleware,codeSubmission);
contestRouter.get('/:id/userScore',userMiddleware,getUserScoreInContest);
contestRouter.get('/:id/userContestHistory',userMiddleware,getUserContestHistory);
contestRouter.get('/:id/leaderboard',userMiddleware,contestLeaderboard);
  

module.exports = contestRouter;
