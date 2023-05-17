const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    required:true,
},
    Options_Res:[{
        question_id:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Question',
        required:true
        },
        selected:{
            type:String,
            default:"Not Selected"
        },
        
        
       difficulty:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Difficulty',
        required:true
       },
        // time:{
        //     type:Integer,
        //     required:true,
        // },
        IsCorrect:{
            type:Boolean,
            required:true
        }

    }],
    stage:{
      type:String,
      default:"S1"
    },
    Total_Score:{
        type:Number,
        required:true
    }


}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Result', ResultSchema);