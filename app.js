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
var schedule = require('node-schedule');


    var FCM = require('fcm-node')
    
    var serverKey = require('./syzzostylist-firebase-adminsdk-c7zdv-edf420abef.json');
    var fcm = new FCM(serverKey)


const PORT = config.port;
const DEST = config.destination;
const KEY = config.key;



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DEST)
  },
  filename: function (req, file, cb) {
    cb(null,  'syzzo' + Date.now() + file.originalname)
  }
})

var upload = multer({ storage: storage })

function generateRandom(n) {
        var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

        if ( n > max ) {
                return generate(max) + generate(n - max);
        }

        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;

        return ("" + number).substring(add); 
}







//Schemas are defined below

//Employee schema
var employeeSchema = Schema({ 
    name: String, 
    phoneNo: Number, 
    agentKey: String,
    salonsAquired: Number,
    employeeNo: Number,
    EmailId: String,
    Designation:String,
	AreaSupervision: String,
	photo: String,

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
    workingHours: Object,
    pinCode:Number,
    numberOfStylists: Number,
    stylistId:[String],
    services:Object,
    salonNo: Number,
    salonId:String,
    agentId:String,
    rating:Number,
    noOfRating:Number,
    photoId:String,
    bankDetails:Object,
    fireBaseToken:String,
    discount:{type: Number, default: 0},
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
    gender: Boolean, // 0=male 1=female
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
    fireBaseToken:String,
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

var tempUserSchema =  Schema({ 
	sessionActivity:    { type: Date, expires: '600s' },
    name: String,
    gender: Boolean, 
    phoneNo: {type: Number, index : true}, 
    otp:String,
    userId: String,
});


tempUserSchema.pre("save", function (next) {
    var doc = this;
    doc.sessionActivity = new Date();
    next();
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
    fireBaseToken:String,
});


stylistSchema.pre("save", function (next) {
    var doc = this;
	
	var bookingtraker = new bookingTrackerModel({	stylistId:doc.stylistId, //here this is equal to stylistId
													salonId: doc.salonId,
		    							});
		    bookingtraker.save(function (err, docu) {
      			if (err) {
      				return console.error(err);
      				}
      			console.log("Tracker Added successfully!");
      			console.log(docu);
    			}); 





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
    status: Number,            ////0= booked 1 =done 2= noshow 3= cancelled
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




var dailyBookingSchema = Schema({ 
    salonId: {type: String, index :true},
    stylistId:{type: String, index :true},
    date: Number,
    slotStatus: {
      type: Array,
      'default': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
    }
    // t600: { type: Number, default : 0},0    
    // t605: { type: Number, default : 0},1
    // t610: { type: Number, default : 0},2
    // t615: { type: Number, default : 0},3
    // t620: { type: Number, default : 0},4
    // t625: { type: Number, default : 0},5
    // t630: { type: Number, default : 0},6
    // t635: { type: Number, default : 0},7
    // t640: { type: Number, default : 0},8
    // t645: { type: Number, default : 0},9
    // t650: { type: Number, default : 0},10
    // t655: { type: Number, default : 0},11
    // t700: { type: Number, default : 0},12
    // t705: { type: Number, default : 0},13
    // t710: { type: Number, default : 0},14
    // t715: { type: Number, default : 0},15
    // t720: { type: Number, default : 0},16
    // t725: { type: Number, default : 0},17
    // t730: { type: Number, default : 0},18
    // t735: { type: Number, default : 0},19
    // t740: { type: Number, default : 0},20
    // t745: { type: Number, default : 0},21
    // t750: { type: Number, default : 0},22
    // t755: { type: Number, default : 0},23
    // t800: { type: Number, default : 0},24
    // t805: { type: Number, default : 0},25
    // t810: { type: Number, default : 0},26
    // t815: { type: Number, default : 0},27
    // t820: { type: Number, default : 0},28
    // t825: { type: Number, default : 0},29
    // t830: { type: Number, default : 0},30
    // t835: { type: Number, default : 0},31
    // t840: { type: Number, default : 0},32
    // t845: { type: Number, default : 0},33
    // t850: { type: Number, default : 0},34
    // t855: { type: Number, default : 0},35
    // t900: { type: Number, default : 0},36
    // t905: { type: Number, default : 0},37
    // t910: { type: Number, default : 0},38
    // t915: { type: Number, default : 0},39
    // t920: { type: Number, default : 0},40
    // t925: { type: Number, default : 0},41
    // t930: { type: Number, default : 0},42
    // t935: { type: Number, default : 0},43
    // t940: { type: Number, default : 0},44
    // t945: { type: Number, default : 0},45
    // t950: { type: Number, default : 0},46
    // t955: { type: Number, default : 0},47
    // t1000: { type: Number, default : 0},48
    // t1005: { type: Number, default : 0},49
    // t1010: { type: Number, default : 0},50
    // t1015: { type: Number, default : 0},51
    // t1020: { type: Number, default : 0},52
    // t1025: { type: Number, default : 0},53
    // t1030: { type: Number, default : 0},54
    // t1035: { type: Number, default : 0},55
    // t1040: { type: Number, default : 0},56
    // t1045: { type: Number, default : 0},57
    // t1050: { type: Number, default : 0},58
    // t1055: { type: Number, default : 0},59
    // t1100: { type: Number, default : 0},60
    // t1105: { type: Number, default : 0},61
    // t1110: { type: Number, default : 0},62
    // t1115: { type: Number, default : 0},63
    // t1120: { type: Number, default : 0},64
    // t1125: { type: Number, default : 0},65
    // t1130: { type: Number, default : 0},66
    // t1135: { type: Number, default : 0},67
    // t1140: { type: Number, default : 0},68
    // t1145: { type: Number, default : 0},69
    // t1150: { type: Number, default : 0},70
    // t1155: { type: Number, default : 0},71
    // t1200: { type: Number, default : 0},72
    // t1205: { type: Number, default : 0},73
    // t1210: { type: Number, default : 0},74
    // t1215: { type: Number, default : 0},75
    // t1220: { type: Number, default : 0},76
    // t1225: { type: Number, default : 0},77
    // t1230: { type: Number, default : 0},78
    // t1235: { type: Number, default : 0},79
    // t1240: { type: Number, default : 0},80
    // t1245: { type: Number, default : 0},81
    // t1250: { type: Number, default : 0},82
    // t1255: { type: Number, default : 0},83
    // t1300: { type: Number, default : 0},84
    // t1305: { type: Number, default : 0},85
    // t1310: { type: Number, default : 0},86
    // t1315: { type: Number, default : 0},87
    // t1320: { type: Number, default : 0},88
    // t1325: { type: Number, default : 0},89
    // t1330: { type: Number, default : 0},90
    // t1335: { type: Number, default : 0},91
    // t1340: { type: Number, default : 0},92
    // t1345: { type: Number, default : 0},93
    // t1350: { type: Number, default : 0},94
    // t1355: { type: Number, default : 0},95
    // t1400: { type: Number, default : 0},96
    // t1405: { type: Number, default : 0},97
    // t1410: { type: Number, default : 0},98
    // t1415: { type: Number, default : 0},99
    // t1420: { type: Number, default : 0},100
    // t1425: { type: Number, default : 0},101
    // t1430: { type: Number, default : 0},102
    // t1435: { type: Number, default : 0},103
    // t1440: { type: Number, default : 0},104
    // t1445: { type: Number, default : 0},105
    // t1450: { type: Number, default : 0},106
    // t1455: { type: Number, default : 0},107
    // t1500: { type: Number, default : 0},108
    // t1505: { type: Number, default : 0},109
    // t1510: { type: Number, default : 0},110
    // t1515: { type: Number, default : 0},111
    // t1520: { type: Number, default : 0},112
    // t1525: { type: Number, default : 0},113
    // t1530: { type: Number, default : 0},114
    // t1535: { type: Number, default : 0},115
    // t1540: { type: Number, default : 0},116
    // t1545: { type: Number, default : 0},117
    // t1550: { type: Number, default : 0},118
    // t1555: { type: Number, default : 0},119
    // t1600: { type: Number, default : 0},120
    // t1605: { type: Number, default : 0},121
    // t1610: { type: Number, default : 0},122
    // t1615: { type: Number, default : 0},123
    // t1620: { type: Number, default : 0},124
    // t1625: { type: Number, default : 0},125
    // t1630: { type: Number, default : 0},126
    // t1635: { type: Number, default : 0},127
    // t1640: { type: Number, default : 0},128
    // t1645: { type: Number, default : 0},129
    // t1650: { type: Number, default : 0},130
    // t1655: { type: Number, default : 0},131
    // t1700: { type: Number, default : 0},132
    // t1705: { type: Number, default : 0},133
    // t1710: { type: Number, default : 0},134
    // t1715: { type: Number, default : 0},135
    // t1720: { type: Number, default : 0},136
    // t1725: { type: Number, default : 0},137
    // t1730: { type: Number, default : 0},138
    // t1735: { type: Number, default : 0},139
    // t1740: { type: Number, default : 0},140
    // t1745: { type: Number, default : 0},141
    // t1750: { type: Number, default : 0},142
    // t1755: { type: Number, default : 0},143
    // t1800: { type: Number, default : 0},144
    // t1805: { type: Number, default : 0},145
    // t1810: { type: Number, default : 0},146
    // t1815: { type: Number, default : 0},147
    // t1820: { type: Number, default : 0},148
    // t1825: { type: Number, default : 0},149
    // t1830: { type: Number, default : 0},150
    // t1835: { type: Number, default : 0},151
    // t1840: { type: Number, default : 0},152
    // t1845: { type: Number, default : 0},153
    // t1850: { type: Number, default : 0},154
    // t1855: { type: Number, default : 0},155
    // t1900: { type: Number, default : 0},156
    // t1905: { type: Number, default : 0},157
    // t1910: { type: Number, default : 0},158
    // t1915: { type: Number, default : 0},159
    // t1920: { type: Number, default : 0},160
    // t1925: { type: Number, default : 0},161
    // t1930: { type: Number, default : 0},162
    // t1935: { type: Number, default : 0},163
    // t1940: { type: Number, default : 0},164
    // t1945: { type: Number, default : 0},165
    // t1950: { type: Number, default : 0},166
    // t1955: { type: Number, default : 0},167
    // t2000: { type: Number, default : 0},168
    // t2005: { type: Number, default : 0},169
    // t2010: { type: Number, default : 0},170
    // t2015: { type: Number, default : 0},171
    // t2020: { type: Number, default : 0},172
    // t2025: { type: Number, default : 0},173
    // t2030: { type: Number, default : 0},174
    // t2035: { type: Number, default : 0},175
    // t2040: { type: Number, default : 0},176
    // t2045: { type: Number, default : 0},177
    // t2050: { type: Number, default : 0},178
    // t2055: { type: Number, default : 0},179
    // t2100: { type: Number, default : 0},180
    // t2105: { type: Number, default : 0},181
    // t2110: { type: Number, default : 0},182
    // t2115: { type: Number, default : 0},183
    // t2120: { type: Number, default : 0},184
    // t2125: { type: Number, default : 0},185
    // t2130: { type: Number, default : 0},186
    // t2135: { type: Number, default : 0},187
    // t2140: { type: Number, default : 0},188
    // t2145: { type: Number, default : 0},189
    // t2150: { type: Number, default : 0},190
    // t2155: { type: Number, default : 0},191
    // t2200: { type: Number, default : 0},192
    // t2205: { type: Number, default : 0},193
    // t2210: { type: Number, default : 0},194
    // t2215: { type: Number, default : 0},195
    // t2220: { type: Number, default : 0},196
    // t2225: { type: Number, default : 0},197
    // t2230: { type: Number, default : 0},198
    // t2235: { type: Number, default : 0},199
    // t2240: { type: Number, default : 0},200
    // t2245: { type: Number, default : 0},201
    // t2250: { type: Number, default : 0},202
    // t2255: { type: Number, default : 0},203
});

dailyBookingSchema.pre("save", function (next) {
    var doc = this;
    bookingTrackerModel.findOneAndUpdate(
        { "stylistId": doc.stylistId }, 
        { "$inc": { "status": 1 } }
    , function(error, counterModel)   {
        if(error) return next(error);
        doc.bookingNo = counterModel.seq;
        next();
    });
});

const bookingTrackerModel= mongoose.model('bookingTracker', new Schema({ 
	stylistId:{type: String, index: true}, //here this is equal to stylistId
	salonId:{type: String, index: true},
    status: {type: Number, default : 0},
    statusToday:Number, 
}));












//Here are the various mongoose models used 


const counterModel= mongoose.model('counter', new Schema({ 
	_id:{type: String, required: true},
    seq: {type: Number, default : 1}, 
}));



const dailyBookingModel = mongoose.model('dailybooking', dailyBookingSchema);
const employeeModel = mongoose.model('employee',employeeSchema);
const userModel = mongoose.model('user',userSchema);
const salonModel = mongoose.model('salon',salonSchema);
const stylistModel = mongoose.model('stylist',stylistSchema);
const bookingModel = mongoose.model('booking',bookingSchema);
const tempUserModel = mongoose.model('tempuser',tempUserSchema);







mongoose.connect(config.database, {useNewUrlParser: true});














app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) 
app.use("/media", express.static(__dirname + '/uploads'))
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');






var deleteBookings = schedule.scheduleJob('0 0 1 * * *', function(){
	var date = new Date();
	 var yesterday = date;
   yesterday.setHours(0,0,0,0);
   yesterday.setDate(date.getDate() - 1);

	dailyBookingModel.deleteMany({ date: yesterday }, function (err) {
		if(err)
			console.log(err + "at" + date);
		else
			console.log("cleaned at" +date);
	});

});







var salonUpload = upload.fields([{ name: 'salonPhoto', maxCount: 1 }, { name: 'stylistPhoto', maxCount: 80 }]);

app.post('/test', salonUpload, function (req, res, next) {
   var date = Date();
   date.setHours(0,0,0,0);
  res.send(date);
})

app.post('/testotp', function(req, res) {
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

});



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/homePage.html'));
});
app.get('/test', function(req, res) {

	var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: "fAR3J_pkqfo:APA91bEmI8UFoXGbC-WN66m_WypB8kFCbImbz1Tmq-2Igx_gSTcwJukIG5unOqBAM5DJhUWx_LPSfQ1AysmrlLgb1jjfHdwaRcYGHnMQqCQZHbQZ6CxVYU4QjTMb98hDeeDJ1bW2Buza",
        notification: {
            title: 'Title of your push notification', 
            body: 'Body of your push notification' 
        },
        
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    }
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!")
            console.log(err)
        } else {
            console.log("Successfully sent with response: ", response)
            console.log(response.results[0].error);
        }
    })

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




















