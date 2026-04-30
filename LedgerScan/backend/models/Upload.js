const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number },
  status: {
    type: String,
    enum: ['processing', 'completed', 'partial', 'failed'],
    default: 'processing'
  },
  result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Upload', uploadSchema)
