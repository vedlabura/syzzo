// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MyApp = require('./app.js')
var counterModel = MyApp.counterModel

// set up a mongoose model and pass it using module.exports
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
        next();
    });
});



module.exports = mongoose.model('employee',employeeSchema);
