
const express = require('express');
const { createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblems,problemSubmissions,userSubmissionHistory } = require('../controler/user_problem');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const problemRouter = express.Router();

 
// by admin only
problemRouter.post('/create',adminMiddleware, createProblem);
problemRouter.patch('/update/:id',adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id',adminMiddleware, deleteProblem);


// by both
problemRouter.get('/problemById/:id',userMiddleware, getProblemById);  
problemRouter.get('/getAllProblem',userMiddleware, getAllProblem);
problemRouter.get('/problemSolvedByUser',userMiddleware, solvedProblems);
problemRouter.get('/problemSubmissions/:pid',userMiddleware,problemSubmissions);
problemRouter.get('/userSubmissionHistory',userMiddleware,userSubmissionHistory);


module.exports = problemRouter;

