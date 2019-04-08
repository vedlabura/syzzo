const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid/v4');







const Schema = mongoose.Schema;
const port = 3000;
const app = express();



var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var path = require('path');
//var User   = require('./models/user'); // get our mongoose model





//mongoose.connect(config.database,{useNewUrlParser: true});


app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));





app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/makeDatabase/registerAgent.html'));
});







app.get('/datastore', function(req, res){


  res.send('hello world');
});



app.use('/api/*', function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, foo, function(err, decoded) {       if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });       } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;         next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});


app.get('/api/abc', function(req,res) {
	res.send('Verified');
});

app.get('/api/abc/ds', function(req,res) {
	res.send('Verifi');
});


app.post('/login/user', function(req,res) {
	var PostData = JSON.parse(req.body.PostData)
	console.log(typeof PostData);
	console.log(PostData.number);

	res.send(req.body);


});

app.post('/login/worker', function(req,res) {

	res.send("Worker Login")


});

app.post('/login/manager', function(req,res) {

	res.send("Manager Login")


});






app.listen(port);
console.log("Server running at " + port)
