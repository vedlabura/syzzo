// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Salon', new Schema({ 
    name: String, 
    phoneNo: Number, 
    Adress: String,
    xcoordinate: Number,
    ycoordinate: Number,
    numberOfStylists: Number,
//    stylistId:
//    services:
//    salonNo: Number,
//    salonId:
//    agentId:
//    Rating:
}));
