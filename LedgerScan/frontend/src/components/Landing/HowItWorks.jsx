import { motion } from 'framer-motion'

const steps = [
  { num: '01', icon: '📤', title: 'Upload Your File', desc: 'Drag & drop or browse to upload an image, PDF, or scanned document. We support all major formats.' },
  { num: '02', icon: '🔍', title: 'OCR Extracts Text', desc: 'PaddleOCR processes your file and extracts all readable text — or use Direct AI Vision to skip this step entirely.' },
  { num: '03', icon: '🤖', title: 'AI Structures Data', desc: 'Gemini AI reads the extracted text, identifies patterns, and determines the optimal Excel column layout.' },
  { num: '04', icon: '🔀', title: 'Choose Your Action', desc: 'Create a brand-new Excel file, or select a previously generated file from your history to append new data into it.' },
  { num: '05', icon: '📊', title: 'Excel Generated', desc: 'A fully formatted .xlsx file is created or updated with new rows appended — version tracked and ready to download.' },
  { num: '06', icon: '📂', title: 'History & Versions', desc: 'All files are saved to your dashboard with version numbers, row counts, and timestamps for complete audit trail.' },
]

export default function HowItWorks() {
  return (
    <section className="section-padding" style={{ background: 'linear-gradient(135deg, #1A1F36 0%, #252D4A 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(79, 142, 247, 0.15)', color: '#7CB9FF', border: '1px solid rgba(79, 142, 247, 0.25)' }}>
            🔄 How It Works
          </div>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Six Steps to a Clean<br />
            <span style={{ color: '#FF6B35' }}>Structured Spreadsheet</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            From upload to Excel in under 30 seconds. Create new files or update existing ones — no duplicates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 h-0.5 z-10"
                  style={{ background: 'linear-gradient(90deg, #4F8EF7, transparent)' }} />
              )}
              <div className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit', color: 'rgba(79,142,247,0.2)' }}>
                {step.num}
              </div>
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2" style={{ fontFamily: 'Outfit' }}>{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed" style={{ fontFamily: 'DM Sans' }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
