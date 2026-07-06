
const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problem_leet');
const submitRouter = require('./routes/submit');
const cors = require('cors');
const aiRouter = require('./routes/aiChat');
const videoRouter = require('./routes/videoCreator');
const contestRouter = require('./routes/contest');
const userMiddleware = require('./middleware/userMiddleware');
const AiInterview = require('./controler/AiInterview');
require('./config/passport');



// explicitly allows it with CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: [
    "http://localhost:5173",
    "https://nexloops.xyz",
    "https://www.nexloops.xyz"
  ], // whatever data will be given by this backend can be accessible by this IP
    // origin: '*', // now browser will allow all type of request to access this backend 
    credentials: true
}))


app.use(express.json());
app.use(cookieParser());


app.use('/user', authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use("/contest",contestRouter);
app.use("/interview",userMiddleware,AiInterview);
app.get("/health", (req, res) => {  // wakeup backend
  res.status(200).json({
    status: "ok",
    message: "Server is running"
  });
});


const InitializeConnection = async () => {
    try {

        await Promise.all([redisClient.connect(),main()]); // parallelly connect to Mongo and Redis
        console.log("Connected to DB");

        app.listen(process.env.PORT, () => {
            console.log("server is Listening on port " + process.env.PORT);
        })
    }
    catch (err) {
        console.error("Error: " + err);
    }
}

InitializeConnection();



// main()
// .then(async ()=>{
//     console.log("Connected to DB");
//     app.listen(process.env.PORT , ()=>{
//     console.log("server is Listening on port " + process.env.PORT);
//     })
// })
// .catch(err => console.log("Error: " + err));

