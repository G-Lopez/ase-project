const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const auth = require('./auth')
const port = 8080
const GOOGLE_API_KEY = 'key=AIzaSyAqcJLiH6zsbV4Cc3wxs454_DBqSg5lEy4'
const DB_URI = 'mongodb://gabriel:gabrielase@ds125716.mlab.com:25716/ase-project'
const https = require('https');

//Models
const User = require('./models/user').User
const Book = require('./models/book').Book
const Request = require('./models/request').Request

//Mongoose Connection
const db = mongoose.connect(DB_URI, {useMongoClient: true})

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(auth)

//Test Mode
const testMode = process.argv[2] === 'test'

//If Test Mode, don't protect. Keeps from having to log in.
const protected = (req, res, next) => {
  // :: if testmode, then dont protect
  if (testMode) return next()

  if (req.cookies.account) {
    next()
  } else {
    return res.redirect('/login')
  }
}

app.use(express.static('./'))
app.listen($PORT)
console.log('Listening on port: ', $PORT);

app.get('/', protected, (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/*.(js|css|jpg|png)', protected, (req, res) => {
  res.sendFile(__dirname + '/views' + req.url)
})

//get user information given email. If user doesn't exist, create user with defaults.
app.get('/getUserInfo', protected, (req, res) =>{
  console.log('getUsers', req.cookies.email);
  User.findOne({
    email: req.cookies.email
  }).exec(function (err, resultingUser) {
    console.log('resulting user', resultingUser);
    console.log('typeof,', typeof(resultingUser));
    if(err){
      console.log('error with user', err);
    }else if(resultingUser == null /*|| Object.keys(resultingUser) ===0*/) { //Create new user
      let new_user_info = {
        email: req.cookies.email,
        books_added: 0,
        books_requested: 0
      }
      let new_user = new User(new_user_info)
      new_user.save(function(err) {
        if(err){
          console.log('err saving user', err);
          res.send('Error saving user')
        }
        else{
          res.send(new_user_info)
        }
      })
    }else{
      console.log('User:', resultingUser);
      res.send(resultingUser)
    }
  })
})

//Update given user field
app.post('/updateUserInfo', protected, (req, res) =>{
  console.log('THE BODY', req.body);
  fields = JSON.parse(req.body.fields)

  for (let field in fields) {
    //skip if object property
    if (!fields.hasOwnProperty(field)) continue;
    //validation
    if ((field == 'books_added' || field == 'books_requested') && (fields[field] == 1 || fields[field] == -1)) {
      incObj = {$inc: {}}
      incObj.$inc[field] = fields[field]

      User.findOneAndUpdate({email: req.cookies.email},incObj, {new: true}, function(err, user) {
        if(err) res.send('error getting updated user')
        else res.send(user)
        console.log('the updated user', user);
      })
    }
  }
})

//Get the books that correspond to a specific user
app.get('/userBooks', protected, (req, res) =>{
  Book.find({
    owner_email: req.cookies.email
  }).exec(function (err, bookList) {
    if(err) res.send('Error getting books')
    res.send(bookList)
  })
})

//Get the requests that correspond to a specific user.
app.get('/userRequests', (req,res) =>{
  requestObj = {}
  Request.find({from: req.cookies.email, status: 'Pending'}).exec(function(err, fromRequests) {
    requestObj.from = fromRequests
    if(Object.keys(requestObj).length == 2) res.send(requestObj)
  })
  Request.find({to: req.cookies.email, status: 'Pending'}).exec(function(err, toRequests) {
    requestObj.to = toRequests
    if(Object.keys(requestObj).length == 2) res.send(requestObj)
  })
})

//Get the borrow books of a specific user.
app.get('/borrowedBooks', (req, res) =>{
  Book.find({lentTo: req.cookies.email}).exec(function(err, books) {
    if(err) res.send('There was a error getting borrowed books')
    else res.send(books)
  })
})


//TItle quick search for Nav Bar
app.post('/search/:collection', (req,res) =>{
  console.log('params',req.params)
  console.log('body', req.body);
  if(req.params.collection === 'books'){
    Book.find({
      $text: {$search: req.body.title},
      status: 'Available'
    }).sort({title: 1}).exec(function(err, resultingBooks) {
      if (err) console.log('error in find', err);
      console.log(resultingBooks);
      res.send(resultingBooks)
    })
  }else res.send('Not Valid Input')
})

//Look up a book using google books api when in the process of adding a new one.
app.post('/bookLookup', (req, res) =>{
  console.log('Looking Up: ',req.body.isbn);
  let options = {
    hostname: 'www.googleapis.com',
    path: '/books/v1/volumes?' + 'q=isbn:' + req.body.isbn + '&' + GOOGLE_API_KEY
  }

  let httpsReq = https.request(options, function(response){
    let output = ''
    response.setEncoding('utf8')

    response.on('data', function (chunk) {
        output += chunk
    })

    response.on('end', function() {
      output = JSON.parse(output)
      console.log(output);
      if(output.totalItems > 0){
        res.send(output.items[0])
      }
      else{
        res.send('No results found.')
      }
    })
  })

  httpsReq.on('error', function(err) {
      res.send('error: ' + err.message)
  })
  httpsReq.end()
})

