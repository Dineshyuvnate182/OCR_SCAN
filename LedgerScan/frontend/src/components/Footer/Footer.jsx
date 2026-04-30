import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#1A1F36', color: '#CBD5E1' }} className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'Outfit' }}>
                Ledger<span style={{ color: '#4F8EF7' }}>Scan</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#94A3B8' }}>
              Extract text from images and PDFs, analyze it with AI, and generate structured Excel files — automatically.
            </p>
            <div className="flex gap-3 mt-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <a key={s} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#CBD5E1' }}
                  onMouseEnter={e => e.target.style.background = '#4F8EF7'}
                  onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: 'Outfit' }}>Product</h4>
            <ul className="space-y-2">
              {['Features', 'How it Works', 'Pricing', 'Dashboard'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm transition-colors hover:text-blue-400" style={{ color: '#94A3B8' }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: 'Outfit' }}>Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy Policy', to: '#' },
                { label: 'Terms of Service', to: '#' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm transition-colors hover:text-blue-400" style={{ color: '#94A3B8' }}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Bar */}
        <div className="rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: 'rgba(79, 142, 247, 0.1)', border: '1px solid rgba(79, 142, 247, 0.2)' }}>
          <div>
            <p className="font-semibold text-white text-sm" style={{ fontFamily: 'Outfit' }}>Need help getting started?</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>Our team is here for you. Reach out anytime.</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:hello@ledgerscan.ai" className="btn-primary text-sm py-2 px-4">Email Us</a>
            <Link to="/contact" className="text-sm py-2 px-4 rounded-xl border font-medium transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1' }}>
              Contact Form
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: '#64748B' }}>© 2026 LedgerScan. All rights reserved.</p>
          <p className="text-xs" style={{ color: '#64748B' }}>Made with ❤️ for smart data extraction</p>
        </div>
      </div>
    </footer>
  )
}
