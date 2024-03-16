const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection  =require("../models/SubSection")

exports.createSection = async(req,res)=>{
    try{
        const {sectionName,courseId} = req.body;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        const section = await Section.create({sectionName});

        const UpdatedCourse = await Course.findByIdAndUpdate(courseId,
                                                {
                                                  $push:{
                                                    courseContent:section._id,
                                                  }  
                                                },
                                                {new:true},
                                                ) .populate({
                                                    path: "courseContent",
                                                    populate:{
                                                      path : "subSection",
                                                    },
                                                  }).exec();

            return res.status(200).json({
                success:true,
                UpdatedCourse,
                message:"Section created successfuly",
            });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section",
            error:error.message,
        })
    }
}


exports.updateSection = async(req,res)=>{
    try{
        const {sectionName,sectionId,courseId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }

        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection", 
            }
        }).exec();
        return res.status({
            success:true,
            message:"Section Updated successfully",
            data:course,section
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section",
            error:error.message,
        })
    }
}

exports.deleteSection = async(req,res)=>{
    try{
        const {sectionId,courseId} = req.body;
        await Course.findByIdAndDelete(courseId,{
            $pull:{
                courseContent : sectionId,
            }
        });
        const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

        await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();
        
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
            data:course,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section",
            error:error.message,
        })
    }
}