app.post('/admin/registerEmployee',upload.single('employeePhoto'), function(req, res) {
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
			   									   salonsAquired : 0,
			   									   EmailId: emp.email,
   												   Designation: emp.designation,
												   AreaSupervision: emp.areaSupervision,
												   photo : req.file.filename,


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
				try{
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
  			} catch (e){
  				return res.send("Please send complete and correct details");
  			}
  				stylist[i].save(function (err, employee1) {
      			if (err) {
      				return console.error(err);
      				}
      			console.log("Added successfully!");
      			}); 
 
			}


			var sal = req.body.serviceName;
			var sal2 =req.body.servicePrice;
			var servicesObj = {};
			if(sal.lenght == sal2.lenght){
				for (i = 0; i < sal.length; i++){
					servicesObj["serviceName" ] = sal;
					servicesObj["description" ] = data.description;
					servicesObj["servicePrice" ] = data.servicePrice;
				}

			}
			var timings = {
				mono: data.mono,
				monc : data.monc,
				tueo: data.tueo,
				tuec: data.tuec,
				wedo: data.wedo,
				wedc: data.wedc,
				thuro: data.thuro,
				thurc : data.thurc,
				frio: data.frio,
				fric: data.fric,
				sato: data.sato,
				satc: data.satc,
				suno: data.suno,
				sunc: data.sunc,
			};


		    var salon = new salonModel({	name: data.salonName, 
   											phoneNo: data.salonPhoneNo, 
    										address: data.address,
    										location:{type: 'Point',coordinates: [data.longitude,data.latitude]},
   											numberOfStylists: data.numberOfStylists,
    										stylistId: stylistUuid,
    										services: servicesObj,
    										salonId: salonUuid,
    										agentId: data.agentKey,
    										rating: 0,
    										noOfRating: 0,
    										photoId: req.files['salonPhoto'][0].filename,
    										pinCode : data.salonPinCode,
    										workingHours: timings,
		    							});
		    salon.save(function (err, employee1) {
      			if (err) {
      				return console.error(err);
      				}
      			console.log("Added successfully!");
      			var arr = req.body.serviceName
      			console.log(arr.length + "units");

      		
    			}); 
		    res.send(req.body);
		    		
		}
	});
	
	
});




