const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");

// create rating
exports.createRating  = async(req,res)=>{
    try{
        //get user id 
        const userId = req.user.id;
        //get course id 
        const {rating,review,courseId} = req.body;
        //check if user is enrolled or not (only 1 time review and rating)
        const courseDetails = await Course.findone(
            {_id:courseId,
                studentsEnrolled:{$elemMatch:{$eq:userId}},
            //fetches student from studentenrolled from course id       
            });
        //create rationg and review 
        if(!courseDetails){
            return res.json({
                success:false,
                message:"Student is not enrolled in the course",
            });
        }
        console.log(courseDetails);
        //check if already reviewd or not 
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,          
        });
        if(alreadyReviewed){
            return res.json({
                success:false,
                message:"Course is already reviewed by the user",
            });
        }
        //create reivew and update course
        const ratingReview = await RatingAndReview.create({
            rating,review,course:courseId,user:userId,
        });
        await Course.findByIdAndUpdate(courseId,{
            $push:{ratingAndReviews:ratingReview},
            
        },{new:true},
        );
        //return response 
        return res.status(200).json({
            success:true,
            message:"Ratind and review created successfully",
        });
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

//create average rating
exports.getAverageRating = async(req,res)=>{
    try{
        //get courseId 
        const courseId = req.body.courseId;
        //calculate average rating 
        const result = await RatingAndReview.aggregate(
            [
                {
                    $match:{
                        course:new mongoose.Types.ObjectId(courseId),
                    }
                },
                {
                    $group:{
                        _id:null,
                        averageRating:{$avg:"$rating"},
                    }
                }
            ]
        )
        //return rating 
        if(result.length>0){
            return res.status(200).json({
                succes:true,
                averageRating:result[0].averageRating,
            })
        }

        //if no rating review exist
        return res.status(200).json({
            success:true,
            message:"Average Rating is 0 , no ratings given",
            averageRating:0,
        });
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}




//get all ratings 

exports.getAllRating = async(req,res)=>{
    try{
        const allReviews = await RatingAndReview.find(
            {}).sort({rating:"desc"})
            .populate({path:"user",select:"firstName lastName email image" })
            .populate({path:"course",select:"courseName"})
            .exec();


        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
        });
    }
    catch(error){
        
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        
    }
}