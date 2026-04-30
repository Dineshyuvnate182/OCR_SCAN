import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const ACCEPTED = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

export default function HistoryPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergeResult, setMergeResult] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/upload/history");
      setUploads((res.data.uploads || []).filter((u) => u.result?.excelPath));
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (uploadId, filename) => {
    try {
      const res = await api.get(`/result/excel/${uploadId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setMergeResult(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    onDropRejected: () => toast.error("File too large or unsupported"),
  });

  const animateProgress = (from, to, duration) => {
    const steps = 30;
    const inc = (to - from) / steps;
    const delay = duration / steps;
    let cur = from;
    const timer = setInterval(() => {
      cur += inc;
      setProgress(Math.min(Math.round(cur), to));
      if (cur >= to) clearInterval(timer);
    }, delay);
  };

  const handleMerge = async () => {
    if (!file || !selectedItem) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("existingResultId", selectedItem.result._id);

    try {
      setMerging(true);
      setProgress(0);
      animateProgress(0, 85, 5000);
      const res = await api.post("/upload/merge", formData);
      animateProgress(85, 100, 500);
      setTimeout(() => {
        setMergeResult(res.data);
        setMerging(false);
        setProgress(100);
        toast.success("Data merged successfully!");
        fetchHistory();
      }, 600);
    } catch (err) {
      setMerging(false);
      toast.error(err.response?.data?.message || "Merge failed");
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setFile(null);
    setPreview(null);
    setMergeResult(null);
    setMerging(false);
    setProgress(0);
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, paddingBottom: 64, background: "#F8FAFF" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 30, background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)", marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4F8EF7" }} />
            <span style={{ fontFamily: "DM Sans", fontSize: 13, color: "#4F8EF7", fontWeight: 500 }}>Excel History & Merge</span>
          </div>
          <h1 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 36, color: "#1A1F36", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            Your Excel History
          </h1>
          <p style={{ fontFamily: "DM Sans", color: "#6B7280", fontSize: 15, margin: 0 }}>
            Click any file to upload a new PDF/image and merge extracted data into it
          </p>
        </motion.div>

        {/* History List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #EFF6FF", borderTopColor: "#4F8EF7", animation: "spin 1s linear infinite" }} />
          </div>
        ) : uploads.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 20, border: "1px solid #E5E9F2" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <p style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: 18, color: "#1A1F36", marginBottom: 8 }}>No Excel files yet</p>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>Upload your first file to get started</p>
            <Link to="/upload" style={{ padding: "12px 28px", borderRadius: 12, background: "linear-gradient(135deg,#4F8EF7,#2563EB)", color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
              Upload a File
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {uploads.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedItem(u); setFile(null); setPreview(null); setMergeResult(null); }}
                style={{
                  background: selectedItem?._id === u._id ? "#F0F5FF" : "white",
                  borderRadius: 16, padding: 20, cursor: "pointer",
                  border: selectedItem?._id === u._id ? "2px solid #4F8EF7" : "1px solid #E5E9F2",
                  transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
                onMouseEnter={(e) => { if (selectedItem?._id !== u._id) e.currentTarget.style.borderColor = "#93B8F7"; }}
                onMouseLeave={(e) => { if (selectedItem?._id !== u._id) e.currentTarget.style.borderColor = "#E5E9F2"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📊</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: 14, color: "#1A1F36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.originalName}
                    </div>
                    <div style={{ fontFamily: "DM Sans", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: "#ECFDF5", color: "#059669", fontFamily: "DM Sans", fontSize: 11, fontWeight: 600 }}>
                    {u.result?.aiAnalysis?.rows?.length || u.result?.rowCount || 0} rows
                  </span>
                  {u.result?.version > 1 && (
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "#FFF7ED", color: "#EA580C", fontFamily: "DM Sans", fontSize: 11, fontWeight: 600 }}>
                      v{u.result.version}
                    </span>
                  )}
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: "#EFF6FF", color: "#4F8EF7", fontFamily: "DM Sans", fontSize: 11, fontWeight: 600 }}>
                    {u.result?.status || "unknown"}
                  </span>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(u._id, u.originalName); }}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #E5E9F2", background: "white", fontFamily: "DM Sans", fontSize: 12, fontWeight: 600, color: "#4F8EF7", cursor: "pointer" }}
                  >↓ Download</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(u); setFile(null); setPreview(null); setMergeResult(null); }}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4F8EF7,#2563EB)", fontFamily: "DM Sans", fontSize: 12, fontWeight: 600, color: "white", cursor: "pointer" }}
                  >+ Merge New Data</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Merge Panel */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              style={{ marginTop: 32, background: "white", borderRadius: 20, border: "2px solid #4F8EF7", overflow: "hidden", boxShadow: "0 8px 32px rgba(79,142,247,0.12)" }}
            >
              {/* Panel Header */}
              <div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#F0F5FF,#E8F0FE)", borderBottom: "1px solid #DBEAFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: 18, color: "#1A1F36" }}>
                    Merge into: {selectedItem.originalName}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontFamily: "DM Sans", fontSize: 13, color: "#6B7280" }}>
                    Upload a new PDF/image — extracted data will be merged with column matching
                  </p>
                </div>
                <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9CA3AF", padding: 4 }}>✕</button>
              </div>

              <div style={{ padding: 28 }}>
                {/* Merge Success */}
                {mergeResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 20px rgba(16,185,129,0.3)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12l6 6 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <h3 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 22, color: "#1A1F36", margin: "0 0 8px" }}>Merge Complete!</h3>
                    <p style={{ fontFamily: "DM Sans", fontSize: 14, color: "#6B7280", margin: "0 0 20px" }}>
                      {mergeResult.mergeInfo?.newRowsAdded || 0} new rows added
                      {mergeResult.mergeInfo?.addedCols > 0 && ` · ${mergeResult.mergeInfo.addedCols} new columns added`}
                      {` · ${mergeResult.mergeInfo?.totalRows || 0} total rows now`}
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                      <button onClick={() => handleDownload(selectedItem._id, selectedItem.originalName)} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4F8EF7,#2563EB)", color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(79,142,247,0.3)" }}>
                        ↓ Download Merged Excel
                      </button>
                      <button onClick={() => { setFile(null); setPreview(null); setMergeResult(null); }} style={{ padding: "12px 24px", borderRadius: 12, border: "1.5px solid #E5E9F2", background: "white", color: "#374151", fontFamily: "Outfit", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                        Merge Another File
                      </button>
                    </div>
                  </motion.div>
                ) : merging ? (
                  /* Merging Progress */
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid #EFF6FF", borderTopColor: "#4F8EF7", margin: "0 auto 20px" }} />
                    <h3 style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 20, color: "#1A1F36", margin: "0 0 8px" }}>🤖 Extracting & Merging...</h3>
                    <p style={{ fontFamily: "DM Sans", fontSize: 13, color: "#9CA3AF", margin: "0 0 24px" }}>AI is extracting data from your file and matching columns</p>
                    <div style={{ width: "100%", height: 8, background: "#F3F4F6", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                      <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", background: "linear-gradient(90deg,#4F8EF7,#10B981)", borderRadius: 8 }} />
                    </div>
                    <span style={{ fontFamily: "DM Sans", fontSize: 13, color: "#4F8EF7", fontWeight: 600 }}>{progress}%</span>
                  </div>
                ) : (
                  /* Upload Dropzone */
                  <div style={{ display: "grid", gridTemplateColumns: file ? "1fr 1fr" : "1fr", gap: 20 }}>
                    <div
                      {...getRootProps()}
                      style={{
                        background: isDragActive ? "rgba(79,142,247,0.04)" : "#FAFBFF",
                        border: `2px dashed ${isDragActive ? "#4F8EF7" : "#CBD5E1"}`,
                        borderRadius: 16, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      <input {...getInputProps()} />
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{isDragActive ? "📂" : "☁️"}</div>
                      <p style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 16, color: "#1A1F36", marginBottom: 6 }}>
                        {isDragActive ? "Drop here!" : "Drop your new file"}
                      </p>
                      <p style={{ fontFamily: "DM Sans", fontSize: 13, color: "#9CA3AF", margin: "0 0 14px" }}>or click to browse</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        {["PNG", "JPG", "PDF"].map((t) => (
                          <span key={t} style={{ padding: "3px 10px", borderRadius: 16, background: "#EFF6FF", color: "#4F8EF7", fontFamily: "Outfit", fontSize: 11, fontWeight: 600 }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    {file && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {preview && (
                          <div style={{ borderRadius: 12, overflow: "hidden", background: "#F8FAFF", maxHeight: 150 }}>
                            <img src={preview} alt="preview" style={{ width: "100%", height: 150, objectFit: "contain" }} />
                          </div>
                        )}
                        {!preview && (
                          <div style={{ height: 80, borderRadius: 12, background: "#F8FAFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>📄</div>
                        )}
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: "#F8FAFF", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "DM Sans", fontSize: 13, fontWeight: 600, color: "#1A1F36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                            <div style={{ fontFamily: "DM Sans", fontSize: 11, color: "#9CA3AF" }}>{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button onClick={() => { setFile(null); setPreview(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 16 }}>✕</button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleMerge}
                          style={{
                            padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                            background: "linear-gradient(135deg,#10B981,#059669)", color: "white",
                            fontFamily: "Outfit", fontWeight: 700, fontSize: 15,
                            boxShadow: "0 6px 20px rgba(16,185,129,0.35)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          }}
                        >
                          <span>🔀</span> Extract & Merge into Excel
                        </motion.button>
                        <div style={{ padding: "8px 12px", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                          <span style={{ fontFamily: "DM Sans", fontSize: 12, color: "#92400E" }}>
                            💡 AI will extract data, match columns by name, and append new rows. New columns will be added automatically.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
