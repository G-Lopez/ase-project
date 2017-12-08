const mongoose = require('mongoose');

const User = mongoose.model('User', {
  email: {type: String, required: true, unique: true, index:true},
  books_added: {type: Number, required: true},
  books_requested: {type: Number, required: true}
})

module.exports = {User}
