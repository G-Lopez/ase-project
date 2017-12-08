const mongoose = require('mongoose');

const Request = mongoose.model('Request', {
  from: {type: String, required:true, index:true},
  to: {type: String, required:true},
  status: {type: String, required: true},
  isbn: {type: String, required: true},
  title: {type: String, required: true},
  author: {type: String, required: true}
})

module.exports = {Request}
