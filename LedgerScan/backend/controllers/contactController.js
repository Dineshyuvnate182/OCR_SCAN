// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' })
    }

    // In production: send email via nodemailer / SendGrid etc.
    console.log('📬 Contact form submission:', { name, email, subject, message })

    res.json({
      message: 'Thank you for reaching out! We will get back to you within 24 hours.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { submitContact }
