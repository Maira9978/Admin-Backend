const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adminSchema = new mongoose.Schema({
   firstName: {
    type: String,
    required: true,
    trim: true, // remove wide spaces
    min:3, 
    max:20
   },

   lastName: {
    type: String,
    required: true,
    trim: true, // remove wide spaces
    min:3, 
    max:20
   },
   username: {
    type: String,
    
    trim: true,
    unique: true,
    index: true,
    lowercase: true
   },
   email: {
    type: String,
    required:true,
    trim:true,
    unique:true,
    lowercase: true
   },
   hash_password: {
    type: String,
    required: true,
   },
   role: {
    type: String,
    enum: ['user','admin'],
    default:'admin'
   },
   contactNumber:{ type: String},
   profilePicture: {
    type: String,
    default: "",
  }

},{timestamps: true});

adminSchema.virtual ('password')
.set(function(password){
    this.hash_password= bcrypt.hashSync(password,10);
});
adminSchema.virtual('fullName')
.get(function(){
  return `${this.firstName}${this.lastName}`;
});
adminSchema.methods = {
    authenticate: function(password){
        return bcrypt.compareSync(password,this.hash_password);
    }
}
module.exports = mongoose.model('Admin', adminSchema);