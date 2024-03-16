//isstudent , isadmin , is instructor 

const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//auth
 exports.auth = async(req,res,next)=>{
    try{
        //extract token 
        //different ways 
        const token = req.cookies.token || req.body.token 
                     || req.header("Authorisation").replace("Bearer","");
        if(!token){
          return res.json({
            success:false,
            message:"Token is missing",
        });
        }

    //verify token
    try{
        const decode =  jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode ;
        //the payload data gets decoded and gets attached to req.user = decode
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:"token is invalid",
        });
    }
    next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });
    }
 }


 //isStudent
 exports.isStudent = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"User role cannot be verified",
            });
        }
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified",
        });
    }
 }

  //isInstructor 
  exports.isStudent = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"User role cannot be verified",
            });
        }
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified",
        });
    }
 }
 
 exports.isInstructor = async(req,res,next)=>{
    try{
      if(req.user.accountType !== "Instructor"){
        return res.status(400).json({
          success:false,
          message: "This is a protected route for Instructor",
        });
      }
      next();
    } catch(err){
      console.log(err);
      return res.status(500).json({
        success:false,
        message:"User role cannot be verified ,try again",
      })
    }
  }
  //isAdmin
 exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(400).json({
                success:false,
                message:"This is a protected route for Admin",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified",
        });
    }
 }
