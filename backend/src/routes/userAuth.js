
const express = require('express');
const {register,login,logout,deleteProfile,userProfile,leaderboard,googleLogin,githubLogin} = require('../controler/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {adminRegister} = require('../controler/adminAuthent');
const passport = require('passport');


const authRouter = express.Router();


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout', userMiddleware,logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister); // admin can register another admin
// authRouter.get('/getProfile',getProfile);

authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/MyProfile',userMiddleware,userProfile);
authRouter.get('/Leaderboard',userMiddleware,leaderboard);
authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        createdAt: req.result.createdAt
    }

    res.status(200).json({
        user: reply,
        message: "valid user"
    })
})



// Login with Google:
authRouter.get("/google", passport.authenticate("google",{scope:["profile","email"]}));  // step 1: redirect to google for authentication: choose your google account and give permission to our app and then redirect to callback URL (that we hv taken from googleStrategy and matches with redirect URI in google cloud console)

authRouter.get("/google/callback",  
     passport.authenticate("google",{session: false}), // step 2: this code Executes GoogleStrategy callback(passport.js ka callback) and Sets `req.user`, otherwise req.user will be undefined
      googleLogin); // step 3: after passport's callback it will redirect to this route


// Login with GitHub:
authRouter.get("/github", passport.authenticate("github",{scope:["profile","user:email"]}));
authRouter.get("/github/callback",  
     passport.authenticate("github",{session: false}),
      githubLogin);

module.exports = authRouter; // ye export hota hai