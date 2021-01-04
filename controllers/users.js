const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Get all users
// @route   GET /api/v1/users
// @route   GET /api/v1/projects/:projectId/users
// @access  Admin, Projectmanager*
exports.getUsers = asyncHandler(async (req, res, next) => {
  if (req.params.projectId) {
    const userIds = await User.getUsersForProject(req.params.projectId);
    const users = await User.find({ _id: {$in: userIds} }).sort({lastName: 1, firstName: 1})

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  }

  res.status(200).json(res.advancedResults);
});

// #desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Admin, Projectmanager*,
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with ID ${req.params.id} not found.`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// #desc    Create a user
// @route   POST /api/v1/users
// @access  Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// #desc    Update a user
// @route   PUT /api/v1/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with ID ${req.params.id} not found`, 404)
    );
  }

  req.body.updatedAt = Date.now();

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// #desc    Delete a user
// @route   DELETE /api/v1/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with ID ${req.params.id} not found`, 404)
    );
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
