
import { Problem } from "../models/serviceSchema.js";
import { Service } from "../models/serviceSchema.js";

// Create Problem
export const createProblem = async (req, res) => {
    try {
        const { serviceId, title, description, price } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const problem = await Problem.create({
            service: serviceId,
            title,
            description,
            price,
        });

        res.status(201).json({
            message: "Problem created successfully",
            success: true,
            data: problem,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Problems by Service ID
export const getProblemsByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const problems = await Problem.find({ service: serviceId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: problems,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Single Problem
export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json({
            success: true,
            data: problem,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Problem
export const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({
            message: "Problem updated successfully",
            success: true,
            data: problem,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Problem
export const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json({
            message: "Problem deleted successfully",
            success: true,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
