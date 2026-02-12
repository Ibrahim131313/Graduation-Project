const mongoose = require('mongoose');
const validator = require('validator')

const loginSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, index: true }, // add index for faster queries
  email: { 
    type: String, 
    required: true, 
    unique: [true, "the email is already used"],
    lowercase: true, 
    trim: true,
    validate:[validator.isEmail,"please enter a valid email"]
    // match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password:{type: String},
  role:{type: String}
}); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Login', loginSchema);