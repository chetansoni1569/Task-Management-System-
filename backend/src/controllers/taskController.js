const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");

const allowedStatuses = ["Pending", "In Progress", "Completed"];
const allowedPriorities = ["Low", "Medium", "High"];

const taskController = {
    getTasks: async (req, res) => {
        try {
            const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";

            let tasks;
            if (isAdmin) {
                tasks = await Task.find()
                    .populate("assignedTo", "name email role")
                    .populate("createdBy", "name email role");
            } else {
                tasks = await Task.find({ assignedTo: req.user._id })
                    .populate("assignedTo", "name email role")
                    .populate("createdBy", "name email role");
            }

            res.status(200).json({
                count: tasks.length,
                tasks
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server error while fetching tasks", error: err.message });
        }
    },

    getTaskById: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid task ID format" });
            }

            const task = await Task.findById(req.params.id)
                .populate("assignedTo", "name email role")
                .populate("createdBy", "name email role");

            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";
            const assignedId = task.assignedTo && task.assignedTo._id ? task.assignedTo._id.toString() : (task.assignedTo ? task.assignedTo.toString() : "");

            if (!isAdmin && assignedId !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "Access denied. You can only view tasks assigned to you."
                });
            }

            res.status(200).json({ task });
        } catch (err) {
            if (err.kind === "ObjectId" || err.name === "CastError") {
                return res.status(400).json({ message: "Invalid task ID format" });
            }
            console.log(err);
            res.status(500).json({ message: "Server error while fetching task", error: err.message });
        }
    },

    createTask: async (req, res) => {
        try {
            const { title, description, status, priority, dueDate, assignedTo } = req.body;

            if (!title || typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Task title is required and cannot be empty"
                });
            }

            if (!description || typeof description !== "string" || !description.trim()) {
                return res.status(400).json({
                    message: "Task description is required and cannot be empty"
                });
            }

            if (status !== undefined && status !== null && status !== "" && !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status. Allowed values are: Pending, In Progress, Completed"
                });
            }

            if (priority !== undefined && priority !== null && priority !== "" && !allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    message: "Invalid priority. Allowed values are: Low, Medium, High"
                });
            }

            if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
                if (isNaN(Date.parse(dueDate))) {
                    return res.status(400).json({
                        message: "Invalid due date format"
                    });
                }
            }

            let validAssignedTo = null;
            if (assignedTo && assignedTo !== "" && assignedTo !== "unassigned") {
                if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
                    return res.status(400).json({ message: "Invalid user ID format for assignedTo" });
                }
                const assignedUser = await User.findById(assignedTo);
                if (!assignedUser) {
                    return res.status(404).json({ message: "Assigned user not found" });
                }
                validAssignedTo = assignedUser._id;
            }

            const task = await Task.create({
                title: title.trim(),
                description: description.trim(),
                status: status || "Pending",
                priority: priority || "Medium",
                dueDate: dueDate || null,
                assignedTo: validAssignedTo,
                createdBy: req.user._id
            });

            const populatedTask = await Task.findById(task._id)
                .populate("assignedTo", "name email role")
                .populate("createdBy", "name email role");

            res.status(201).json({
                message: "Task created successfully",
                task: populatedTask
            });
        } catch (err) {
            if (err.name === "ValidationError") {
                return res.status(400).json({ message: err.message });
            }
            if (err.kind === "ObjectId" || err.name === "CastError") {
                return res.status(400).json({ message: "Invalid user ID format for assignedTo" });
            }
            console.log(err);
            res.status(500).json({ message: "Server error while creating task", error: err.message });
        }
    },

    updateTask: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";

            if (isAdmin) {
                const { title, description, status, priority, dueDate, assignedTo } = req.body;

                if (title !== undefined) {
                    if (typeof title !== "string" || !title.trim()) {
                        return res.status(400).json({ message: "Task title cannot be empty" });
                    }
                    task.title = title.trim();
                }

                if (description !== undefined) {
                    if (typeof description !== "string" || !description.trim()) {
                        return res.status(400).json({ message: "Task description cannot be empty" });
                    }
                    task.description = description.trim();
                }

                if (status !== undefined) {
                    if (!allowedStatuses.includes(status)) {
                        return res.status(400).json({
                            message: "Invalid status. Allowed values are: Pending, In Progress, Completed"
                        });
                    }
                    task.status = status;
                }

                if (priority !== undefined) {
                    if (!allowedPriorities.includes(priority)) {
                        return res.status(400).json({
                            message: "Invalid priority. Allowed values are: Low, Medium, High"
                        });
                    }
                    task.priority = priority;
                }

                if (dueDate !== undefined) {
                    if (dueDate !== null && dueDate !== "") {
                        if (isNaN(Date.parse(dueDate))) {
                            return res.status(400).json({ message: "Invalid due date format" });
                        }
                        task.dueDate = dueDate;
                    } else {
                        task.dueDate = null;
                    }
                }

                if (assignedTo !== undefined) {
                    if (!assignedTo || assignedTo === "" || assignedTo === "unassigned") {
                        task.assignedTo = null;
                    } else {
                        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
                            return res.status(400).json({ message: "Invalid user ID format for assignedTo" });
                        }
                        const userExists = await User.findById(assignedTo);
                        if (!userExists) {
                            return res.status(404).json({ message: "Assigned user not found" });
                        }
                        task.assignedTo = userExists._id;
                    }
                }
            } else {
                const assignedId = task.assignedTo ? task.assignedTo.toString() : "";
                if (assignedId !== req.user._id.toString()) {
                    return res.status(403).json({
                        message: "Access denied. You can only update tasks assigned to you."
                    });
                }

                const { status } = req.body;
                if (!status) {
                    return res.status(400).json({
                        message: "Regular users can only update the task status"
                    });
                }

                if (!allowedStatuses.includes(status)) {
                    return res.status(400).json({
                        message: "Invalid status. Allowed values are: Pending, In Progress, Completed"
                    });
                }

                task.status = status;
            }

            await task.save();

            const updatedTask = await Task.findById(task._id)
                .populate("assignedTo", "name email role")
                .populate("createdBy", "name email role");

            res.status(200).json({
                message: "Task updated successfully",
                task: updatedTask
            });
        } catch (err) {
            if (err.name === "ValidationError") {
                return res.status(400).json({ message: err.message });
            }
            if (err.kind === "ObjectId" || err.name === "CastError") {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            console.log(err);
            res.status(500).json({ message: "Server error while updating task", error: err.message });
        }
    },

    updateTaskStatus: async (req, res) => {
        try {
            const { status } = req.body;

            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status. Allowed values are: Pending, In Progress, Completed"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid task ID format" });
            }

            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";
            const assignedId = task.assignedTo ? task.assignedTo.toString() : "";

            if (!isAdmin && assignedId !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "Access denied. You can only update tasks assigned to you."
                });
            }

            task.status = status;
            await task.save();

            const updatedTask = await Task.findById(task._id)
                .populate("assignedTo", "name email role")
                .populate("createdBy", "name email role");

            res.status(200).json({
                message: "Task status updated successfully",
                task: updatedTask
            });
        } catch (err) {
            if (err.name === "ValidationError") {
                return res.status(400).json({ message: err.message });
            }
            if (err.kind === "ObjectId" || err.name === "CastError") {
                return res.status(400).json({ message: "Invalid task ID format" });
            }
            console.log(err);
            res.status(500).json({ message: "Server error while updating task status", error: err.message });
        }
    },

    deleteTask: async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid task ID format" });
            }

            const task = await Task.findById(req.params.id);

            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            await task.deleteOne();

            res.status(200).json({
                message: "Task deleted successfully",
                deletedTaskId: req.params.id
            });
        } catch (err) {
            if (err.kind === "ObjectId" || err.name === "CastError") {
                return res.status(400).json({ message: "Invalid task ID format" });
            }
            console.log(err);
            res.status(500).json({ message: "Server error while deleting task", error: err.message });
        }
    }
};

module.exports = taskController;
