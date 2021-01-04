const express = require('express');

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projects');

const advancedResults = require('../middleware/advancedResults');

const Project = require('../models/Project');

// Include other resources router
const ticketRouter = require('./tickets');
const userRouter = require('./users');

const router = express.Router();

// Re-route into other resource router
router.use('/:projectId/tickets', ticketRouter);
router.use('/:projectId/users', userRouter);

router.route('/').get(advancedResults(Project, 'numTickets'), getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);


module.exports = router;
