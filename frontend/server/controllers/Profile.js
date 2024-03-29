const Profile = require("../models/Profile");
const User= require("../models/User");
const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/convertSecondsToDuration");
const CourseProgress = require("../models/CourseProgress")
const mongoose = require("mongoose")
const RatingAndReview = require("../models/RatingAndReview")

exports.updateProfile = async(req,res)=>{
    try{
        const {dateOfBirth="",about='',contactNumber='',gender} = req.body;
        const id = req.user.id;

        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        const userDetails= await User.findById(id);
        const profileId  = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
            
                profileDetails.dateOfBirth = dateOfBirth;
                profileDetails.about = about;
                profileDetails.gender = gender;
                profileDetails.contactNumber = contactNumber;

                await profileDetails.save();

                return res.status(200).json({
                    success:true,
                    messsage:"Profile Upadted Successfully",
                });
            
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
}

exports.deleteProfile = async(req,res)=>{
    try{
        const id= req.user.id;
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                userDetails,
            });
        }
        const ProfileId = new mongoose.Types.ObjectId(userDetails.additionalDetails);
        console.log(ProfileId);
        //unroll from all courses
        for(const courseId of userDetails.courses){
            await Course.findByIdAndUpdate(
                courseId,
                {$pull:{studentEnrolled:id}},
                {new:true},
            );
        }

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:id});
        return res.status(200).json({
                success:true,
                message:"User Deleted Successfully",
            });
        
    }
    catch(error){
        return res.json(500).json({
            success:false,
            message:'Profile cannot be Updated ',
        });
    }
}

exports.getAllUserDetails = async(req,res)=>{
    try{
        const id = req.user.id;

        const userDetails  = await User.findById(id).populate("additionalDetails").exec();

        if (!userDetails) {
          return res.status(404).json({
              success: false,
              message: "User not found",
          });
      }

        return res.status(200).json({
            success:true,
            message:"User Details fetched successfully",
            userDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Something went wrong',
        });
    }
}

// update the profile picture
exports.updateProfilePicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log("image" , image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  };

  exports.getEnrolledCourses = async (req, res) => {
	try {
	  const userId = req.user.id
	  let userDetails = await User.findOne({
		_id: userId,
	  })
		.populate({
		  path: "courses",
		  populate: {
			path: "courseContent",
			populate: {
			  path: "subSection",
			},
		  },
		})
		.exec()

	  userDetails = userDetails.toObject()
	  var SubsectionLength = 0
	  for (var i = 0; i < userDetails?.courses?.length; i++) {
		let totalDurationInSeconds = 0
		SubsectionLength = 0
		for (var j = 0; j < userDetails?.courses[i]?.courseContent?.length; j++) {
		  totalDurationInSeconds += userDetails.courses[i].courseContent[
			j
		  ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
		  userDetails.courses[i].totalDuration = convertSecondsToDuration(
			totalDurationInSeconds
		  )
		  SubsectionLength +=
			userDetails.courses[i].courseContent[j].subSection.length
		}
		let courseProgressCount = await CourseProgress.findOne({
		  courseID: userDetails.courses[i]._id,
		  userID: userId,
		})
    // console.log("courseProgressCount" , courseProgressCount);
		courseProgressCount = courseProgressCount?.completedVideos.length
		if (SubsectionLength === 0) {
		  userDetails.courses[i].progressPercentage = 100
		} else {
		  // To make it up to 2 decimal point
		  const multiplier = Math.pow(10, 2)
		  userDetails.courses[i].progressPercentage =
			Math.round(
			  (courseProgressCount / SubsectionLength) * 100 * multiplier
			) / multiplier
		}
	  }
  
	  if (!userDetails) {
		return res.status(400).json({
		  success: false,
		  message: `Could not find user with id: ${userDetails}`,
		})
	  }
	  return res.status(200).json({
		success: true,
		data: userDetails.courses,
	  })
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: error.message,
	  })
	}
  }


  //get stats of a instructor

  exports.instructorDashboard = async(req,res) => {
    try{
      const instructorId = req.user.id;
      const courseDetails = await Course.find({instructor:instructorId});
      const courseData = courseDetails.map((course) =>{
      const totalStudentsEnrolled = course.studentsEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled*(course.price);

        //create a new obj with additionalFields
        const courseDataWithStats = {
          _id : course._id,
          courseName : course.courseName,
          courseDescription : course.courseDescription,
          totalAmountGenerated,
          totalStudentsEnrolled
        }
        return courseDataWithStats;
    })
    return res.status(200).json({
      success:true,
      message:"Stats Fetched Successfully",
      courses : courseData
    })
    } catch(err){
      console.error(err);
      res.status(500).json({
        message:"Internal Server Error"
      })
    }
  }