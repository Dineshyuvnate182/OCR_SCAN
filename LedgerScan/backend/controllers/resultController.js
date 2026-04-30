const path = require('path')
const fs = require('fs')
const Result = require('../models/Result')
const Upload = require('../models/Upload')

// GET /api/result/:uploadId
const getResult = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.uploadId,
      user: req.user.id,
    })

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' })
    }

    const result = await Result.findOne({ upload: upload._id })

    if (!result) {
      return res.status(404).json({ message: 'Result not ready yet' })
    }

    res.json({
      uploadId: upload._id,
      originalName: upload.originalName,
      status: result.status,
      extractedText: result.extractedText,
      aiAnalysis: result.aiAnalysis,
      excelReady: !!result.excelPath,
      createdAt: result.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/result/excel/:uploadId
const downloadExcel = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.uploadId,
      user: req.user.id,
    })

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' })
    }

    const result = await Result.findOne({ upload: upload._id })

    if (!result || !result.excelPath) {
      return res.status(404).json({ message: 'Excel file not available' })
    }

    const absolutePath = path.resolve(result.excelPath)

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Excel file not found on server' })
    }

    const fileName = `LedgerScan_${upload.originalName.replace(/\.[^/.]+$/, '')}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.sendFile(absolutePath)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getResult, downloadExcel }
