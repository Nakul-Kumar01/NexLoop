
const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const adminRegister = async (req, res) => {
    try {

        validate(req.body);

        req.body.role = "admin"; // without thisone: admin can register both user as well as admin

        
        req.body.password = await bcrypt.hash(req.body.password, 10);


        const user = await User.create(req.body);


        // no need of await
        const token = jwt.sign({ _id: user._id, emailId: req.body.emailId,role:req.body.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        res.cookie('token', token, { maxAge: 60 * 60 * 1000 }); // you can also use expire 
        res.status(201).send("admin registered successfully"); // 202 after successful post request

    }
    catch (err) {
        res.status(400).send("Error: " + err); // 400 Bad Request
    }
}


module.exports = { adminRegister };