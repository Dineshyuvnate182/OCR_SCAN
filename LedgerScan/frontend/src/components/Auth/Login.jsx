import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: 'linear-gradient(135deg, #F0F5FF 0%, #FAFBFF 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit' }}>LS</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Welcome Back</h1>
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>Sign in to your LedgerScan account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl" style={{ border: '1px solid #E5E9F2' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans', color: '#1A1F36' }}
                onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                onBlur={e => e.target.style.borderColor = '#E5E9F2'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #E5E9F2', fontFamily: 'DM Sans', color: '#1A1F36' }}
                onFocus={e => e.target.style.borderColor = '#4F8EF7'}
                onBlur={e => e.target.style.borderColor = '#E5E9F2'}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6" style={{ fontFamily: 'DM Sans' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#4F8EF7' }}>Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
