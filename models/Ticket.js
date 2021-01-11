const fs = require('fs');
const path = require('path');
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
});

ticketSchema.pre('remove', async function(next) {
  console.log('called');
  // Delete ticket image if there is one
  const image = this.image;
  if (image !== 'no-photo.jpeg') {
    fs.unlink(path.join(process.cwd(), 'uploads', image), (err) => {
      if (err) {
        console.log(err)
      }
    });
  }

  // Remove comments for ticket
  await this.model('Comment').deleteMany({ticketId: this._id});

  next();
})

module.exports = mongoose.model('Ticket', ticketSchema);
