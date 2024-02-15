const Tracking = require("../models/Tracking");
const Instructor = require("../models/Instructor");
const Activity = require("../models/Activity");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


exports.signup = async(req,res)=>{
    try{
        const {name,password,email,phone} = req.body;
        const savedInstructor = await Instructor.findOne({email:req.body.email});
        if (savedInstructor) {
            return res.status(400).json({ message: 'Instructor Already Exists' });
        }

        const newInstructor = new Instructor({
            name:name,
            password: bcrypt.hashSync(password,10),
            email:email,
            phone:phone,
        })
        await newInstructor.save();
        return res.status(200).json({"message":"Instructor Registered Successfully"});
    }catch(err){
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.login= async(req,res) =>{
    try{
        const {email,password} = req.body;
        const savedInstructor = await Instructor.findOne({email:email});
     
        if(!savedInstructor){
            return res.status(200).json("Instructor with this email does not exists");
        }
        if(bcrypt.compareSync(password,savedInstructor.password)){
            const payload = {
                id:savedInstructor._id,
                email:savedInstructor.email,
                isAdmin: savedInstructor.isAdmin
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '6h'});
            return res.status(200).json({
                token,
                payload
            })
        }
        else{
            return res.status(400).json("Wrong Password Entered");
        }
    }catch(err){
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}
  
exports.getInstructors= async(req,res) =>{
    try{
       const savedInstructors= await Instructor.find().select('-password -isAdmin');
       return res.status(200).json(savedInstructors);
    }catch(err){
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getInstructorProfile = async (req, res) => {
    const instructorId = req.query.id || req.user.id; 
    try {
      const savedInstructor = await Instructor.findById(instructorId).select('-password -isAdmin'); 
      if (!savedInstructor) return res.status(404).json({ error: 'Instructor not found' });
      return res.status(200).json(savedInstructor);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteInstructor = async(req,res)=>{
    const instructorId = req.query.id;
    try {
        const savedInstructor = await Instructor.findById(instructorId);
        if (!savedInstructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        const tracking = await Tracking.findOne({ instructorId: instructorId });

        if (tracking) {
            // Remove all related activities within the tracking
            for (const activityId of tracking.activities) {
                await Activity.deleteOne({ _id: activityId });
            }

            // Delete the tracking document
            await Tracking.deleteOne({ instructorId: instructorId });
        }
       
        const deleted = await Instructor.deleteOne({_id:instructorId});
        return res.status(200).json({ message: 'Instructor deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
}