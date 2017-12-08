const mongoose = require('mongoose');

const Book = mongoose.model('Book', {
  title: {type: String, required: true, index: true},
  authors: {type: String, required: true},
  isbn: {type: Number, required: true},
  publisher: {type: String, required: true},
  pages: {type: Number, required: true},
  owner_email: {type: String, required: true},
  status: {type: String, required: true},
  lentTo: {type: String}
})

module.exports = {Book}
