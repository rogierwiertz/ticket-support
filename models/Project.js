const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: [10, 'Please enter at least 10 charactes'],
    trim: true,
  },
  projectManagerId: mongoose.Schema.ObjectId,
  developerIds: [mongoose.Schema.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
},{
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

projectSchema.virtual('numTickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'projectId',
  count: true,
});
projectSchema.virtual('numDevelopers').get(function() {
  return this.developerIds.length;
});

module.exports = mongoose.model('Project', projectSchema);
