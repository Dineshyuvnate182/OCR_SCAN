import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to LedgerScan 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans', color: '#1A1F36'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #FAFBFF 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit' }}>LS</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Create Account</h1>
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>Start extracting data for free today</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl" style={{ border: '1px solid #E5E9F2' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your Name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>{field.label}</label>
                <input
                  type={field.type} required
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF6B35'}
                  onBlur={e => e.target.style.borderColor = '#E5E9F2'}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-accent w-full py-3 text-base">
              {loading ? 'Creating Account...' : 'Create Free Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6" style={{ fontFamily: 'DM Sans' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#FF6B35' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
