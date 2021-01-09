const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add some content'],
      trim: true,
    },
    authorId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Please add an author ID'],
    },
    ticketId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Please add a ticket ID'],
    },
    visibility: {
      type: String,
      enum: {
        values: ['private', 'intern', 'public'],
        message: 'Visibility is either private, intern or public',
      },
      default: 'public',
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

commentSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Comment', commentSchema);