app.post('/booking', function(req, res) {
	var data = JSON.parse(req.body.PostData);
	console.log(data);
	userModel.findOne({ userId: data.userId }).exec(function (err, user) {
		if(err){
			console.log(err);
			res.send({status: 0});
		}
		else if(user==null){
			console.log("no user");
			res.send({status: 0});
		}
		else{
			salonModel.findOne({ salonId: data.salonId }).exec(function (err, salon){
				if(err){
					console.log(err);
					res.send({status: 0});
				}
				else if(salon==null)
					res.send({status: 0});
				else{
					var bookingId = uuid();
					var newbooking = new bookingModel({	userId: data.userId, 
    													salonId: data.salonId,
    													services: data.services,
    													status: 1,            ////0= error 1= booked 2=done 3= noshow 4= cancelled 
    													stylistId:data.stylistId,
    													bookingId: bookingId,
													});
					newbooking.save(function (err, employee1) {
      					if (err) {
      						console.error(err);
      						res.send({status: 0});
      						}
      					dailyBookingModel.findOne({ salonId: data.salonId , date: data.date , stylistId: data.stylistId }).exec(function (err, salon){
						if(err){
							console.log(err);
							res.send({status: 0});
							}
						else if(salon==null){
						  	console.log(data);
						  	console.log("before saving")
							var slots=  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ];
							for (i = 0; i < slots.length; i++){
								if(i>=data.start && i<=data.end)
									slots[i] = 1;

							}

							var newDailyBooking = new dailyBookingModel({	date: data.date, 
    													salonId: data.salonId,            ////0= error 1= booked 2=done 3= noshow 4= cancelled 
    													stylistId: data.stylistId,
    													slotStatus: slots,
													});
							newDailyBooking.save(function (err, employee1) {
      							if (err) {
      								console.error(err);
      								res.send({status: 0});
      								}

      							else {
      								console.error("Booked successfully daily booking");
      								res.send({status: 1});
      								}	

      						});
							}
							else{
								var slots = salon.slotStatus;
								var flag = 0;
								for (i = 0; i < slots.length; i++){
									if(i>=data.start && i<=data.end)
										if(slots[i] == 1)
											flag = 1;
										else
											slots[i] = 1;	
										}
								if(flag==1){
									console.error("Illegal booking");
									res.send({status: 0});

								}
								else
								{
								salon.slotStatus = slots;
								salon.save(function (err, employee1) {
      							if (err) {
      								console.error(err);
      								res.send({status: 0});
      								}

      							else {
      								console.error("Booked successfully alreaady exists");
      								res.send({status: 1});
      								}	

      						  });
							}
							}
						});

    				}); 
				}
			});
		}
	});

	// if(data)

	// 			userId: {type: String, index :true},
 //    bookingNo: Number, 
 //    salonId: String,
 //    services: [String],
 //    status: Number,            ////0= error 1= booked 2=done 3= noshow 4= cancelled 
 //    stylistId:String,
 //    bookingId:String,
		
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

app.post('/registerUser', function(req,res) {
	var PostData = JSON.parse(req.body.PostData)
	var otp = generateRandom(4);


	//send the OTP



	console.log(PostData);
	userModel.find({phoneNo : PostData.number}).lean().exec(function (err, users) {
				 console.log(users.length);
				// console.log(typeof users.length);
				if (users.length===0){
					console.log(otp);
					var tempUser = new tempUserModel({     name: PostData.name,
			   									   		   phoneNo: PostData.number,
			   									   		   otp : otp,
			   									   		   userId: uuid(), 
			   									});
    				tempUser.save(function (err, tempUser) {
      					if (err) {
      						return console.error(err);
      					}
      				console.log("Added successfully!")
      		
    					}); 
					}
				else{
					console.log(users);
				}
    		    res.send(users);
            });






});
app.post('/verifyUser', function(req,res) {
	var PostData = JSON.parse(req.body.PostData)
	console.log(PostData);
	tempUserModel.find({phoneNo : PostData.number}).lean().exec(function (err, users) {
				 var id;
				 console.log(users.length);
				 token = 0;
				 for (i = 0; i < users.length; i++){
				 	if (users[i].otp==PostData.otp){
				 		token = 1;
				 		id = users[i].userId;
				 	}
				 }
				 if (token==0){
				 	var data = { userId : "nada",
				 				 status : 0
				 				}			
				    res.send(data);
				 }
				 

				 else{


				 	var user = new userModel({	name: PostData.name,
    											gender: PostData.gender, // 0=male 1=female
    											phoneNo: PostData.number, 
    											userId: id,
    											fireBaseToken: PostData.fireBase_token,
		    							});
		    		user.save(function (err, employee1) {
      				if (err) {
      					return console.error(err);
      					var data = { userId : id,
				 				 status : 0,
				 				}
      					}
      					else{
      				console.log("Added successfully!");


				 	var data = { userId : id,
				 				 status : 1
				 				}
					console.log(data);
				    res.send(data);
				}

				 }); 
				
				}
				
            });
		

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
