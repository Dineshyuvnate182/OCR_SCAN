import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/upload/history')
      .then(res => setUploads(res.data.uploads || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (id, filename) => {
    try {
      const res = await api.get(`/result/excel/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Excel downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  const stats = [
    { label: 'Total Uploads', value: uploads.length, icon: '📤', color: '#4F8EF7' },
    { label: 'Processed', value: uploads.filter(u => u.status === 'done').length, icon: '✅', color: '#10B981' },
    { label: 'Excel Files', value: uploads.filter(u => u.excelReady).length, icon: '📊', color: '#FF6B35' },
    { label: 'This Month', value: uploads.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, icon: '📅', color: '#8B5CF6' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: '#FAFBFF' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 mt-1" style={{ fontFamily: 'DM Sans' }}>
              Here's your LedgerScan activity overview
            </p>
          </div>
          <Link to="/upload" className="btn-primary">
            + Upload New File
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
              style={{ border: '1px solid #E5E9F2' }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit', color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-gray-400" style={{ fontFamily: 'DM Sans' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #E5E9F2' }}>
          <div className="p-6 border-b" style={{ borderColor: '#E5E9F2' }}>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Outfit', color: '#1A1F36' }}>Upload History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📂</div>
              <p className="font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Outfit' }}>No uploads yet</p>
              <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'DM Sans' }}>Upload your first file to get started</p>
              <Link to="/upload" className="btn-primary">Upload a File</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F8FAFF' }}>
                    {['File Name', 'Type', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        style={{ fontFamily: 'Outfit' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload, i) => (
                    <tr key={upload._id} className="border-t hover:bg-blue-50/30 transition-colors"
                      style={{ borderColor: '#F1F5F9' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{upload.fileType === 'pdf' ? '📄' : '🖼️'}</span>
                          <span className="text-sm font-medium" style={{ color: '#1A1F36', fontFamily: 'DM Sans' }}>
                            {upload.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                          style={{ background: '#EFF6FF', color: '#4F8EF7' }}>
                          {upload.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          upload.status === 'done' ? 'bg-green-50 text-green-600' :
                          upload.status === 'processing' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-500'
                        }`}>
                          {upload.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400" style={{ fontFamily: 'DM Sans' }}>
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {upload.excelReady ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(upload._id, upload.originalName)}
                              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                              style={{ background: '#EFF6FF', color: '#4F8EF7', fontFamily: 'DM Sans' }}
                            >
                              ↓ Download
                            </button>
                            <Link
                              to="/upload"
                              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                              style={{ background: '#FFF7ED', color: '#EA580C', fontFamily: 'DM Sans', display: 'inline-block' }}
                              title="Upload a new image to append to this file"
                            >
                              + Update
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
