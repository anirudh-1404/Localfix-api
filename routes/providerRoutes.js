import express from "express";
import { upload } from "../utils/multerConfig.js";
import { Provider } from "../models/providerSchema.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    enrollProvider,
    getAllProviders,
    getProviderProfile,
    updateProviderProfile,
    updateProviderStatus,
    deleteProvider,
} from "../controllers/providerController.js";

const router = express.Router();

// Public/Authenticated Enrollment
router.post(
    "/enroll",
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "certification", maxCount: 1 },
        { name: "idImage", maxCount: 1 },
        { name: "documents", maxCount: 5 }
    ]),
    enrollProvider
);

// ✅ NEW: Find providers by pincode
// GET /api/providers/by-pincode?pincode=123456&serviceId=xxx (optional)
router.get("/by-pincode", protect, async (req, res) => {
    try {
        const { pincode, serviceId } = req.query;

        if (!pincode) {
            return res.status(400).json({ success: false, message: "Pincode is required" });
        }

        // Build query — match pincode and only approved providers
        const query = {
            pincode: Number(pincode),
            status: "approved",
        };

        // Optionally filter by service
        if (serviceId) {
            query.primaryService = serviceId;
        }

        const providers = await Provider.find(query)
            .select("ownerName businessName phone primaryService area city pincode experience description emergencyAvailability workingHours workingDays profilePhoto")
            .populate("primaryService", "name")
            .sort({ experience: -1 }); // Most experienced first

        return res.status(200).json({
            success: true,
            count: providers.length,
            data: providers,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Admin/Shared CRUD
router.get("/", getAllProviders);
router.get("/:id", getProviderProfile);
router.put(
    "/profile/:id",
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "certification", maxCount: 1 },
        { name: "idImage", maxCount: 1 },
        { name: "documents", maxCount: 5 }
    ]),
    updateProviderProfile
);
router.patch("/status/:id", updateProviderStatus);
router.delete("/:id", deleteProvider);

export default router;