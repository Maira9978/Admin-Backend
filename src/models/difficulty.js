const mongoose = require('mongoose');

const DifficultySchema = new mongoose.Schema({
  dName: {
    type: String,
    required:true,
    unique: true
}
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Difficulty', DifficultySchema);