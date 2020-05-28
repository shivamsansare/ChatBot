var express=require('express'),
    app=express(),
    bodyParser=require('body-parser'),
    keys=require('./keys'),
    request=require("request"),
    Booking=require("./models/booking"),
    mongoose=require("mongoose");

mongoose.connect(keys.api.mongoDb);
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+"/public"));


numberUrl="http://numbersapi.com/";
weatherUrl="http://api.openweathermap.org/data/2.5/weather?q="


app.get("/",function(req,res){
    res.render("index");
});

app.post("/",function(req,res){
    intent=req.body.queryResult.intent.displayName;
    if(intent=="Book-time-name"){
        var context=req.body.queryResult.outputContexts[0];
        var contextParams=context.parameters;
        var book=contextParams['date-time'].date_time;
        var bookDate=new Date(book);
        var email=contextParams['email.original'];
        var newBooking={username:email,date:bookDate};
        Booking.create(newBooking,function(err,newBook){
            if(err){
                console.log(err);
                return res.json({'fulfillmentText':"Some Error Occurred"});
            }
            else{
                if(newBook==null){
                    return res.json({'fulfillmentText':"Some Error Occurred"});
                }
                else{           
                    return res.json({'fulfillmentText':"Successfully Booked"});
                }
            }
        })
    }
    else if(intent=="Book-time"){
        var dialogDate=req.body.queryResult.parameters['date-time'].date_time;
        var bookDate=new Date(dialogDate);
        var todaysDate=new Date();
        if(bookDate>todaysDate){
            Booking.findOne({date:bookDate},function(err,found){
                if(err){
                    console.log(err);
                }
                else{
                    if(found==null){
                        return res.json({'fulfillmentText':"Tell email address to confirm Booking,Free slot available"});
                    }
                    else{
                        return res.json({'fulfillmentText':"Already Booked please select some other slot"});
                    }
                }
            });
        }   
        else{
         return res.json({'fulfillmentText':"This date is a past date"});
        }
    }
    else if(intent=="Book"){
        return res.json({'fulfillmentText':"At what date and time?"});
    }
    else if(intent=="numbers"){
        trivia=req.body.queryResult.parameters.trivia;
        number=req.body.queryResult.parameters.number;
        newNumberUrl=numberUrl+number+"/";
        request({
            url:newNumberUrl,
            json:true 
            },function(error,response,body){
                    return res.json({'fulfillmentText':body})
                }
        );
    }
    else if(intent=="weather"){
        city=req.body.queryResult.parameters.location.city;
        newWeatherUrl=weatherUrl+city+"&appid="+keys.api.weather;
        request({
            url:newWeatherUrl,
            json:true
            },function(error,response,body){
                    var weathers =body.weather;
                    var descriptions=weathers[0];
                    var reply=city+" has "+descriptions.description+" with "+body.main.humidity+"% humidity and winds running at "+body.wind.speed+"m/s";
                    return res.json({'fulfillmentText':reply})
                }
        );
    }
});

//const PORT=5000;

app.listen(process.env.PORT,process.env.IP,function(req,res){
    console.log("hello");
})