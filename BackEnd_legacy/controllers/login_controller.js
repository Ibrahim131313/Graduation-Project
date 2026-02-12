const Readings = require("../models/readings-model");
const Patients = require("../models/patients-model");
const Login = require("../models/login-model")
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const {nanoid} = require("nanoid")

const createUser = async (req,res) => {
    try{
        const {user_id, email ,password, role} = req.body ;
        let hashed_password =await bcrypt.hash(password , 6);
        let new_user = await new Login({
           user_id: user_id,
           email: email,
           password: hashed_password,
           role: role
        })
       await new_user.save()
       res.status(201).json({status: "success",data: {user: new_user}});
    }catch(err){
           res.status(400).json({
           status: "error",
           message: err.message      
     })
    }
  }



const authUser = async (req,res) => {
    try{
       const {email , password} = req.body ;
       console.log(req.body)
       if(!email || !password){
          res.status(404).json({status: "fail",data: "email and password are required"});
          return ;
       }
       const user = await Login.findOne({ 
          email: email
        });
        
       if(!user){
          res.status(404).json({status: "fail",data: "user not found"})
          return;
       }
       const password_matched = await bcrypt.compare(password,user.password);
       if(!password_matched){
          res.status(404).json({status: "fail",data: "wrong password"})
          return;
       }

         
            const token = await JWT.sign({user_id: user.user_id,email: user.email,role: user.role},process.env.JWT_SECRET_KEY,{expiresIn: '50d'});
            res.json({status: "success",data: {token: token,user_id:user.user_id,role: user.role}})
          

console.log("================================================")

    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
 }

 

 
module.exports = {
    authUser,
    createUser
    }