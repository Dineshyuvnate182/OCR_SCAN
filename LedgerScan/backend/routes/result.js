const express = require('express')
const router = express.Router()
const { getResult, downloadExcel } = require('../controllers/resultController')
const { protect: auth } = require('../middleware/authMiddleware')

router.get('/:uploadId', auth, getResult)
router.get('/excel/:uploadId', auth, downloadExcel)

module.exports = router
