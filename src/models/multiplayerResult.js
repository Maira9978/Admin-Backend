const mongoose = require('mongoose');

const MultiplayerResultSchema = new mongoose.Schema({
  players: [{
    type: Map,
    of:{

    progress:[{
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
        timeTaken:{
            type:Number,
            required:true,
        },
        IsCorrect:{
            type:Boolean,
            required:true
        }

    }],
  
    Total_Score:{
        type:Number,
        required:true
    }
}}],
winner:{
    type: mongoose.Schema.Types.ObjectId, ref: 'user',
    required:true
},

}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('multiplayerResult', MultiplayerResultSchema);