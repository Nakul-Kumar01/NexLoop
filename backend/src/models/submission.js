
const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {  // ye jisko reffer kr raha hai , usse related data bhi hmm la skte hn
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['Python', 'C++', 'Java']
    },
    status: {
        id:{
            type: Number,
            default:1
        },
        description:{
            type: String,
        default: 'pending'
        }

    },
    runtime: {
        type: Number,  // milliseconds
        default: 0
    },
    memory: {
        type: Number,  // kB
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {  
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

//Compound Indexing of both fields:
submissionSchema.index({userId:1,problemId:1}); 



const Submission = mongoose.model('submission', submissionSchema);
module.exports = Submission;