const express=require("express");
const collection=require("./config/collection")
const cookieparser=require("cookie-parser");
const bodyparser=require("body-parser");
const session=require("express-session");
const hbs=require("express-handlebars");
const db=require("./config/connection");
const formidable=require("formidable");
const filesystem=require("fs");

//const hbs=require("hbs");
const path=require("path");

const app=express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieparser());
app.use(express.static(path.join(__dirname,"public")));
app.use(session({
    secret:"idfy",
    saveUninitialized:true,
    resave:true,
    cookie:{
        maxAge:2592000000
    }
}));
//session.user.email=null;
db.connect((err)=>{
    if(err) throw err;

    console.log("DataBase Connected");
 })

app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");

 

 session.loggedIn=false;
 
 
app.get("/",(req,res)=>{
    res.render("home",{
        "isLogin":req.session.loggedIn?true:false,

    });
})
app.get("/allBooks",(req,res)=>{
    res.render("allBooks");
    
})
app.get("/login",(req,res)=>{
    if(req.session.user_id)
    {
        res.redirect("/");
        return;
    }
    res.render("login",{
        "error":"",
        "message":""
    });
})

app.post("/login",(req,res)=>{
    const email=req.body.email;
    console.log(email);
    const pass=req.body.psw;

    if(email==""||pass=="")
    {
        res.render("login",{
            "error":"Please enter all the fields",
            "message":""
        });
        return;
    }

    db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({
        "email":email
    },(err,user)=>{
        if(err)
        {
            console.log(err);
            return;
        }

        if(user==null)
        {
            res.render("login",{
                "error":"Email does not exist",
                "message":""
            });
        }
        else{
            if(pass==user.pass1)
            {
                req.session.loggedIn=true;
                req.session.user=user.email;
                res.redirect("/");
            }else{
                res.session.loggedIn=false;
                res.render("login",{
                    "error":"Password is not correct",
                    "message":""
                })
           }
        }
    })

});
app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");

});

app.get("/register",(req,res)=>{
    if(req.session.loggedIn)
    {
        res.redirect("/");
        return;
    }
    res.render("register",{
        "error":"",
        "message":""
    })
});

app.post("/register",(req,res)=>{
     const name=req.body.name;
     const email=req.body.email;
     const pass=req.body.psw;
     const pass2=req.body.psw_repeat;
     if(name==""||email==""||pass==""||pass2=="")
     {
        console.log("HEllo here  inside from if");
        res.render("register",{
            "error":"please fill all the fields",
            "message":""
        })
        return;
     }
     /*if(pass!=pass2)
     {
        res.render("register",{
            "error":"Both password should match"
        })
     }*/
     db
     .get()
     .collection(collection.USER_COLLECTION).findOne({
        "email":email
     },(err,user)=>{
        if(err){
         console.log(err);
         return;
        }
        
         if(user==null)
         {
            db
            .get()
            .collection(collection.USER_COLLECTION).insertOne({
                "name":name,
                "email":email,
                "pass1":pass,
                "pass2":pass
            },(err,user)=>{
                if(err){console.log(err);
                return;
            }
            res.render("register",{
                "error":"",
                "message":"Signed up successfully now login "
            });
            })
         }else{
            res.render("register",{
                "error": "Email already exists",
				"message": ""
            })
         }

     });  
});
 
app.get("/admin",(req,res)=>{
    if(req.session.user=="ratha@gmail.com")
    {
        res.render("admin")
    }
})
const verifyAdmin = (req, res, next) => {
    if (req.session.user){
      if (req.session.user=="ratha@gmail.com") {
        const admin=req.session.user.admin
        next();
      } 
      else {
       
        res.redirect("/");
  
     }
    } else {
      res.redirect("/login");
    }
   
  };
app.get("/Add",verifyAdmin,(req,res)=>{
    
      res.render("addBooks");
})

app.post("/Add",verifyAdmin,(req,res)=>{
 var form=new formidable.IncomingForm();
 form.parse(req,(err,fields,files)=>{
        const old_path=files.image.path;
        var new_path="public/images"+ new Date().getTime+"-"+files.image.name;
        const name=fields.name;
        const category=fields.category;
        const desc=fields.description;
        const price=fields.price;
        db
        .get()
        .collection(collection.BOOKS_COLLECTION)
        .insertOne({
            "Name":name,
            "Category":category,
            "Description":desc,
            "Price":price,
            "Path":old_path
        },(err,data)=>{
            if(err){console.log(err);
            return;}
            res.render("admin");
        })
        console.log(name);

 })
    
});

app.get("/All_Books",verifyAdmin,(req,res)=>{
    
    db.get().collection(collection.BOOKS_COLLECTION).find({}).toArray((err,products)=>{
        if(err){
            console.log(err);
            return;
        } 
        console.log(products);
        res.send(products);
        res.end();
         /*res.render("allBooks",{
            "products":products,
            "mssg":"displayed ???"
         });*/


    });
    
     
})
 

app.listen(5000,()=>{
    console.log("server started");
})




