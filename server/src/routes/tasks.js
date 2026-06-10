const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// GET /api/tasks?projectId=xxx
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.query.projectId })
      .populate('assignee', 'name')
      .sort('order');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate('assignee', 'name');
    // Emit real-time event
    req.app.get('io').to(task.project.toString()).emit('task-created', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Emit real-time event
    req.app.get('io').to(task.project.toString()).emit('task-updated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    req.app.get('io').to(task.project.toString()).emit('task-deleted', { _id: task._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
