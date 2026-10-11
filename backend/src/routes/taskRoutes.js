const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", taskController.getTasks);
router.post("/", authorizeRoles("Admin"), taskController.createTask);

router.get("/:id", taskController.getTaskById);
router.patch("/:id/status", taskController.updateTaskStatus);
router.put("/:id/status", taskController.updateTaskStatus);
router.put("/:id", taskController.updateTask);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", authorizeRoles("Admin"), taskController.deleteTask);

module.exports = router;
