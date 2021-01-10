const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      minlength: [10, 'Please enter at least 10 charactes'],
      trim: true,
    },
    image: {
      type: String,
      default: 'no-photo.jpeg',
    },
    type: {
      type: String,
      enum: ['error', 'feature request'],
    },
    submitter: {
      type: mongoose.Schema.ObjectId,
      //   ref toevoegen
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority is either low, medium or high',
      },
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    projectId: mongoose.Schema.ObjectId,
    developerId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ticketSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

ticketSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'ticketId',
  justOne: false,
});

ticketSchema.virtual('numComments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'ticketId',
  count: true,
})

module.exports = mongoose.model('Ticket', ticketSchema);
