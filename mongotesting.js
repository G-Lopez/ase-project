const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const auth = require('./auth')
const port = 3000
const GOOGLE_API_KEY = 'key=AIzaSyAqcJLiH6zsbV4Cc3wxs454_DBqSg5lEy4'
const DB_URI = 'mongodb://gabriel:gabrielase@ds125716.mlab.com:25716/ase-project'
const https = require('https');

//Models
const User = require('./models/user').User
const Book = require('./models/book').Book
const Request = require('./models/request').Request

//Mongoose Connection
const db = mongoose.connect(DB_URI, {useMongoClient: true})


let isbn = 1408865459
let owner_email = "kaa2171@columbia.edu"
Book.findOne({
  isbn: isbn,
  owner_email: owner_email,
  status: { $in: ['Pending', 'Available'] }
}).exec(function (err, book) {
  if(err) console.log('errrrrr');
  if(book) console.log('ALready Exists');
  else {
    console.log('yipyip!');
  }
})
