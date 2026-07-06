
const mongoose = require('mongoose');
const {Schema} = mongoose;

const contestUserSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    contestId:{
        type:Schema.Types.ObjectId,
        ref:'contest',
        required:true
    },
    attempt:{
        type:Boolean,
        default:false
    },
    points:{
        type:Number,
        default:0
    },
    solvedProblems:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        default:[]
    }
},{
    timestamps: true
});

const ContestUser = mongoose.model('contestUser',contestUserSchema);
module.exports = ContestUser;