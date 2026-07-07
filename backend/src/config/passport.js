let passport = require('passport');
const User = require('../models/user');
let GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require("passport-github2").Strategy;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,  // step 0: store these so that you can redirect to backend from google login page
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://nexloop.onrender.com/user/google/callback"  // this should be same in google cloud console's redirect URI and Backend route
},
    async (accessToken, refreshToken, profile, cb) => { // At this moment, google has already authenticated the user. Passport now asks you:“What should I do with this user?” 
    //after getting permission from user, google will redirect to this callback URL with accessToken, refreshToken and profile info
    // problem : agr phale kisi ne normal login kiya , then same email se google login krega to error dega
        try {
            console.log("in passport")
            console.log("Google profile:", profile);
            let user = await User.findOne({ googleId: profile.id });
            console.log(user);
            if (!user) {
                user = await User.create({
                    firstName: profile.displayName || null,
                    emailId: profile.emails[0].value || null,
                    googleId: profile.id || null,
                    avatar: profile.photos[0].value || null
                })
            }

            return cb(null, user);
        }
        catch (err) {
            if (err.code === 11000) {
                return cb("Email already registered. Try a different email.", null);
            }
            console.log(err);
            return cb(err, null);
        }
    }
));




passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://nexloop.onrender.com/user/github/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        // accessToken: A temporary GitHub token // Allows your server to call GitHub APIs Used to fetch email, repos, etc.
        // refreshToken: Used to get a new accessToken later // GitHub usually does NOT provide this
        // profile: User’s public GitHub info
        // done: Callback function provided by Passport // Signature of done: done(error, user, info)
        try {
            console.log(profile);
            let email = profile.emails?.[0]?.value;

            if (!email) {
                console.log(accessToken)
                const res = await fetch("https://api.github.com/user/emails", {
                    headers: {
                        Authorization: `token ${accessToken}`,
                    },
                });
                const emails = await res.json();
                console.log(emails);
                email = emails.find(e => e.primary && e.verified)?.email || null;
            }

            let user = await User.findOne({ githubId: profile.id });
            if (!user) {
                user = await User.create({
                    firstName: profile.displayName || null,
                    emailId: email || null,
                    githubId: profile.id || null,
                    avatar: profile.photos[0].value || null
                })
            }
            return done(null, user);
        }
        catch (err) {
            if (err.code === 11000) {
                return done("Email already registered. Try a different email.", null);
            }
            console.log("github login error: ", err);
            return done(err, null);
        }
    }
));