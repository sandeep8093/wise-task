const mongoose = require('mongoose');

const instructorSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        password: {
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        phone:{
            type:String,
            required:true
        },
        isAdmin:{
            type:Boolean,
            default:false
        }

    },{timestamps:true},
    {minimize:false}
);
module.exports = Instructor = mongoose.model('Instructor',instructorSchema);