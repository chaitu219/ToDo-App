const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect("mongodb://127.0.0.1:27017/OasisDB"),{
    useNewUrlParser:true
}


const taskSchema = mongoose.Schema({
    TITLE: String,
    DESCRIPTION: String,
    STARTDATE: String,
    STARTTIME: String,
    ENDDATE: String,
    ENDTIME: String,
    STATUS: String,
    DEF: String
});
const task = new mongoose.model("task",taskSchema);

function timeStamp(){
    const d = new Date();
        var date = String(d.getDate()).padStart(2,'0')+"-"+String(d.getMonth()).padStart(2,'0')+"-"+d.getFullYear()
        var hour = d.getHours()
        var minute = d.getMinutes()
        if(hour < 12){
            var h = hour
            var m = "AM"
        }else if(hour == 12){
            var h= hour
            var m = "PM"
        }else{
            var h = hour%12
            var m = "PM"
        }
        var time = String(h).padStart(2,'0')+":"+String(minute).padStart(2,'0')+m;

        return{
            time: time,
            date: date
        }
}

app.get("/", async (req,res) => {
    var taskData = await task.find()
    res.render("Home",{taskData: taskData,intro: "Home"});
})


app.get("/completed", async (req,res) => {
    var taskData = await task.find({STATUS: "Completed"});
    res.render("Home",{taskData: taskData,intro: "Completed Tasks"});
})

app.get("/pending", async (req,res) => {
    var taskData = await task.find({STATUS: "Pending"});
    res.render("Home",{taskData: taskData,intro: "Pending Tasks"});
})




app.post("/", async (req,res) => {
    var logic = req.body.save;
    if(logic == "add"){
        var title = req.body.title;
        var description = req.body.description;
        var {time} = timeStamp();
        var {date} = timeStamp();
        await task.create({TITLE: title,DESCRIPTION: description,STARTDATE: date,STARTTIME: time,STATUS: "Pending",ENDDATE: "--",ENDTIME: "--",DEF: "tasks"})
        res.redirect("/")
    }
    else if(logic == "complete"){
        var {time} = timeStamp();
        var {date} = timeStamp();
        var id = req.body.id;
        var data = await task.find({_id: id})
        var checker = data[0].STATUS;
        if(checker == "Completed"){
            res.redirect("/")
        }else{
            await task.updateOne({_id: id},{$set: {STATUS: "Completed",ENDDATE: date,ENDTIME: time}})
            res.redirect("/")
        }
    }
    else if(logic == "update"){
        var id = req.body.id;
        var title = req.body.title;
        var description = req.body.description;

        await task.updateOne({_id: id},{$set: {TITLE: title,DESCRIPTION: description}});
        res.redirect("/")
    }
    else if(logic == "delete"){
        var id = req.body.id;
        await task.deleteOne({_id: id});
        res.redirect("/")
    }
})


app.get("/1234", async function(req,res){
    res.send("Hello World");
});

app.listen(3000, function(){
    console.log("Server started at port 3000")
});


