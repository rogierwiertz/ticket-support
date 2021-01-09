const express = require('express');

const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsForUser,
} = require('../controllers/tickets');

const advancedResults = require('../middleware/advancedResults');
const Ticket = require('../models/Ticket');

const { protect, authorize } = require('../middleware/auth');

// Include other resources router
const commentRouter = require('./comments');

const router = express.Router({ mergeParams: true });

// Re-route into other resource router
router.use('/:ticketId/comments', commentRouter);


router
  .route('/')
  .get(
    protect,
    authorize('admin', 'project manager'),
    advancedResults(Ticket, {
      path: 'project',
      select: 'name description developerIds',
      populate: {
        path: 'numTickets',
      },
    }),
    getTickets
  )
  .post(protect, authorize('admin', 'submitter'), createTicket);
router.get('/mytickets', protect, getTicketsForUser);
router
  .route('/:id')
  .get(protect, getTicket)
  .put(
    protect,
    authorize('admin', 'project manager', 'developer'),
    updateTicket
  )
  .delete(protect, authorize('admin'), deleteTicket);

module.exports = router;
