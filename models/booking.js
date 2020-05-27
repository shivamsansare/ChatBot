var mongoose=require("mongoose");

var BookingSchema=new mongoose.Schema({
    name: String,
    date: Date
});

module.exports=mongoose.model('Booking',BookingSchema);