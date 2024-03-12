const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail}  =require("../mail/templates/courseEnrollmentEmail");



exports.capturePayment = async(req,res)=>{
    //get courseid and user id
    const {course_id} = req.body;
    const userId = req.user.id;
    // validation 
    if(!course_id){
        return res.json({
            success:true,
            message:"Please provide valid course ID",
        });
    }
    // valid course id
    // valid course detail 
    let course;
    try{
        course=await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"COuld not find the course",
            });
        }
        //user already pay for the same course

        //to convvert string req.user.id to object id 
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            });
        }

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Student is already enrolled",
        });
    }
    
    
    //order create
    const amount = course.price;
    const currency = "INR";
    const options={
        amount :amount*100,
        currency,
        receipt:Math.random(Date.now().toString()),
        notes:{
            courseId :course_id,
            userId,
        }
    };
    //initialize payment 
    try{
        const paymentResponse =  instance.orders.create(options);
        console.log(paymentResponse);
        //return response 
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail : course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });


    }catch(error){
        return res.json({
            success:false,
            message:"Could not initiate order",
        });
    }
    
}


//verify signature of razorpay and server

exports.verifySignature = async(req,res)=>{
    const webhookSecret = "12345";

    const signature = req.headers("x-razorpay-signature");

    //hashed based message authentication code
    //sha algorithm which cannot be decrypted back 

    //hmac -  hashing algo  and secret key required 


    // task  - checksum 
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    //match signrature and digest 
    if(signature===digest){
        console.log("payment is authorized");

        //give course to user and update student_enrooled in courses
        
        //req.body is not available as razerpay API... so use notes....

        //req location found after logging or documents 
        const {courseId,userId}  = req.body.payload.payment.entity.notes;
        try{
            //fulfill the action 

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                        {_id:courseId},
                                        {$push:{studentsEnrolled:userId}},
                                        {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:true,
                    message:"Course not found",
                });
              
            }
            console.log(enrolledCourse);

            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true},
            );
            console.log(enrolledStudent);


            //send email for course purchase 
            const emailResponse = await mailSender(
                                enrolledStudent.email,"Congratulations",
                                "Congratulations,You are onaborded into new CodeHelp Course"
                                );
            console.log(emailResponse);
            return res.status(200).json({
                success:false,
                message:"Signature verified and course added",
            });
     
        }
        catch(error){
            return res.status(200).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid signature",
        });
    }

    
}