const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all projects
// @route   GET /api/v1/projects
// @access  Admin, Projectmanager*
exports.getProjects = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// #desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Admin, Projectmanager*, Developer*
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate('developers', 'firstName lastName email role');

  if (!project) {
    return next(
      new ErrorResponse(`Project with ID ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// #desc    Create a project
// @route   POST /api/v1/projects
// @access  Admin
exports.createProject = asyncHandler(async (req, res, next) => {
  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    data: project,
  });
});

// #desc    Update a project
// @route   PUT /api/v1/tickets/:id
// @access  Admin, Projectmanager*
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project with ID ${req.params.id} not found`, 404)
    );
  }

  //   Projectmanager can add developers to project
  //   Admin can change everything

  req.body.updatedAt = Date.now();

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
});

// #desc    Delete a project
// @route   DELETE /api/v1/projects/:id
// @access  Admin
exports.deleteProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project with ID ${req.params.id} not found`, 404)
    );
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
