const mongoose  = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName:{
    type:String,
    required:true,
  },
  courseDescription:{
    type:String,
    required:true,
  },
  instructor:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:"true",
  },
  whatYouWillLearn:{
    type:String,
  },
  courseContent:{
    type:mongoose.Schema.ObjectId,
    ref:"Section",
  },
  ratingAndReviews:[{
    type:mongoose.Schema.ObjectId,
    ref:"RatingAndReview",
  }],
  price:{
    type:Number,
    required:true,
  },
  thumbnail:{
    type:String,
  },
  tag:{
    type:[String],
    required:true,
  },
  studentsEnrolled:[
  {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  }
],
category :{
  type : mongoose.Schema.Types.ObjectId,
  ref : "Category",
},
createdAt : {
  type : Date,
  default:Date.now
},
status:{
  type:String,
  enum:["Draft","Published"],
},
});
module.exports = mongoose.model("Course",courseSchema);