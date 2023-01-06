import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  githubLogin: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const user = mongoose.model('User', schema);
