const express = require('express');

const { getComments, createComment, updateComment, deleteComment } = require('../controllers/comments');

const advancedResults = require('../middleware/advancedResults');
const Comment = require('../models/Comment');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    protect,
    advancedResults(Comment, {
        path: 'author',
        select: 'firstName lastName role'
    }),
    getComments
  )
  .post(protect, createComment);

  router.route('/:id').put(protect,updateComment).delete(protect, deleteComment);
module.exports = router;
