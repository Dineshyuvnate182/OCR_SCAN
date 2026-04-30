const express = require('express')
const router = express.Router()
const { uploadFile, ocrOnly, analyzeText, getHistory, directAiUpload, mergeUpload } = require('../controllers/uploadController')
const { protect: auth } = require('../middleware/authMiddleware')
const upload = require('../config/multer')

// Step-1: upload file + run OCR only, return raw text
router.post('/ocr-only', auth, upload.single('file'), ocrOnly)

// Step-2: send (edited) text to AI, generate Excel
router.post('/analyze', auth, analyzeText)

// Direct AI: upload image directly to AI, skipping Python OCR
router.post('/direct-ai', auth, upload.single('file'), directAiUpload)

// Merge: upload new file, extract data, merge into existing Excel
router.post('/merge', auth, upload.single('file'), mergeUpload)

// Legacy single-step (kept for compatibility)
router.post('/', auth, upload.single('file'), uploadFile)

// History
router.get('/history', auth, getHistory)

module.exports = router
