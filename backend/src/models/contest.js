

const mongoose = require('mongoose');
const {Schema} = mongoose;

const contestSchema = new Schema({
    name:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20,
        trim:true
    },
    description:{
        type: String,
        required: true,
        trim:true
    },
    startTime:{
        type: Date,   // data is in UTC format, not in local time
        required: true
    },
    endTime:{
        type: Date,
        required: true
    },
    problems:[{ 
        type: Schema.Types.ObjectId,
        ref: 'problem',
        // unique: true 
    }],
    participants:{
        type:[{
            type: Schema.Types.ObjectId,
            ref: 'user',
            // unique: true 
        }]
    },
    status:{
        type: String,
        enum: ['upcoming', 'ongoing', 'ended'],
        default: 'upcoming'
    }

},{
    timestamps: true
})


// ✅ Validator to ensure exactly 4 problems
contestSchema.path("problems").validate(function (problems) {
  return problems.length === 4;
}, "You must select exactly 4 problems for a contest.");

const Contest = mongoose.model('contest', contestSchema);

module.exports = Contest;