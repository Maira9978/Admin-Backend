const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  cName: {
    type: String,
    required:true,
    unique: true
},
createdAt: {
  type: Date,
  default: Date.now
},
}, {
  toJSON: {
    virtuals: true,
  },
 
});

module.exports = mongoose.model('Category', CategorySchema);