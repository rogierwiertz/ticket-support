const express = require('express');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');

const User = require('../models/User');

const router = express.Router({mergeParams: true});

router.route('/').get(protect, authorize('admin', 'project manager'), advancedResults(User), getUsers).post(protect, authorize('admin'), createUser);
router.route('/:id').get(protect, authorize('admin', 'project manager'), getUser).put(protect, authorize('admin'), updateUser).delete(protect, authorize('admin'), deleteUser);






module.exports = router;
