const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");


app.set("Views",path.join(__dirname,"Views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

main()
.then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Whatapp');
}

let chat1 = new Chat({
    from:"neha",
    to:"priya",
    msg:"send me your exam sheets",
    created_at: new Date()
})
 
chat1.save().then((res)=>{
    console.log(res)
}).catch((err)=>{
    console.log(err)
})

//Index Route
app.get("/chats",async (req,res)=>{
    try{
        let chats = await Chat.find();
  
        res.render("index.ejs",{chats})
    }catch(err){
        next(err);
    }
   
})

//New route
app.get("/chats/new",(req,res)=>{
    // throw new ExpressError(404,"page not found")
    res.render("new.ejs")
})

//Create Route
app.post("/chats",asyncWrap(async (req,res)=>{


        let {from ,to ,msg} = req.body;
        let newChat = new Chat({
            from:from,
            to:to,
            msg:msg,
            created_at:new Date()
        });
    newChat.save().then(res=>{console.log("chat was saved")}).catch(err=>{
        console.log(err)
    })
        res.redirect("/chats");
 
    }));


function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=> next(err));
    }
}


// show route
app.get("/chats/:id", asyncWrap(async (req,res,next)=>{
    
        let {id} =  req.params;
        let chat = await Chat.findById(id);
        if(!chat){
            next ( new ExpressError(404, "chat not found"));
        }
     res.render("edit.ejs",{chat});

}));




//edit route
app.get("/chats/:id/edit",asyncWrap (async (req,res)=>{
   
        let {id} = req.params
        let chat = await Chat.findById(id);
         res.render("edit.ejs",{chat})

    

}))

//update route
app.put("/chats/:id",asyncWrap (async (req,res)=>{
    
        let {id} = req.params;
        let {msg:newMsg} = req.body;
        console.log(newMsg);
        let updatedChat = await Chat.findByIdAndUpdate(id,
            {msg:newMsg},
            {runValidators:true,new:true}
    );
        console.log(updatedChat);
        res.redirect("/chats");
   
   
}));

//Destroy Route
app.delete("/chats/:id", asyncWrap(async (req,res)=>{

        let {id} = req.params;
        let deletedChat =  await Chat.findByIdAndDelete(id);
      console.log(deletedChat);
      res.redirect("/chats");
}));

app.get("/",(req,res)=>{
    res.send("root is working");
})


const handleValidationErr = (err)=>{
console.log("This is a validation error. Please follow rules")
console.dir(err)
return err;

}
app.use((err,req,res,next)=>{
    console.log(err.name)
    if(err.name === "ValidationError"){
    err =   handleValidationErr(err)
    }
    next(err);
})


//Error handling middleware
app.use((err, req,res,next)=>{
    let {status = 500, message = "some error occured"} = err;
    res.status(status).send(message);
})



app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});