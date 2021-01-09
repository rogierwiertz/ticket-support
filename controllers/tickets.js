const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all tickets
// @route   GET /api/v1/tickets
// @route   GET /api/v1/projects/:projectId/tickets
// @access  Admin, Project manager*
exports.getTickets = asyncHandler(async (req, res, next) => {
  if (req.params.projectId) {
    const filter = { projectId: req.params.projectId };

    // Check if user is project manager of the specific project
    if (req.user.role === 'project manager') {
      const project = await Project.findOne({
        _id: req.params.projectId,
        projectManagerId: req.user._id,
      });
      
      if (!project) {
        return next(new ErrorResponse(`User is not allowed to get project details`, 403));
      }
      filter.projectId = project._id;
    }
    
    const tickets = await Ticket.find(filter);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } else if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with role ${req.user.role} is not allowed to access this route`,
        403
      )
    );
  }

  res.status(200).json(res.advancedResults);
});

// #desc    Get single ticket
// @route   GET /api/v1/tickets/:id
// @access  Admin, Projectmanager*, Developer*, Submitter*
exports.getTicket = asyncHandler(async (req, res, next) => {
  // Query filter depending on user role
  const filter = {
    _id: req.params.id,
  };
  if (req.user.role === 'submitter') {
    filter.submitter = req.user._id;
  } else if (req.user.role === 'developer') {
    filter.developerId = req.user._id;
  } else if (req.user.role === 'project manager') {
    const userProjects = await Project.find({ projectManagerId: req.user._id });
    const userProjectIds = userProjects.map((project) => project._id);
    filter.projectId = { $in: userProjectIds };
  }

  const ticket = await Ticket.findOne(filter);

  if (!ticket && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User not associated with ticket with ID ${req.params.id}.`,
        403
      )
    );
  } else if (!ticket) {
    return next(
      new ErrorResponse(`Ticket with ID ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// #desc    Get all tickets for the currently logged in user
// @route   GET /api/v1/tickets/mytickets
// @access  Admin, Projectmanager*, Developer*, Submitter*
exports.getTicketsForUser = asyncHandler(async (req, res, next) => {
  // Filter depending on user role
  let filter = {};
  if (req.user.role === 'submitter') {
    filter.submitter = req.user._id;
  } else if (req.user.role === 'developer') {
    filter.developerId = req.user._id;
  } else if (req.user.role === 'project manager') {
    const userProjects = await Project.find({ projectManagerId: req.user._id });
    const userProjectIds = userProjects.map((project) => project._id);
    filter.projectId = { $in: userProjectIds };
  }

  // Building up query
  let query = Ticket.find(filter);

  if (req.user.role === 'submitter') {
    query = query.select('-projectId -developerId');
  } else {
    query = query.populate({
      path: 'project',
      select: 'name description developerIds',
      populate: {
        path: 'numTickets',
      },
    });
  }

  // Executing query
  const tickets = await query;

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets,
  });
});

// #desc    Create a ticket
// @route   POST /api/v1/tickets
// @access  Admin, Submitter
exports.createTicket = asyncHandler(async (req, res, next) => {
  let fields = {};
  if (req.user.role === 'admin') {
    fields = req.body;
  } else {
    const { title, description } = req.body;
    fields.title = title;
    fields.description = description;
    fields.submitter = req.user._id;
  }
  const ticket = await Ticket.create(fields);

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

// #desc    Update a ticket
// @route   PUT /api/v1/tickets/:id
// @access  Admin, Projectmanager*, Developer*
exports.updateTicket = asyncHandler(async (req, res, next) => {
  const filter = { _id: req.params.id };

  if (req.user.role === 'developer') {
    filter.developerId = req.user._id;
  } else if (req.user.role === 'project manager') {
    const userProjects = await Project.find({ projectManagerId: req.user._id });
    const userProjectIds = userProjects.map((project) => project._id);
    filter.projectId = { $in: userProjectIds };
  }

  let ticket = await Ticket.findOne(filter);

  if (!ticket && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Not allowed to update ticket with ID ${req.params.id}`,
        403
      )
    );
  } else if (!ticket) {
    return next(
      new ErrorResponse(`Ticket with ID ${req.params.id} not found`, 404)
    );
  }

  // Set fields to update, depending on user role
  let fieldsToUpdate = {};

  if (req.user.role === 'admin') {
    fieldsToUpdate = req.body;
  }
  if (req.user.role === 'project manager') {
    const { type } = req.body;
    if (type) {
      fieldsToUpdate.type = type;
    }
  }
  if (req.user.role === 'project manager' || req.user.role === 'developer') {
    const { status } = req.body;
    if (status) {
      fieldsToUpdate.status = status;
    }
  }

  req.body.updatedAt = Date.now();

  ticket = await Ticket.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).populate('project');

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// #desc    Delete a ticket
// @route   DELETE /api/v1/tickets/:id
// @access  Admin, Projectmanager*
exports.deleteTicket = asyncHandler(async (req, res, next) => {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket with ID ${req.params.id} not found`, 404)
    );
  }

  await Ticket.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
