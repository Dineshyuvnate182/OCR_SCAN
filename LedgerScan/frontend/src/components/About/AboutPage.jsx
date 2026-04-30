import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const team = [
  { name: 'Arjun Verma', role: 'Full Stack Developer', avatar: 'AV', color: '#4F8EF7' },
  { name: 'Sneha Patil', role: 'AI/ML Engineer', avatar: 'SP', color: '#10B981' },
  { name: 'Ravi Kulkarni', role: 'Python & OCR Engineer', avatar: 'RK', color: '#FF6B35' },
  { name: 'Meera Joshi', role: 'UI/UX Designer', avatar: 'MJ', color: '#8B5CF6' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: '#FAFBFF' }}>
      {/* Hero */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #1A1F36 0%, #252D4A 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>
              We're Building the<br />
              <span style={{ color: '#4F8EF7' }}>Future of Data Extraction</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
              LedgerScan was built by a team of engineers and designers from Pune, India,
              passionate about saving time through intelligent automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
                Our Mission
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4" style={{ fontFamily: 'DM Sans' }}>
                Millions of accountants, small business owners, and data professionals spend hours manually 
                entering data from invoices, bills, and receipts into spreadsheets. We believe this is a waste 
                of human potential.
              </p>
              <p className="text-gray-500 leading-relaxed" style={{ fontFamily: 'DM Sans' }}>
                LedgerScan combines PaddleOCR's state-of-the-art text recognition with AI analysis to make 
                this process instant, accurate, and effortless.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl p-8 grid grid-cols-2 gap-4"
              style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FFF4)' }}>
              {[
                { value: '10K+', label: 'Files Processed' },
                { value: '99%', label: 'OCR Accuracy' },
                { value: '80%', label: 'Time Saved' },
                { value: '500+', label: 'Happy Users' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid #E5E9F2' }}>
                  <div className="text-2xl font-black mb-1" style={{ fontFamily: 'Outfit', color: '#4F8EF7' }}>{s.value}</div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'DM Sans' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-padding" style={{ background: '#F8FAFF' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Built With World-Class Tech</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['PaddleOCR', 'Claude AI', 'React', 'Node.js', 'MongoDB', 'Python', 'ExcelJS', 'JWT Auth'].map(t => (
              <span key={t} className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'white', border: '1px solid #E5E9F2', color: '#1A1F36', fontFamily: 'Outfit' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Meet the Team</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center" style={{ border: '1px solid #E5E9F2' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white mx-auto mb-4"
                  style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}88)` }}>
                  {m.avatar}
                </div>
                <div className="font-semibold text-sm" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>{m.name}</div>
                <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'DM Sans' }}>{m.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding" style={{ background: '#F8FAFF' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: 'DM Sans' }}>
            Join LedgerScan and turn your documents into data — for free.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-primary">Create Free Account</Link>
            <Link to="/contact" className="py-3 px-6 rounded-xl border font-medium text-sm"
              style={{ borderColor: '#E5E9F2', color: '#6B7280', fontFamily: 'DM Sans' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
