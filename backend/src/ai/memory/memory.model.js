import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Memory', memorySchema);