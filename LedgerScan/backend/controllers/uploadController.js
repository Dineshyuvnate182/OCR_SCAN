const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const Upload = require('../models/Upload')
const Result = require('../models/Result')
const { analyzeWithAI, analyzeImageDirectlyWithAI } = require('../utils/aiAnalyzer')
const { generateExcel, updateExcel, mergeExcel } = require('../utils/excelGenerator')

// ── POST /api/upload/ocr-only ─────────────────────────────
// Step 1: upload file → OCR → return raw text to frontend
const ocrOnly = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const { path: filePath, mimetype: fileType, originalname: originalName } = req.file

    const uploadRecord = await Upload.create({
      user: req.user.id, originalName, filePath, fileType, status: 'processing',
    })

    // Call Python OCR service
    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath), originalName)

    let extractedText = ''
    try {
      const ocrRes = await axios.post(
        `${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/extract`,
        formData,
        { headers: formData.getHeaders(), timeout: 90000 }
      )
      extractedText = ocrRes.data.extracted_text || ''
    } catch (ocrErr) {
      console.error('OCR error:', ocrErr.message)
      await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'failed' })
      return res.status(500).json({ message: 'OCR service failed. Is python-service running on port 8000?', error: ocrErr.message })
    }

    await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'ocr_done' })

    res.json({
      message: 'OCR complete',
      uploadId: uploadRecord._id,
      extractedText,
      charCount: extractedText.length,
      lineCount: extractedText.split('\n').filter(Boolean).length,
    })
  } catch (err) {
    console.error('ocrOnly error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── POST /api/upload/analyze ──────────────────────────────
// Step 2: take (possibly edited) text → AI → Excel → return result
const analyzeText = async (req, res) => {
  try {
    const { uploadId, text } = req.body
    if (!uploadId || !text) return res.status(400).json({ message: 'uploadId and text are required' })

    const uploadRecord = await Upload.findOne({ _id: uploadId, user: req.user.id })
    if (!uploadRecord) return res.status(404).json({ message: 'Upload not found' })

    await Upload.findByIdAndUpdate(uploadId, { status: 'ai_processing' })

    // AI analysis
    let aiAnalysis = null
    try {
      aiAnalysis = await analyzeWithAI(text)
    } catch (aiErr) {
      console.error('AI error:', aiErr.message)
      aiAnalysis = { title: 'Extracted Data', headers: ['Text'], rows: [[text]], summary: {} }
    }

    // Generate or Update Excel
    let excelPath = null
    try {
      if (req.body.existingResultId) {
        const existingTarget = await Result.findById(req.body.existingResultId)
        if (!existingTarget || !existingTarget.excelPath) throw new Error('Target Excel not found')
        excelPath = await updateExcel(existingTarget.excelPath, aiAnalysis)
      } else {
        excelPath = await generateExcel(aiAnalysis, uploadId.toString())
      }
    } catch (excelErr) {
      console.error('Excel error:', excelErr.message)
    }

    // Save / update result
    const existing = await Result.findOne({ upload: uploadId })
    let result
    if (req.body.existingResultId) {
      // User is updating an older file instead of creating a new result
      const oldRes = await Result.findById(req.body.existingResultId)
      result = await Result.findByIdAndUpdate(req.body.existingResultId, {
        updatedAt: Date.now(),
        version: (oldRes.version || 1) + 1,
        rowCount: (oldRes.rowCount || 0) + (aiAnalysis?.rows?.length || 0),
        status: excelPath ? 'completed' : 'partial'
      }, { new: true })
    } else if (existing) {
      result = await Result.findByIdAndUpdate(existing._id,
        { extractedText: text, aiAnalysis, excelPath, status: excelPath ? 'completed' : 'partial', rowCount: aiAnalysis?.rows?.length || 0 },
        { new: true }
      )
    } else {
      result = await Result.create({
        upload: uploadId, user: req.user.id,
        extractedText: text, aiAnalysis, excelPath,
        status: excelPath ? 'completed' : 'partial',
        rowCount: aiAnalysis?.rows?.length || 0,
        version: 1
      })
    }

    await Upload.findByIdAndUpdate(uploadId, {
      status: excelPath ? 'completed' : 'partial',
      result: result._id,
    })

    res.json({
      message: 'Analysis complete',
      uploadId,
      resultId: result._id,
      aiAnalysis,
      excelReady: !!excelPath,
      status: result.status,
    })
  } catch (err) {
    console.error('analyzeText error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── POST /api/upload  (legacy single-step) ─────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const { path: filePath, mimetype: fileType, originalname: originalName } = req.file

    const uploadRecord = await Upload.create({
      user: req.user.id, originalName, filePath, fileType, status: 'processing',
    })

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath), originalName)

    let extractedText = ''
    try {
      const ocrRes = await axios.post(
        `${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/extract`,
        formData,
        { headers: formData.getHeaders(), timeout: 90000 }
      )
      extractedText = ocrRes.data.extracted_text || ''
    } catch (ocrErr) {
      await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'failed' })
      return res.status(500).json({ message: 'OCR failed', error: ocrErr.message })
    }

    let aiAnalysis = null
    try { aiAnalysis = await analyzeWithAI(extractedText) } catch {}

    let excelPath = null
    try { excelPath = await generateExcel(aiAnalysis || { rows: [], headers: [] }, uploadRecord._id.toString()) } catch {}

    const result = await Result.create({
      upload: uploadRecord._id, user: req.user.id,
      extractedText, aiAnalysis, excelPath,
      status: excelPath ? 'completed' : 'partial',
    })
    await Upload.findByIdAndUpdate(uploadRecord._id, {
      status: excelPath ? 'completed' : 'partial', result: result._id,
    })

    res.json({ message: 'Done', uploadId: uploadRecord._id, resultId: result._id, extractedText, aiAnalysis, excelReady: !!excelPath })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── GET /api/upload/history ───────────────────────────────
const getHistory = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('result', 'status excelPath createdAt aiAnalysis columns rowCount version updatedAt')
      .limit(50)
    res.json({ uploads })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── POST /api/upload/direct-ai ───────────────────────────
const directAiUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const { path: filePath, mimetype: fileType, originalname: originalName } = req.file

    const uploadRecord = await Upload.create({
      user: req.user.id, originalName, filePath, fileType, status: 'processing',
    })

    // AI analysis
    let aiAnalysis = null
    try {
      aiAnalysis = await analyzeImageDirectlyWithAI(filePath, fileType)
    } catch (aiErr) {
      console.error('AI error:', aiErr.message)
      await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'failed' })
      return res.status(500).json({ message: 'Direct AI analysis failed', error: aiErr.message })
    }

    // Generate or Update Excel
    let excelPath = null
    try {
      if (req.body.existingResultId) {
        const existingTarget = await Result.findById(req.body.existingResultId)
        if (!existingTarget || !existingTarget.excelPath) throw new Error('Target Excel not found')
        excelPath = await updateExcel(existingTarget.excelPath, aiAnalysis)
      } else {
        excelPath = await generateExcel(aiAnalysis, uploadRecord._id.toString())
      }
    } catch (excelErr) {
      console.error('Excel error:', excelErr.message)
    }

    // Save result
    let result
    if (req.body.existingResultId) {
      const oldRes = await Result.findById(req.body.existingResultId)
      result = await Result.findByIdAndUpdate(req.body.existingResultId, {
        updatedAt: Date.now(),
        version: (oldRes.version || 1) + 1,
        rowCount: (oldRes.rowCount || 0) + (aiAnalysis?.rows?.length || 0),
        status: excelPath ? 'completed' : 'partial'
      }, { new: true })
    } else {
      result = await Result.create({
        upload: uploadRecord._id, user: req.user.id,
        extractedText: "Extracted directly via Gemini Vision AI", aiAnalysis, excelPath,
        status: excelPath ? 'completed' : 'partial',
        rowCount: aiAnalysis?.rows?.length || 0,
        version: 1
      })
    }

    await Upload.findByIdAndUpdate(uploadRecord._id, {
      status: excelPath ? 'completed' : 'partial',
      result: result._id,
    })

    res.json({
      message: 'Direct AI Analysis complete',
      uploadId: uploadRecord._id,
      resultId: result._id,
      aiAnalysis,
      excelReady: !!excelPath,
      status: result.status,
    })
  } catch (err) {
    console.error('directAiUpload error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── POST /api/upload/merge ────────────────────────────────
// Upload a new file, extract data via Direct AI, merge into existing Excel
const mergeUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const { existingResultId } = req.body
    if (!existingResultId) return res.status(400).json({ message: 'existingResultId is required' })

    const existingResult = await Result.findById(existingResultId)
    if (!existingResult || !existingResult.excelPath) {
      return res.status(404).json({ message: 'Existing Excel file not found' })
    }

    const { path: filePath, mimetype: fileType, originalname: originalName } = req.file

    const uploadRecord = await Upload.create({
      user: req.user.id, originalName, filePath, fileType, status: 'processing',
    })

    // Extract data from the new file using Direct AI
    let aiAnalysis = null
    try {
      aiAnalysis = await analyzeImageDirectlyWithAI(filePath, fileType)
    } catch (aiErr) {
      console.error('AI error during merge:', aiErr.message)
      await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'failed' })
      return res.status(500).json({ message: 'AI extraction failed', error: aiErr.message })
    }

    // Smart merge into existing Excel
    let mergeResult = null
    try {
      mergeResult = await mergeExcel(existingResult.excelPath, aiAnalysis)
    } catch (mergeErr) {
      console.error('Merge error:', mergeErr.message)
      await Upload.findByIdAndUpdate(uploadRecord._id, { status: 'failed' })
      return res.status(500).json({ message: 'Excel merge failed', error: mergeErr.message })
    }

    // Update the existing result record
    const updatedResult = await Result.findByIdAndUpdate(existingResultId, {
      updatedAt: Date.now(),
      version: (existingResult.version || 1) + 1,
      rowCount: mergeResult.mergeInfo?.totalRows || ((existingResult.rowCount || 0) + (aiAnalysis?.rows?.length || 0)),
      columns: mergeResult.mergeInfo?.mergedHeaders || existingResult.columns,
      status: 'completed',
    }, { new: true })

    // Mark new upload as completed
    await Upload.findByIdAndUpdate(uploadRecord._id, {
      status: 'completed',
      result: updatedResult._id,
    })

    res.json({
      message: 'Merge complete!',
      uploadId: uploadRecord._id,
      resultId: updatedResult._id,
      aiAnalysis,
      mergeInfo: mergeResult.mergeInfo,
      excelReady: true,
      status: 'completed',
    })
  } catch (err) {
    console.error('mergeUpload error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { uploadFile, ocrOnly, analyzeText, getHistory, directAiUpload, mergeUpload }
