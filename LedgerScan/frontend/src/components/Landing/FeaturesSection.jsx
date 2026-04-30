import { motion } from 'framer-motion'

const features = [
  {
    icon: '🔍',
    title: 'PaddleOCR Engine',
    desc: 'Industry-leading OCR accuracy for images, scanned PDFs, bills, and ledgers with multi-language support.',
    color: '#4F8EF7',
    bg: '#EFF6FF',
  },
  {
    icon: '🤖',
    title: 'AI Pattern Analysis',
    desc: 'Gemini AI analyzes extracted text and intelligently suggests the best Excel column structure for your data.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    icon: '📊',
    title: 'Auto Excel Generation',
    desc: 'Generates formatted, structured .xlsx files instantly — ready to open in Excel, Google Sheets, or LibreOffice.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: '🧠',
    title: 'Direct AI Vision',
    desc: 'Skip OCR entirely — send your image directly to Gemini Vision AI for one-click data extraction and Excel generation.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    isNew: true,
  },
  {
    icon: '📂',
    title: 'Update Existing Excel',
    desc: 'Append new scanned data into previously generated Excel files. Maintain one continuous report instead of creating duplicates.',
    color: '#FF6B35',
    bg: '#FFF5F0',
    isNew: true,
  },
  {
    icon: '📄',
    title: 'Multi-Format Support',
    desc: 'Accepts PNG, JPG, JPEG images; standard PDFs; image-PDFs; and scanned documents — all in one platform.',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    icon: '🔐',
    title: 'Secure & Private',
    desc: 'All files are processed securely. JWT authentication keeps your account and uploads protected at all times.',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    icon: '📜',
    title: 'Version History',
    desc: 'Track every update with version numbers, timestamps, and row counts. Full audit trail for every Excel file you manage.',
    color: '#6366F1',
    bg: '#EEF2FF',
    isNew: true,
  },
]

export default function FeaturesSection() {
  return (
    <section className="section-padding" style={{ background: '#FAFBFF' }} id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(79, 142, 247, 0.08)', color: '#4F8EF7', border: '1px solid rgba(79, 142, 247, 0.15)' }}>
            ✨ Powerful Features
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
            Everything You Need to Go<br />
            <span className="gradient-text">From Paper to Spreadsheet</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            LedgerScan combines advanced OCR, artificial intelligence, and automated Excel generation 
            into one seamless workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(79,142,247,0.1)' }}
              className="bg-white rounded-2xl p-6 border transition-all cursor-default relative"
              style={{ border: '1px solid #E5E9F2' }}
            >
              {f.isNew && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'linear-gradient(135deg, #FF6B35, #E85D04)',
                  color: 'white', fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20,
                  fontFamily: 'Outfit', letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(255,107,53,0.4)'
                }}>NEW</span>
              )}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500" style={{ fontFamily: 'DM Sans' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
