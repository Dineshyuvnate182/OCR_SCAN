import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload', badge: 'New' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setProfileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(79,142,247,0.1)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 4px 24px rgba(79,142,247,0.06)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79,142,247,0.4)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14V8l6-5 6 5v6H11v-4H7v4H3Z" fill="white" fillOpacity="0.9"/>
                <rect x="7" y="10" width="4" height="4" rx="1" fill="white"/>
              </svg>
            </motion.div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#1A1F36', letterSpacing: '-0.3px' }}>
              Ledger<span style={{ color: '#4F8EF7' }}>Scan</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {navLinks.map(link => {
              const active = location.pathname === link.to
              return (
                <Link key={link.to} to={link.to} style={{ textDecoration: 'none', position: 'relative' }}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 10,
                      fontFamily: 'DM Sans', fontWeight: active ? 600 : 400, fontSize: 14,
                      color: active ? '#4F8EF7' : '#4B5563',
                      background: active ? 'rgba(79,142,247,0.08)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(79,142,247,0.05)'; e.currentTarget.style.color = '#4F8EF7' }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5563' } }}
                  >
                    {link.label}
                    {link.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                        background: 'linear-gradient(135deg,#FF6B35,#FF8C5A)', color: 'white',
                        fontFamily: 'Outfit', letterSpacing: '0.3px',
                      }}>{link.badge}</span>
                    )}
                  </motion.div>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: '#4F8EF7' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── Right Side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
            {user ? (
              <>
                {/* Upload CTA */}
                <Link to="/upload">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%)',
                      color: 'white', fontFamily: 'Outfit', fontWeight: 600, fontSize: 14,
                      boxShadow: '0 4px 14px rgba(79,142,247,0.4)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v8M4 4l3-3 3 3M2 11h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload File
                  </motion.button>
                </Link>

                {/* Profile Dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setProfileOpen(p => !p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '5px 10px 5px 5px', borderRadius: 30, border: '1.5px solid #E5E9F2',
                      background: 'white', cursor: 'pointer',
                      boxShadow: profileOpen ? '0 0 0 3px rgba(79,142,247,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit',
                    }}>
                      {initials}
                    </div>
                    {/* Name */}
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: '#1A1F36', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    {/* Chevron */}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <path d="M2 4l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          width: 240, borderRadius: 16, background: 'white',
                          border: '1px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Profile Header */}
                        <div style={{ padding: '16px', background: 'linear-gradient(135deg, #F0F5FF, #FAFBFF)', borderBottom: '1px solid #F0F0F0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 42, height: 42, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit',
                              boxShadow: '0 4px 12px rgba(79,142,247,0.3)',
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: '#1A1F36' }}>{user.name}</div>
                              <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{user.email}</div>
                            </div>
                          </div>
                          {/* Status pill */}
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 2px rgba(16,185,129,0.25)' }}></div>
                            <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#10B981', fontWeight: 500 }}>Active account</span>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div style={{ padding: '6px' }}>
                          {[
                            { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
                            { icon: '↑', label: 'Upload File', to: '/upload' },
                          ].map(item => (
                            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <span style={{ fontSize: 14 }}>{item.icon}</span>
                                <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.label}</span>
                              </div>
                            </Link>
                          ))}

                          <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }}></div>

                          <button
                            onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s', border: 'none', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 14 }}>⊗</span>
                            <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#EF4444', fontWeight: 500 }}>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ y: -1 }}
                    style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #E5E9F2', background: 'white', color: '#374151', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #4F8EF7, #2563EB)',
                      color: 'white', fontFamily: 'Outfit', fontWeight: 600, fontSize: 14,
                      boxShadow: '0 4px 14px rgba(79,142,247,0.4)',
                    }}
                  >
                    Create Account
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none' }}
          >
            <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} style={{ display: 'block', height: 2, background: '#374151', borderRadius: 2, transformOrigin: 'center' }} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} style={{ display: 'block', height: 2, background: '#374151', borderRadius: 2 }} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} style={{ display: 'block', height: 2, background: '#374151', borderRadius: 2, transformOrigin: 'center' }} />
            </div>
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'white', borderTop: '1px solid #F3F4F6', overflow: 'hidden' }}
            >
              <div style={{ padding: '12px 20px 20px' }}>
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ padding: '10px 0', fontFamily: 'DM Sans', fontSize: 15, color: location.pathname === link.to ? '#4F8EF7' : '#374151', borderBottom: '1px solid #F9FAFB' }}>
                      {link.label}
                    </div>
                  </Link>
                ))}
                {user ? (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FAFF', color: '#4F8EF7', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14 }}>Dashboard</div>
                    </Link>
                    <button onClick={handleLogout} style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#EF4444', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Link to="/login" style={{ flex: 1, textDecoration: 'none' }}>
                      <div style={{ padding: '10px', borderRadius: 10, border: '1.5px solid #E5E9F2', color: '#374151', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 14, textAlign: 'center' }}>Sign In</div>
                    </Link>
                    <Link to="/register" style={{ flex: 1, textDecoration: 'none' }}>
                      <div style={{ padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#4F8EF7,#2563EB)', color: 'white', fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Register</div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </>
  )
}
