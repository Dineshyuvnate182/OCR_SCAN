import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    name: 'Priya Mehta',
    role: 'Accountant, TechCorp India',
    avatar: 'PM',
    color: '#4F8EF7',
    text: 'LedgerScan has completely eliminated manual data entry for our monthly billing. What used to take 3 hours now takes 3 minutes. The AI column detection is surprisingly accurate!',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Medical Store Owner',
    avatar: 'RK',
    color: '#10B981',
    text: 'I upload my daily purchase bills and get a perfect Excel file instantly. The OCR handles even handwritten text better than I expected. Highly recommend for any small business.',
  },
  {
    name: 'Anita Sharma',
    role: 'Logistics Manager',
    avatar: 'AS',
    color: '#FF6B35',
    text: 'We process hundreds of invoices weekly. LedgerScan cut our processing time by 80% and virtually eliminated entry errors. The structured Excel output fits perfectly into our workflow.',
  },
  {
    name: 'Vikram Patel',
    role: 'CPA, Patel & Associates',
    avatar: 'VP',
    color: '#8B5CF6',
    text: 'The AI pattern analysis is brilliant. It automatically identifies GST amounts, line items, totals — and maps them to the right columns. Saves my team hours every week.',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="section-padding" style={{ background: '#F8FAFF' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ background: 'rgba(79, 142, 247, 0.08)', color: '#4F8EF7', border: '1px solid rgba(79, 142, 247, 0.15)' }}>
            ⭐ What Users Say
          </div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
            Trusted by <span className="gradient-text">Thousands</span> of Professionals
          </h2>
        </motion.div>

        <div className="relative min-h-52">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-8 shadow-xl text-center"
              style={{ border: '1px solid #E5E9F2' }}
            >
              <p className="text-lg text-gray-600 leading-relaxed mb-8 italic" style={{ fontFamily: 'DM Sans' }}>
                "{testimonials[active].text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: testimonials[active].color }}>
                  {testimonials[active].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>{testimonials[active].name}</div>
                  <div className="text-xs text-gray-400">{testimonials[active].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                background: i === active ? '#4F8EF7' : '#CBD5E1',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
