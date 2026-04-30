const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  upload: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  extractedText: { type: String },
  aiAnalysis: { type: mongoose.Schema.Types.Mixed },
  excelPath: { type: String },
  status: { type: String, enum: ['completed', 'partial', 'failed'], default: 'completed' },
  columns: [{ type: String }],
  rowCount: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

resultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Result', resultSchema)
