const mongoose  = require("mongoose");


const courseProgressSchema = new mongoose.Schema({
    courseId : {
        type:mongoose.Types.ObjectId,
        ref:"Course",
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    completedVideos : [{
        type:mongoose.Schema.ObjectId,
        ref:"SubSection",
    },]
})
module.exports = mongoose.model("courseProgress",courseProgressSchema);