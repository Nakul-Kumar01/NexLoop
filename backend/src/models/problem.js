
const mongoose =require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true
    },
    tags:[{
        type:String,
        required:true
    }],

    bookMark:{
        type:Boolean,
        default:false
    },

    startCode:[
        {
            language:{
                type:String,
                required:true
            },
            HeaderCode:{
                type:String,
                required:true
            },
            UserCode:{
                type:String,
                required:true
            },
            FooterCode:{
                type:String,
                required:true
            }
        }
    ],

    companies:[{
        type:String,
        required:true
    }],

    hint:[{
        type:String,
        required:true
    }],

    visibleTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true
            },
            SolutionClass:{  
                type:String,
                required:true
            }
        }
    ],

    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    similarProblem:[{
        problemId:{
            type: Schema.Types.ObjectId,
            ref: 'problem',
            required: true
        },
        title:{
            type:String,
            required:true
        }
    }],
    constraints:{
        type:[{
            type:String,
        }]
    }
})

const Problem = mongoose.model('problem',problemSchema);
module.exports = Problem;






