const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const uuid = require('uuid/v4');
var config = require('./config'); // get our config file
var path = require('path');
var multer = require('multer');
var request = require("request");
var fs = require('fs');
const app = express();
const Schema = mongoose.Schema;


const PORT = config.port;
const DEST = config.destination;
const KEY = config.key;



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DEST)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now()+'.jpeg')
  }
})

var upload = multer({ storage: storage })







//Schemas are defined below

//Employee schema
var employeeSchema = Schema({ 
    name: String, 
    phoneNo: Number, 
    agentKey: String,
    salonsAquired: Number,
    employeeNo: Number
});

employeeSchema.pre("save", function (next) {
    var doc = this;
    counterModel.findByIdAndUpdate(
        { "_id": "employeeNo" }, 
        { "$inc": { "seq": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.employeeNo = counterModel.seq;
        doc.agentKey = doc.agentKey + "no-" + counterModel.seq;
        next();
    });
});


//Salon Schema

var salonSchema =  Schema({ 
    name: String, 
    phoneNo:{type: Number, index : true}, 
    address: String,
    location: {
    	type: {
      		type: String, // Don't do `{ location: { type: String } }`
      		enum: ['Point'], // 'location.type' must be 'Point'
      		required: true
    		},
    	coordinates: {
      		type: [Number],
      		required: true
    	}
    },
    numberOfStylists: Number,
    stylistId:[String],
    services:Object,
    salonNo: Number,
    salonId:String,
    agentId:String,
    rating:Number,
    noOfRating:Number,
    photoId:String,
});
salonSchema.index({ "location": "2dsphere" });
salonSchema.pre("save", function (next) {
    var doc = this;
    counterModel.findByIdAndUpdate(
        { "_id": "salonNo" }, 
        { "$inc": { "seq": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.salonNo = counterModel.seq;
        next();
    });
});


//User Schema

var userSchema =  Schema({ 
    name: String,
    gender: Boolean, 
    phoneNo: {type: Number, index : true}, 
    hairType: Object,
    location: [Number],
    lastService: String,
    lastServiceDate: Date,
    stylistId:[String],
    preferedServices:[String],
    userNo: Number,
    userId:String,

    salonId:String,
    moreAData:Object,
});


userSchema.pre("save", function (next) {
    var doc = this;
    counterModel.findByIdAndUpdate(
        { "_id": "userNo" }, 
        { "$inc": { "seq": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.userNo = counterModel.seq;
        next();
    });
});





//Stylist Schema NOT COMPLETE

var stylistSchema =  Schema({ 
    name: String, 
    phoneNo: {type: Number, index :true},
    salonId:String,
    clients:[String],
    stylistId: String,
    stylistNo: Number,
    rating:Number,
    noOfRating:Number,
    photoId:String,
});


stylistSchema.pre("save", function (next) {
    var doc = this;
    counterModel.findByIdAndUpdate(
        { "_id": "stylistNo" }, 
        { "$inc": { "seq": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.stylistNo = counterModel.seq;
        next();
    });
});


//Booking schema
var bookingSchema = Schema({ 
    userId: {type: String, index :true},
    bookingNo: Number, 
    salonId: String,
    services: [String],
    status: Number,
    stylistId:String,
    bookingId:String,
});

bookingSchema.pre("save", function (next) {
    var doc = this;
    counterModel.findByIdAndUpdate(
        { "_id": "bookingNo" }, 
        { "$inc": { "seq": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.bookingNo = counterModel.seq;
        next();
    });
});













//Here are the various mongoose models used 


const counterModel= mongoose.model('counter', new Schema({ 
	_id:{type: String, required: true},
    seq: {type: Number, default : 0}, 
}));



const employeeModel = mongoose.model('employee',employeeSchema);
const userModel = mongoose.model('user',userSchema);
const salonModel = mongoose.model('salon',salonSchema);
const stylistModel = mongoose.model('stylist',stylistSchema);
const bookingModel = mongoose.model('booking',bookingSchema);







mongoose.connect(config.database, {useNewUrlParser: true});














app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) 
app.use("/media", express.static(__dirname + '/uploads'))








var salonUpload = upload.fields([{ name: 'salonPhoto', maxCount: 2 }, { name: 'stylistPhoto', maxCount: 8 }])

app.post('/test2', salonUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
  console.log(req.files['salonPhoto'][0].filename)
  res.send(req.body);
})

app.post('/test', function(req, res) {
	/*request.post(
    'http://2factor.in/API/V1/e4e06174-56cd-11e9-a6e1-0200cd936042/ADDON_SERVICES/SEND/TSMS',
    { json: { From: 'SYZAAA',
    		  To: '8146783316',
    		  TemplateName: 'Transac1',
    		  VAR1:'1234' 	 } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }
); */
res.send(req.file);
});



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/homePage.html'));
});

app.get('/admin/registerSalon', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/registerSalon.html'));
});

