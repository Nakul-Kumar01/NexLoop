const User = require("../models/user");
const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');

const userMiddleware = async (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) throw new Error('No token provided');

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const { _id } = payload;

        if (!_id) throw new Error('Invalid token');

        const user = await User.findById(_id);

        if (!user) throw new Error('User not found');

        // now check if this token is in blocklist or not of Redis
        // if present, don't move further
        const IsBlocked = await redisClient.exists(`token:${token}`);
        if (IsBlocked)
            throw new Error("Invalid Tokenn");

        
        req.result = user;

        // console.log("yes")
        next(); // next vale pe chale jao
    }
    catch (err) {
        return res.status(401).send("Unauthorized: " + err.message);
    }
}

module.exports = userMiddleware;