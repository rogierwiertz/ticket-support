const express = require('express');

const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/tickets');

const advancedResults = require('../middleware/advancedResults');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');

const router = express.Router({mergeParams: true});

router.route('/').get(advancedResults(Ticket, {
  path: 'project',
  
  populate: {
    path: 'numTickets',    
  }
}), getTickets).post(createTicket);

router.route('/:id').get(getTicket).put(updateTicket).delete(deleteTicket);

module.exports = router;
