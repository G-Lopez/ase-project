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


let bn = 316228559
let email = "gal2129@columbia.edu"

Book.deleteOne({owner_email: email, isbn: bn}, function (err, doc) {
  console.log(doc);
})
