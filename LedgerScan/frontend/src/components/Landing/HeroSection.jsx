import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-20"
      style={{ background: 'linear-gradient(135deg, #F0F5FF 0%, #FAFBFF 60%, #FFF5F0 100%)' }}>

      {/* Background Blobs */}
      <div className="absolute top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #4F8EF7, transparent)' }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Side */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(79, 142, 247, 0.1)', color: '#4F8EF7', border: '1px solid rgba(79, 142, 247, 0.2)' }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            AI-Powered OCR to Excel
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
            Extract Text.<br />
            <span className="gradient-text">Analyze with AI.</span><br />
            Update Excel Files.
          </h1>

          <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg" style={{ fontFamily: 'DM Sans' }}>
            Upload any image or PDF — LedgerScan extracts text via PaddleOCR or Direct AI Vision, 
            structures data with Gemini AI, and generates Excel files. <strong style={{ color: '#FF6B35' }}>Append new data to existing files</strong> instead of creating duplicates.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base py-3 px-8">
              Get Started Free →
            </Link>
            <Link to="/about" className="py-3 px-8 rounded-xl font-semibold text-base border-2 transition-all"
              style={{ borderColor: '#E5E9F2', color: '#1A1F36', fontFamily: 'Outfit' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4F8EF7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E9F2'}
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12">
            {[
              { value: '99%', label: 'OCR Accuracy' },
              { value: '< 10s', label: 'Processing Time' },
              { value: '50+', label: 'File Formats' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Outfit', color: '#4F8EF7' }}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Visual Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex justify-center"
        >
          <div className="float-anim relative">
            {/* Main Card */}
            <div className="glass-card rounded-3xl p-8 w-80 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-lg">📄</div>
                <div>
                  <div className="font-semibold text-sm" style={{ fontFamily: 'Outfit' }}>invoice_april.pdf</div>
                  <div className="text-xs text-gray-400">Processing...</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }} animate={{ width: '85%' }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4F8EF7, #FF6B35)' }}
                />
              </div>

              <div className="space-y-2 text-xs text-gray-500" style={{ fontFamily: 'DM Sans' }}>
                <div className="flex justify-between"><span>✅ OCR Extraction</span><span className="text-green-500">Done</span></div>
                <div className="flex justify-between"><span>🤖 AI Analysis</span><span className="text-blue-500">Running...</span></div>
                <div className="flex justify-between"><span>📊 Excel Generation</span><span className="text-gray-300">Pending</span></div>
              </div>

              <button className="btn-accent w-full mt-6 text-sm py-2.5">
                Download Excel →
              </button>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-2 shadow-lg">
              <div className="text-xs font-semibold text-green-600">✓ 12 items extracted</div>
            </div>

            {/* Floating badge 2 - Update Feature */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 shadow-lg"
            >
              <div className="text-xs font-bold" style={{ color: '#FF6B35' }}>📂 Append to fees_report.xlsx</div>
              <div className="text-[10px] text-gray-400 mt-0.5">v2 · 24 rows · Updated just now</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
