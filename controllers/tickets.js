const Ticket = require('../models/Ticket');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all tickets
// @route   GET /api/v1/tickets
// @route   GET /api/v1/projects/:projectId/tickets
// @access  Admin
exports.getTickets = asyncHandler(async (req, res, next) => {
  if (req.params.projectId) {
    const tickets = await Ticket.find({ projectId: req.params.projectId });
    
    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  }

  res.status(200).json(res.advancedResults);
});

// #desc    Get single ticket
// @route   GET /api/v1/tickets/:id
// @access  Admin, Projectmanager*, Developer*
exports.getTicket = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket with ID ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// #desc    Create a ticket
// @route   POST /api/v1/tickets
// @access  Admin, Submitter
exports.createTicket = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.create(req.body);

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

// #desc    Update a ticket
// @route   PUT /api/v1/tickets/:id
// @access  Admin, Projectmanager*, Developer*
exports.updateTicket = asyncHandler(async (req, res, next) => {
  let ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(
      new ErrorResponse(`Ticket with ID ${req.params.id} not found`, 404)
    );
  }

  //   Submitters can change nothing
  //   Projectmanager can change project, type, status
  //   Developer can change status
  //   Admin can change everything

  req.body.updatedAt = Date.now();

  ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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
