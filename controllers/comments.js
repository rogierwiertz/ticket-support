const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all comments
// @route   GET /api/v1/comments
// @route   GET /api/v1/tickets/:ticketId/comments
// @access  Admin, Project manager*, Developer*, Submitter*
exports.getComments = asyncHandler(async (req, res, next) => {
  if (req.params.ticketId) {
    // For non admin users, check if associated with requested ticket
    if (req.user.role !== 'admin') {
      // Query filter depending on user role
      const ticketFilter = {
        _id: req.params.ticketId,
      };
      if (req.user.role === 'submitter') {
        ticketFilter.submitter = req.user._id;
      } else if (req.user.role === 'developer') {
        ticketFilter.developerId = req.user._id;
      } else if (req.user.role === 'project manager') {
        const userProjects = await Project.find({
          projectManagerId: req.user._id,
        });
        const userProjectIds = userProjects.map((project) => project._id);
        ticketFilter.projectId = { $in: userProjectIds };
      }

      const ticket = await Ticket.findOne(ticketFilter);

      if (!ticket) {
        return next(
          new ErrorResponse(
            `User not associated with ticket with ID ${req.params.ticketId}.`,
            403
          )
        );
      }
    }
    // Filter for getting comments depending on user role
    const filter = { ticketId: req.params.ticketId };

    if (req.user.role === 'submitter') {
      filter.visibility = 'public';
    } else if (req.user.role !== 'admin') {
      filter.$or = [
        { visibility: { $ne: 'private' } },
        { authorId: req.user._id },
      ];
    }

    const comments = await Comment.find(filter).populate(
      'author',
      'firstName lastName role'
    );

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } else if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User role ${req.user.role} not allowed to access this route`,
        403
      )
    );
  }
  res.status(200).json(res.advancedResults);
});

// #desc    Create a comment
// @route   POST /api/v1/comments
// @access  Admin, Project manager, Developer, Submitter
exports.createComment = asyncHandler(async (req, res, next) => {
  let fields = {};
  const authorId = req.user._id;

  // Process for non admin users
  if (req.user.role !== 'admin') {
    const { title, content, ticketId, visibility } = req.body;

    // check if user is allowed to create comment on ticket
    const filter = {};
    switch (req.user.role) {
      case 'submitter':
        filter._id = ticketId;
        filter.submitter = req.user._id;
        break;
      case 'developer':
        filter._id = ticketId;
        filter.developerId = req.user._id;
        break;
      case 'project manager':
        const userProjects = await Project.find({
          projectManagerId: req.user._id,
        });
        const userProjectIds = userProjects.map((project) => project._id);
        filter._id = ticketId;
        filter.projectId = { $in: userProjectIds };
        break;
    }
    const ticket = await Ticket.findOne(filter);

    if (!ticket) {
      return next(
        new ErrorResponse(
          `Ticket with ID ${ticketId} is not associated with user or doesn't exist.`
        )
      );
    }

    fields = {
      title,
      content,
      ticketId,
    };

    if (req.user.role !== 'submitter') {
      fields.visibility = visibility;
    }
  } else if (req.user.role === 'admin') {
    fields = req.body;
  }

  fields.authorId = authorId;

  const comment = await Comment.create(fields);

  res.status(201).json({
    success: true,
    data: comment,
  });
});

// #desc    Update a comment
// @route   PUT /api/v1/comments/:id
// @access  Admin, Projectmanager*, Developer*, Submitter*
exports.updateComment = asyncHandler(async (req, res, next) => {
  // Filter for finding comment
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    filter.authorId = req.user._id;
  }

  // Setting fields to update
  let fieldsToUpdate = {};

  if (req.user.role === 'admin') {
    fieldsToUpdate = req.body;
  } else {
    const { title, content, visibility } = req.body;

    if (title) {
      fieldsToUpdate.title = title;
    }
    if (content) {
      fieldsToUpdate.content = content;
    }

    if (req.user.role !== 'submitter') {
      if (visibility) {
        fieldsToUpdate.visibility = visibility;
      }
    }
  }

  const comment = await Comment.findOneAndUpdate(filter, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!comment && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User is not the author of comment with ID ${req.params.id}`,
        401
      )
    );
  } else if (!comment) {
    return next(
      new ErrorResponse(`Comment with ID ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// #desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Admin, Projectmanager*, Developer*, Submitter*
exports.deleteComment = asyncHandler(async (req, res, next) => {
  // Filter for finding comment
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') {
    filter.authorId = req.user._id;
  }

  const comment = await Comment.findOneAndDelete(filter);

  if (!comment && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User is not the author of comment with ID ${req.params.id}`,
        401
      )
    );
  } else if (!comment) {
    return next(
      new ErrorResponse(`Comment with ID ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
