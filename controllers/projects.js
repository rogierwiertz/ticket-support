const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all projects
// @route   GET /api/v1/projects
// @access  Admin
exports.getProjects = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// #desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Admin, Projectmanager*, Developer*
exports.getProject = asyncHandler(async (req, res, next) => {
  // Query filter depending on user role
  const filter = {
    _id: req.params.id,
  };
  if (req.user.role === 'project manager') {
    filter.projectManagerId = req.user._id;
  }
  if (req.user.role === 'developer') {
    filter.developerIds = { $in: req.user._id };
  }

  // Building up query
  let query = Project.findOne(filter);

  if (req.user.role === 'admin') {
    query = query
      .populate('developers', 'firstName lastName email')
      .populate('projectManager', 'firstName lastName email');
  } else if (req.user.role === 'project manager') {
    query = query.populate('developers', 'firstName lastName email');
  } else if (req.user.role === 'developer') {
    query = query.populate('projectManager', 'firstName lastName email');
  }

  // Execute query
  const project = await query;

  if (!project && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User is not associated with project ${req.params.id}`,
        403
      )
    );
  } else if (!project) {
    return next(
      new ErrorResponse(`Project with ID ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// #desc    Get all projects for the current logged in user
// @route   GET /api/v1/projects/myprojects
// @access  Admin, Project managers, developers
exports.getProjectsForUser = asyncHandler(async (req, res, next) => {
  // Filter depending on user role
  const filter = {};

  if (req.user.role === 'project manager') {
    filter.projectManagerId = req.user._id;
  }
  if (req.user.role === 'developer') {
    filter.developerIds = { $in: req.user._id };
  }

  // Building up query
  let query = Project.find(filter).populate('numTickets');

  if (req.user.role !== 'project manager') {
    query = query.populate('projectManager', 'firstName lastName email');
  }

  // Executing query
  const projects = await query;

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
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
// @access  Admin
exports.updateProject = asyncHandler(async (req, res, next) => {
  
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project with ID ${req.params.id} not found`, 404)
    );
  }

  const fieldsToUpdate = req.body;  
      
  fieldsToUpdate.updatedAt = Date.now();

  project = await Project.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
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

  await project.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
