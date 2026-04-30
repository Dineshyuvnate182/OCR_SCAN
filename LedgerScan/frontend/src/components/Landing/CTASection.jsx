import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="section-padding" style={{ background: '#FAFBFF' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 50%, #1E40AF 100%)' }}
        >
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #FF6B35, transparent)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
              Start Extracting & Managing Data
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
              Create new Excel files or update existing ones with new scanned data. 
              Direct AI Vision, version history, and smart data appending — all in one platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register"
                className="py-3 px-8 rounded-xl font-semibold text-base transition-all"
                style={{ background: 'white', color: '#4F8EF7', fontFamily: 'Outfit' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Create Free Account →
              </Link>
              <Link to="/contact"
                className="py-3 px-8 rounded-xl font-semibold text-base border-2 border-white/30 text-white transition-all"
                style={{ fontFamily: 'Outfit' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
              >
                Talk to Sales
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6" style={{ fontFamily: 'DM Sans' }}>
              No credit card required • Free to get started • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