//Add a book once you have successfully looked one up
app.post('/addBook', (req,res) =>{
  let book_info = JSON.parse(req.body.book)
  let new_book = new Book({
    title: book_info.volumeInfo.title,
    authors: book_info.volumeInfo.authors.join(', '),
    isbn: Number(book_info.volumeInfo.industryIdentifiers[1].identifier),
    publisher: book_info.volumeInfo.publisher,
    pages: book_info.volumeInfo.pageCount,
    owner_email: req.cookies.email,
    status: 'Available',
    lentTo: null
  })
  new_book.save(function(err) {
    if(err){
       console.log('Error saving book', err);
       res.send('error: saving book')
     }else{
       res.send('success')
     }
  })
})

//Create a request for a book
app.post('/makeRequest', protected, (req, res) =>{
  Book.findOne({isbn:req.body.isbn}).exec(function(err, book) {
    if(err) res.send('error finding book --request')
    else{
      let new_request = new Request({
        from: req.cookies.email,
        to: req.body.owner_email,
        status: 'Pending',
        isbn: req.body.isbn,
        title: book.title,
        author: book.authors
      })
      new_request.save(function(err) {
        if(err){
          console.log('error saving request')
          res.send('error: saving request')
        }else {
          Book.findOneAndUpdate({owner_email: req.body.owner_email, isbn: req.body.isbn}, {$set: {"status": "Pending"}}, {new: true}, function(err, user) {
            res.send('success')
          })
        }
      })
    }
  })
})

//Update request on approval or denial
app.post('/updateRequest', protected, (req,res) =>{
  Request.findOneAndUpdate({from: req.body.from, to: req.cookies.email, isbn: req.body.isbn }, {$set: {"status": req.body.new_status}}, {new: true}, function(err, request) {
    console.log(request);
    if(req.body.new_status == 'Approved'){
      Book.findOneAndUpdate({owner_email: req.cookies.email, isbn: req.body.isbn, status: 'Pending'}, {$set: {'status': 'Borrowed', lentTo: req.body.from}}, {new: true}, function (err, book) {
        if(err) res.send('Failed to update book')
        console.log('Updated Book', book)
        User.findOneAndUpdate({email: req.cookies.email}, {$inc: {'books_added': -1}}, function (err, user1) {
          if(err)res.send('error updating user')
          User.findOneAndUpdate({email: req.body.from}, {$inc: {'books_requested': -1}}, function (err, user2) {
            if(err)res.send('error updating user')
            res.send('success')
          })
        })
      })
    }
    else if(req.body.new_status == 'Denied'){
      Book.findOneAndUpdate({owner_email: req.cookies.email, isbn: req.body.isbn, status: 'Pending'}, {$set: {'status': 'Available'}}, {new: true}, function (err, book) {
        if(err) res.send('Failed to update book')
        console.log('Updated Book', book)
        User.findOneAndUpdate({email: req.body.from}, {$inc: {'books_requested': -1}}, function (err, user) {
          console.log('finishing up denial');
          if(err)res.send('error updating user')
          res.send('success')
        })
      })
    }
    else res.send('Not Correct formatting')
  })
})

//Delete request
app.post('/deleteRequest', protected, (req,res) =>{
  Request.deleteOne({from: req.cookies.email, to:req.body.to, isbn: req.body.isbn}, function (err, doc) {
    if(err) res.send('error deleting')
    else res.send('deleted')
  })
})

app.post('/advancedSearch', (req, res) =>{
  formInputs = JSON.parse(req.body.mongo)
  mongoObj = {status: 'Available'}

  if(formInputs.title) mongoObj.$text = {$search: formInputs.title}
  if(formInputs.author){
    regexExpression = null
    formInputs.author.split(/[ ,.]+/).forEach(function(word) {
      temp = new RegExp('(?=.*\\b' + word + '\\b)')
      regexExpression = regexExpression !== null ? new RegExp(regexExpression.source + temp.source) : temp
    })
    mongoObj.authors = {$regex: regexExpression, $options: 'ig'}
   }
  if(formInputs.isbn) mongoObj.isbn = formInputs.isbn
  if(formInputs.publisher) mongoObj.publisher = {$regex: formInputs.publisher, $options: 'ig'}
  if(formInputs.page) mongoObj.pages = {$gte: formInputs.page}

  Book.find(mongoObj).exec(function(err, resultingBooks) {
    if (err) console.log('error in find', err);
    console.log(resultingBooks);
    res.send(resultingBooks)
  })
})
