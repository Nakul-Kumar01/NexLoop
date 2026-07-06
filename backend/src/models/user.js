
const mongoose =require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,     
        immutable:true
    },
    age:{
        type:Number,
        min:6,
        max:80
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
            unique:true
        }],
        // default: []
    },
    password:{
        type:String,
        
    },
    googleId:{  // to find whether this user is already login or not in passport.js , if not find then create the user
        type:String
    },
    avatar:{
        type:String
    },
    githubId:{
        type:String
    }
},{
    timestamps:true
});


// findOneAndDelete is mongoDB function
userSchema.post('findOneAndDelete', async function(userInfo){  // this function will be called after user is deleted only
    if(userInfo){
        await mongoose.model('submission').deleteMany({userId: userInfo._id});
    }
})

const User = mongoose.model('user', userSchema);

module.exports = User;

