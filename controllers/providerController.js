import Provider from "../models/providerSchema";
import User from "../models/userSchema";

export const registerProvider = async(req,res) =>{
    try {
    const { providerName, email, phoneNumber, serviceCategory, yearsOfExperience } = req.body;
    if (!providerName || !email || !phoneNumber || !serviceCategory || !yearsOfExperience) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    
    }catch{}
}