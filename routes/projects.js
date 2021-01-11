const express = require('express');

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectsForUser,
} = require('../controllers/projects');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const Project = require('../models/Project');

// Include other resources router
const ticketRouter = require('./tickets');
const userRouter = require('./users');

const router = express.Router();

// Re-route into other resource router
router.use('/:projectId/tickets', ticketRouter);
router.use('/:projectId/users', userRouter);

router
  .route('/')
  .get(
    protect,
    authorize('admin'),
    advancedResults(Project, 'numTickets'),
    getProjects
  )
  .post(protect, authorize('admin'), createProject);
router
  .route('/myprojects')
  .get(
    protect,
    authorize('admin', 'project manager', 'developer'),
    getProjectsForUser
  );
router
  .route('/:id')
  .get(protect, authorize('admin', 'project manager', 'developer'), getProject)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

module.exports = router;
