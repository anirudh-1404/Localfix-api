import mongoose from 'mongoose';
const providerSchema = new mongoose.Schema(
{
    providerName:{
        type:String,
        required: true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    phoneNumber:{
        type:String,
        required:true,
    },
    serviceCategory:{
        type:String,
        required:true,
    },
    yearsOfExperience:{
        type:Number,
        required: true,
        min: 0,
    },
    documentsVerified:{
        type:Boolean,
        default:false,
    },
    approvalStatus:{
        type:String,
        enum:["Pending" ,"Approved" , "Rejected"],
        default:"Pending",
    },
    adminRemarks:{
        type:String,
        trim:true,
    },
    approvedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    approvalDateTime:{
        type:Date,
    },
},
{
    timestamps:true,
}
);
export default mongoose.model("Provider",providerSchema);