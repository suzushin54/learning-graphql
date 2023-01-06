import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: String,
});

export const photo = mongoose.model('Photo', schema);