app.get('/admin/listEmployee', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/listEmployee.html'));
});

app.get('/admin/listStylist', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/listStylists.html'));
});

app.get('/admin/listSalon', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/listSalons.html'));
});


app.get('/admin/registerEmployee', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/registerEmployee.html'));
});


app.get('/admin/deleteEmployee', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/deleteEmployee.html'));
});




















app.post('/admin/registerEmployee', function(req, res) {
	var emp = req.body;
	if(emp.key !=KEY){
		res.send("Invalid key");
	}
	else{
 
    	   	var password =uuid();
			password = password + "syzzo-";
			var employee = new employeeModel({     name: emp.name,
			   									   phoneNo: emp.phoneNo,
			   									   agentKey: password ,
			   									   salonsAquired : 0 
			   									});
    		employee.save(function (err, employee1) {
      			if (err) {
      				return console.error(err);
      				}
      			res.send("Added successfully!")
      		
    			}); 	
	}
});



app.post('/admin/registerSalon', salonUpload, function(req, res) {
	var data = req.body;
	employeeModel.findOne({ agentKey: data.agentKey }).exec(function (err, adventure) {
		if(err){
			console.log(err);
			res.send(err);
		}
		else if(adventure==null)
			res.send("Invalid Agent Key!");
		else{
			var data = req.body;
			var salonUuid = uuid();
			var stylistUuid = [];
			var stylist = [];

			for (i = 0; i < data.numberOfStylists; i++) {
  				stylistUuid[i] = uuid();
  				stylist[i] = new stylistModel({
  				    							name: data.stylistName[i], 
    											phoneNo: data.stylistPhoneNo[i], 
    											salonId:salonUuid,
    											stylistId: stylistUuid[i],
    											rating:0,
    											noOfRating:0,
    											photoId:req.files['stylistPhoto'][i].filename,
  											});
  				stylist[i].save(function (err, employee1) {
      			if (err) {
      				return console.error(err);
      				}
      			console.log("Added successfully!");
      			}); 

			}    




// do the services here










		    var salon = new salonModel({	name: data.salonName, 
   											phoneNo: data.salonPhoneNo, 
    										address: data.address,
    										location:{type: 'Point',coordinates: [data.longitude,data.latitude]},
   											numberOfStylists: data.numberOfStylists,
    										stylistId: stylistUuid,
    										services: null,
    										salonId: salonUuid,
    										agentId: data.agentKey,
    										rating: 0,
    										noOfRating: 0,
    										photoId: req.files['salonPhoto'][0].filename,
		    							});
		    salon.save(function (err, employee1) {
      			if (err) {
      				return console.error(err);
      				}
      			console.log("Added successfully!");
      		
    			}); 
		    res.send("Success");
		    		
		}
	});
	
	
});




app.post('/admin/listEmployee', function(req, res) {
		if(req.body.key ==KEY){
			employeeModel.find().lean().exec(function (err, users) {
				// console.log(typeof users);
				// console.log(users.length);
				// console.log(typeof users.length);
    		    res.send(users);
            });
		}
		else res.send("Invalid key")
});


app.post('/admin/listStylist', function(req, res) {
		if(req.body.key ==KEY){
			stylistModel.find().lean().exec(function (err, users) {
				// console.log(typeof users);
				// console.log(users.length);
				// console.log(typeof users.length);
    		    res.send(users);
            });
		}
		else res.send("Invalid key")
});


app.post('/admin/listSalon', function(req, res) {
		if(req.body.key ==KEY){
			salonModel.find().lean().exec(function (err, users) {
				// console.log(typeof users);
				// console.log(users.length);
				// console.log(typeof users.length);
    		    res.send(users);
            });
		}
		else res.send("Invalid key")
});




app.post("/admin/deleteEmployee", function(req, res) {

	if(KEY==req.body.key){
    	employeeModel.findByIdAndDelete(req.body.id, (error, data)=>{
        	if(error){
      
            	console.log("error in deleting yo!");
            	throw error;
            }
        	 else {
        
            	console.log("data all gone and deleted yo");
            	res.send("Done");
            }
        });
    }
    else res.send("Invalid key");
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




app.listen(PORT);
console.log("Server running at " + PORT)
