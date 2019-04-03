const express = require('express');
//const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid/v4');


const {OAuth2Client} = require('google-auth-library');
const {Storage} = require('@google-cloud/storage');
const {Datastore} = require('@google-cloud/datastore');
 
const projectId = 'elite-striker-235712';
 const storage = new Storage({
  projectId: projectId,
});
 
// The name for the new bucket



async function addUser(id) {
  // Your Google Cloud Platform project ID
 
  // Creates a client
  const datastore = new Datastore({
    projectId: projectId,
  });
 
  // The kind for the new entity
  const kind = 'User';
  // The name/ID for the new entity
  const name = 'user1';
  // The Cloud Datastore key for the new entity
  const taskKey = datastore.key([kind, name]);
 
  // Prepares the new entity
  const task = {
    key: taskKey,
    data: {
      description: id,
    },
  };
 
  // Saves the entity
  await datastore.save(task);
  console.log(`Saved ${task.key.name}: ${task.data.description}`);
}









//const Schema = mongoose.Schema;
const port = 3000;
const app = express();
const CLIENT_ID = '380819953719-80i33k9lm1i5iu893rpqcgu2kl0mma5a.apps.googleusercontent.com';


var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
//var User   = require('./models/user'); // get our mongoose model





//mongoose.connect(config.database,{useNewUrlParser: true});


app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));



//Schemas for various objects...


//Models

//var salon = mongoose.model('salon', salonSchema);
//var user = mongoose.model('user', userSchema);
//var worker = mongoose.model('worker', workerSchema);









app.get('/datastore', function(req, res){

	quickStart();



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


app.post('/reg', function(req,res) {
const client = new OAuth2Client(CLIENT_ID);
var p = JSON.parse(req.body.PostData);

async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: p.idToken,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
 	console.log(typeof payload);
 	console.log(payload);
 	addUser(payload['email']);
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}
verify().catch(console.error);
});





app.listen(port);
console.log("Server running at " + port)
