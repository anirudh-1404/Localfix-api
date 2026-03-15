
import express from "express";
import {
    createProblem,
    getProblemsByServiceId,
    getProblemById,
    updateProblem,
    deleteProblem,
} from "../controllers/problemController.js";

const router = express.Router();

router.post("/", createProblem);
router.get("/service/:serviceId", getProblemsByServiceId);
router.get("/:id", getProblemById);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

export default router;
