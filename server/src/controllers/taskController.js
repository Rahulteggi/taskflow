const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/projects/:projectId/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name avatar')
      .populate('createdBy', 'name')
      .sort('order');
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, projectId, assigneeId, dueDate, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project: projectId,
      assignee: assigneeId || null,
      createdBy: req.user._id,
      dueDate,
      tags,
    });

    await task.populate('assignee', 'name avatar');
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignee', 'name avatar');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ text: req.body.text, author: req.user._id });
    await task.save();
    await task.populate('comments.author', 'name avatar');
    res.json(task.comments[task.comments.length - 1]);
  } catch (err) {
    next(err);
  }
};
