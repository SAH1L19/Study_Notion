//signup , login , change password , send otp

const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();
//send otp


//OTP on first Signup 
exports.sendOTP = async (req, res) => {
  try {
    //fetch email first
    const { email } = req.body;

    //check already exists or not
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //generate OTP here
    var otp = otpGenerator.generate(6, {
      UpperCaseAlphabets: false,
      LowerCaseAlpahbets: false,
      SpecialCase: false,
    });
    console.log("OTP generated", otp);

    //check unique OTP or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        UpperCaseAlphabets: false,
        LowerCaseAlpahbets: false,
        SpecialCase: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //pre middleware will be called hai  => node mailer 
    //create entry in DB
    const otpBody = await OTP.create(otpPayload);
    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } 
  catch (error){
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.signup = async (req, res) => {
  try {
    //data fetch from req body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
      accountType,
    } = req.body;

    //validatation on that
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.json(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 password match case
    if (password !== confirmPassword) {
      return res.json(400).json({
        success: false,
        message:
          "Password and confirmPassword does not match.Please  try again ",
      });
    }
    //check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find the most recent OTP stored for the user

    //.sort({ createdAt: -1 }): This method is used to sort the results in descending order based on the createdAt field. The value -1 indicates descending order, so the most recent OTP will be the first result.
    // .limit(1): This limits the number of results to 1. Since the results are sorted in descending order, this ensures that only the most recent OTP is retrieved.

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //validate OTP
    if (recentOtp.length === 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        messgae: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      //Invalid OTP
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash password
    const hashedpassword = await bcrypt.hash(password, 10);

    //create entry in DB
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedpassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return response
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } 
  catch (error) {
    console.log(error);
    console.log("User cannot be registered");
  }
};


//jwt token authentication 
exports.login = async (req, res) => {
    try{
        //get data from req body 

        //validation
        const {email,password}  = req.body;
        if(!email || !password){
          return res.status(403).json({
            succes:false,
            message:"All fields are required , please try again ",
          });
        }
        //check user exist or not 
        const user = await User.findOne({ email }).populate("additionalDetails");

        if(!user){
          return res.status(401).json({
            success:false,
            message: "User is not registered, please signup first!",
          });
        }
        
        //token generate Jwt after password match 
        if(await bcrypt.compare(password,user.password)){
          const payload = {
            email:user.email,
            id:user._id,
            accountType:user.accountType,
          };
          const token = jwt.sign(payload , process.env.JWT_SECRET,{
            expiresIn:"2h",
          });
          user.token = token ;
          user.password = undefined;
        
        //cookie create and send response
        const options = {
          expires: new Date(Date.now() +3*24*60*60*1000),
          httpsOnly:true,
        } 
        res.cookie("token",token,options).status(200).json({
          success:true,
          token ,
          user,
          
        });
      }
      else{
        return res.status(401).json({
          success:false,
          message:"Password is incorrect",
        });
      }
    }
    catch(error){
      console.log(error);
        return res.status(500).json({
          success:false,
          message:"Login Failure , please try again later!",
        });
    }
};

// exports.changePassword = async(req,res)=>{
//   try{//get data from body 
  

//   const {oldPassword,confirmNewPassword,newPassword} = req.body;
//   if(!confirmNewPassword || !newPassword || !oldPassword){
//     return res.status(401).json({
//       success:false,
//       message:"All password fields are required",
//     });
//   }
//    //validattion on password fields 
//   if(newPassword!==confirmNewPassword){
//     return res.status(401).json({
//       success:false,
//       message:"Password Does not match",
//     });
//   }
//   //get old password , new password , confirmnew password 
//   const user = await User.findById(req.user._id);

 
//   const isOldPasswordValid  = await bcrypt.compare(newPassword,oldPassword);
//   if(!isOldPasswordValid){
//     return res.status(401).json({
//       success: false,
//       message: 'Old password is incorrect.',
//     });
//   }
//   //creating new password 
//   const hashedNewPassword = await bcrypt.hash(newPassword,10);
//   user.password = hashedNewPassword;

//   //update password in Db,
//   await user.save();
 
  
//   // send mail
//   await mailer.sendPasswordConfirmationEmail(user.email);
//   // return res 
//   return res.status(200).json({
//     success: true,
//     message: 'Password changed successfully. Check your email for confirmation.',
//   });
// }
//   catch(error){
//     console.log(error);
//     return res.status(500).json({
//       succes:false,
//       message:"Internal Server Error.",
//     });
//   }
// }


exports.changePassword = async (req, res) => {
  try {
    // fetch data
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    // validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not registered",
      });
    }
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "current password do not match",
      });
    }
    // user exists so compare oldpass & storedpass
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    // now hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // send mail that password has been updated
    await mailSender(email,"Password Upadted Confirmation","Goto Login");
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};