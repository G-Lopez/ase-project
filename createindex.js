const mongodb = require('mongodb');
const DB_URI = 'mongodb://gabriel:gabrielase@ds125716.mlab.com:25716/ase-project'


mongodb.MongoClient.connect(DB_URI, (err, db) =>{


//db.collection('books').ensureIndex({title: 'text'}, function(err, data) {
  //console.log(data);
//})
db.collection('books').indexInformation(function (err, data) {
  console.log(data);
})

db.collection('books').findOne({}, function(err, data) {
  console.log(data);
})

})
