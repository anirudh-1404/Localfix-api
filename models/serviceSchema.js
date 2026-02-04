import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        providerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Provider",
            required: true,
        },
        serviceName:{
            type: String,
            required:true,
            trim:true,
        },
        serviceCategory:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            trim:true,
        },
        price:{
            type:Number,
            required: true,
            min:0,
        },
        isActive:{
            type:Boolean,
            default:true,
        },
    },
    {
        timestamps:true,
    }
);
export default mongoose.model("Service",serviceSchema);