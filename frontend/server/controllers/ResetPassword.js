//sends link to gmail and click to reset password 

//link gets generated and sent to mail and   that link resets out password 

// link_generate and mail link
//reset password using link  / .  token uesd between these two parts 


const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
//resetPassword Token
exports.resetPasswordToken = async(req,res)=>{
    try{
        //get email from req
    const email = req.body.email ;

    //check user for this email  ,email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({
            succes:false,
            message:"Your email is not registered with us"
        });
    } 
    //generate token and update user model
    const token   = crypto.randomBytes(20).toString("hex");
    const updatedDetails = await User.findOneAndUpdate({email:email},{token:token},{resetPasswordExpires:Date.now()+5*60*60*1000},{new:true});

    //link generate 
    const url = `https://localhost:3000/update-password/${token}`;
    //send mail 
    await mailSender(email,"Password Reset Link",`Password Reset Link:${url}`);
    //return response 
    return res.json({
        success:true,
        message:"Email sent successfully,please check email and change password",
    });
        }
    catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Something went wrong while resetting password"
          
        });
    }

}



//actuall reset password function 
exports.resetPassword = async(req,res)=>{
   try{
     //data fetch 
     const {password ,confirmpassword, token} =req.body;
     //validation 
     if(password!==confirmpassword){
         return res.status(400).json({
             success:false,
             message:"password do not match,retry",
         });
     }
     //get userdetails from db using TOKEN
      const userDetails  = await User.findOne({token:token});
      //some validations 
      if(!userDetails){
        return res.status(400).json({
             success:false,
             message:"Token is invalid",
         });
      }
     //token time check
     if(userDetails.resetPasswordExpires < Date.now()){
         return res.status(401).json({
             success:false,
             message:"Token is expired , please regenerate your token",
         });
     }
     //hash password  
     const hashedpassword = await bcrypt.hash(password,10);
     //password update
     await User.findOneAndUpdate({token:token},{password:hashedpassword},{new:true});
     //return response
     await mailSender(userDetails.email,"Password Reset Confirmation",passwordUpdated(userDetails.email,userDetails.firstName))
     return res.status(200).json({
         success:true,
         message:"Password reset successfully",
     });
   }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success:true,
         message:"Error in resetting password ",
    })
   }
}