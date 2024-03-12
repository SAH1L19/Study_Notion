const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        
    },
    course:{
        type:mongoose.Types.ObjectId,
        ref:"Course",
    },

});

module.exports = mongoose.model("Tag",tagsSchema);