import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message sent! We\'ll get back to you soon.')
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'hello@ledgerscan.ai' },
    { icon: '📍', label: 'Location', value: 'Pimpri, Pune, Maharashtra, India' },
    { icon: '⏰', label: 'Support Hours', value: 'Mon–Sat, 9am–6pm IST' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: '#FAFBFF' }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto" style={{ fontFamily: 'DM Sans' }}>
            Have a question or need help? Our team is happy to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, #1A1F36, #252D4A)' }}>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map(info => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="text-2xl">{info.icon}</div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5" style={{ fontFamily: 'DM Sans' }}>{info.label}</div>
                      <div className="text-sm text-white font-medium" style={{ fontFamily: 'DM Sans' }}>{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E5E9F2' }}>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Quick Help</h3>
              <div className="space-y-3">
                {['How does OCR work?', 'What file formats are supported?', 'How to download Excel?', 'Pricing information'].map(q => (
                  <div key={q} className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
                    style={{ fontFamily: 'DM Sans' }}>
                    <span>→</span> {q}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #E5E9F2' }}>
                <div className="text-5xl mb-4">✉️</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Message Sent!</h2>
                <p className="text-gray-400" style={{ fontFamily: 'DM Sans' }}>We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #E5E9F2' }}>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { key: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe' },
                      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>{f.label}</label>
                        <input type={f.type} required value={form[f.key]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={{ border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans' }}
                          onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                          onBlur={e => e.target.style.borderColor = '#E5E9F2'} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>Subject</label>
                    <input type="text" required value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans' }}
                      onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                      onBlur={e => e.target.style.borderColor = '#E5E9F2'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>Message</label>
                    <textarea required value={form.message} rows={6}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your question or issue in detail..."
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{ border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans' }}
                      onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                      onBlur={e => e.target.style.borderColor = '#E5E9F2'} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
