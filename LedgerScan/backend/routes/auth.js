const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/authController')
const { protect: auth } = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', auth, getMe)

module.exports = router
