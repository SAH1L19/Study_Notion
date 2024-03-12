const Tag = require("../models/tags");


exports.createTag=  async(req,res)=>{
    try{
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(400).json({
                success:false,
                messsage:"all fields are requirecd",
            });
        }
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        return res.status(200)({
            success:true,
            message:"Tags created successfully",
        });
    }
    catch(error){
        return res.status(500)({
            success:false,
            message:error.message,
        });
    }
}

//getall Tags 

exports.showAllTags = async(req,res)=>{
    try{
        const allTags = await Tag.find({},{name:true,description:true});
        return res.status(200)({
            success:true,
            message:"Tags created successfully",
        });
    }
    catch(error){
        return res.status(500)({
            success:false,
            message:error.message,
        });
    }
}