const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  tName: {
    type: String,
    required:true,
    unique: true
},
locked:{
  type:Boolean,
  default:true,
  
}, 

assessmentCompleted:{
  type:Boolean,
  default:false,
},
highestScore:{
  type:Number,
  default:0,

},
stage:{
  type:String,
  default:"S1"
},
skillLevel:{
  type:Number,
  default:0,
    },
averageScore:{
  type:Number,
  default:0,
    },
createdAt: {
  type: Date,
  default: Date.now
}
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Topic', TopicSchema);

