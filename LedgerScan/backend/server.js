require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')
const resultRoutes = require('./routes/result')
const contactRoutes = require('./routes/contact')
const errorHandler = require('./middleware/errorHandler')

const app = express()
connectDB()

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3002'
]
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/result', resultRoutes)
app.use('/api/contact', contactRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 LedgerScan server running on port ${PORT}`))
