const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// #desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  console.log(user);

  sendTokenResponse(user, 200, res);
});

// #desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //   Check user input
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //   Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  //   Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// #desc    Logout a user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      data: {},
    });
});

// #desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// #desc    Update user details
// @route   PUT /api/v1/auth/update
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {};
  
  // Set possible fields to update
  if (req.body.firstName) {
    fieldsToUpdate.email = req.body.firstName;
  }
  if (req.body.lastName) {
    fieldsToUpdate.email = req.body.lastName;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }

  // Find user and update
  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Send a response with a JWT
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJWT();

  const options = {
    expires: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRE
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user: {
      _id: user._id,
      role: user.role,
    },
    token,
  });
};
