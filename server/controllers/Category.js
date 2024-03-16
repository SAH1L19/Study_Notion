const Category = require("../models/Category");

exports.createCategory = async(req,res)=>{
    try{
        const {name,description } =req.body;
        if(!name){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //create entry in db
        const CategoryDetails = await Category.create({
            name:name,description:description,
        });
        console.log(CategoryDetails);
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        });
    }
    catch(error){
    
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.showAllCategories = async(req,res)=>{
    try{
      const allCategories = await Category.find({},{name:true,description:true});
      return res.status(200).json({
        success:true,
        message:"All Categories obtained successfully",
        allCategories,
      })
    } catch(err){
      return res.status(500).json({
        success:false,
        message:err.message,
      });
    }
  }
  
  exports.categoryPageDetails = async(req,res)=>{
    try{
        //course id 
        const {categoryId}  =req.body;
        //get courses for specified category id 
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found",
            });
        }
        //get category for different categories
        const differentCategories= await Category.find({
            _id:{$ne:categoryId}
            //not equal to = $ne
        }).populate("courses").exec();
        
        //get top 10  selling courses  //hwwww

        //return response
        return res.status(200).json({
            success:true,
            differentCategories,
        });
    }
    catch(error){

    return res.status(500).json({
      success:false,
      message:err.message,
    });
 

    }
  }