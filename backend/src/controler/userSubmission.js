const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getIdByLanguage, submitBatch, submitToken } = require("../utils/problem_Utility");

// function wrapCode(language, userCode, problem) {
//     // Get complete reference solution for this 
//     console.log("here")
//     const ref = problem.referenceSolution.find(sol => sol.language === language);
//     if (!ref) return userCode; // fallback
//     const complete = ref.completeCode;
//     console.log("here2")
//     if (language === "C++") {
//         // Split user code + extract main from reference
//         const mainIndex = complete.indexOf("int main()");
//         const headers = "#include <bits/stdc++.h>\nusing namespace std;\n\n";
//         const mainPart = complete.slice(mainIndex);
//         return headers + userCode + "\n\n" + mainPart;
//     }

//     if (language === "Java") {
//         // Extract Main class from reference
//         const mainIndex = complete.indexOf("public class Main");
//         const mainPart = complete.slice(mainIndex);
//         return userCode + "\n\n" + mainPart;
//     }
//    console.log("hii")
//     if (language === "JavaScript") {
//         console.log("hii")
//         // In JS, completeCode starts with `'use strict';`
//         const funcIndex = complete.indexOf("console.log");
//         const wrapperPart = complete.slice(funcIndex);
//         return "'use strict';\n" + userCode + "\n\n" + wrapperPart;
//     }

//     return userCode;
// }



const submitCode = async (req, res) => {

    try {

        const userId = req.result._id;
        const problemId = req.params.id;

        let { code, language } = req.body;
        if (!userId || !problemId || !code || !language)
            return res.status(400).send("some fields missing");

        if(language === "cpp") language = "C++";
        if(language === "python") language = "Python";
        if(language === "java") language = "Java";
    //   console.log("done1")
      

        //Fetch problem from database
        const problem = await Problem.findById(problemId);
        //   console.log("done2")
        // Before giving code to Judge0, we will store the code in our database( since if judge0 gets failed then we can make another request by fetching code from our database) // jo bhi data frontend se aaye vo mere database mei store hona chaiye
        // once we get result from judge0, we will update it in our database
        // but in this approach we hv to make two request to our database // abb kuch compromise tho krna padega hi
        const submitResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassed: 0,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length
        })

        // console.log("done3")
        // console.log(language, code);
        if(language === "C++")
         code = problem.startCode[0].HeaderCode + "\n" + code + "\n" + problem.startCode[0].FooterCode;
        if(language === "Java")
         code = problem.startCode[1].HeaderCode + "\n" + code + "\n" + problem.startCode[1].FooterCode;
        if(language === "Python")
         code = problem.startCode[2].HeaderCode + "\n" + code + "\n" + problem.startCode[2].FooterCode;
        // const finalCode = wrapCode(language, code, problem);
        // console.log(finalCode);
        // submit code to judge0
        const languageId = getIdByLanguage(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        // console.log(submissions);

        const getToken = await submitBatch(submissions);
        // console.log(getToken);
        // console.log("submitBatch done");

        const resultToken = getToken.map(value => value.token);

        const testResult = await submitToken(resultToken);
        // console.log("submitToken done");
        // console.log(testResult);
        // console.log("done4")

        // time : will be time taken by all testCases to run
        // memory: will be the maximum memory used by any testCase

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = null;
        let errorMessage = null;

        for(const test of testResult){
            if(test.status_id  == 3){
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory,test.memory);
            }else{  
                    status = test.status;
                    errorMessage = test.compile_output;
            }
        }

        if(!status){
            status = {
                id:3,
                description: "Accepted"
            }
        }

        // Store the result in Database in Submission 
        submitResult.status = status;
        submitResult.testCasesPassed = testCasesPassed;
        submitResult.errorMessage = errorMessage;
        submitResult.runtime = runtime;
        submitResult.memory = memory;

        await submitResult.save();


        //now check whether this problem is present in solvedProblem or not in user Collection
        // if not then save this problem in solvedProblem
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save(); // since, req.result contains Document of user
        }
        // console.log("done5")
        // console.log(submitResult);
        res.status(201).send(submitResult);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }

};

const runCode = async(req,res) =>{
      try {
        //  console.log("runCode called")
        const userId = req.result._id;
        const problemId = req.params.id;

        let { code, language } = req.body;
        // console.log("done0")
        if (!userId || !problemId || !code || !language)
            return res.status(400).send("some fields missing");

        // console.log("done1")
        // console.log(language,code,  problemId, userId);
        if(language === "cpp") language = "C++";
        // console.log("cpp");
        if(language === "python") language = "Python";
        // console.log("python");
        if(language === "java") language = "Java";
        // console.log("java");
        // console.log("hii")
        //Fetch problem from database
        const problem = await Problem.findById(problemId);
        // we will not store this in our database

         if(language === "C++")
         code = problem.startCode[0].HeaderCode + "\n" + code + "\n" + problem.startCode[0].FooterCode;
        if(language === "Java")
         code = problem.startCode[1].HeaderCode + "\n" + code + "\n" + problem.startCode[1].FooterCode;
        if(language === "Python")
         code = problem.startCode[2].HeaderCode + "\n" + code + "\n" + problem.startCode[2].FooterCode;

        // submit code to judge0
        const languageId = getIdByLanguage(language);
    //    console.log(language,code);
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        //  console.log("done2")
        //  console.log(submissions);
        const getToken = await submitBatch(submissions);
        //   console.log("done3")
        //   console.log(getToken);
        const resultToken = getToken.map(value => value.token);
// console.log(resultToken);



        const testResult = await submitToken(resultToken);
        // console.log(testResult);


        let runResult =[];

        for(const test of testResult){
            if(test.status_id  == 3){
                runResult.push({status:test.status,output: test.stdout,compileErr: test.compile_output}); // correct answer
            }else{           
                runResult.push({status:test.status,output: test.stdout,compileErr: test.compile_output}); // error in code
            }
        }


        res.status(201).send(runResult);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};


module.exports = { submitCode, runCode};