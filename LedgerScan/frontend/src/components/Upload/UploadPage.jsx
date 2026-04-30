import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const ACCEPTED = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

// Stages: idle → uploading → ocr_done → ai_processing → done → error
export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [uploadId, setUploadId] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [excelReady, setExcelReady] = useState(false);
  const [activeTab, setActiveTab] = useState("ocr"); // ocr | structured
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFiles, setHistoryFiles] = useState([]);
  const [pendingAction, setPendingAction] = useState(null); // 'ai' or 'direct-ai'

  const fetchHistory = async () => {
    try {
      const res = await api.get("/upload/history");
      setHistoryFiles(res.data.uploads.filter(u => u.result?.excelPath));
    } catch (e) { console.error(e) }
  };

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setStage("idle");
    setExtractedText("");
    setEditedText("");
    setAiAnalysis(null);
    // Image preview
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
    onDropRejected: () => toast.error("File too large or unsupported format"),
  });

  // ── Step 1: Upload → OCR ──────────────────────────────────
  const handleOCR = async () => {
    if (!file) return toast.error("Please select a file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setStage("uploading");
      animateProgress(0, 40, 1200);

      const res = await api.post("/upload/ocr-only", formData);

      animateProgress(40, 100, 600);
      setTimeout(() => {
        const text = res.data.extractedText || "";
        setExtractedText(text);
        setEditedText(text);
        setUploadId(res.data.uploadId);
        setStage("ocr_done");
        setProgress(100);
        if (!text.trim()) {
          toast("⚠️ No text found. Try a clearer image.", { icon: "⚠️" });
        } else {
          toast.success(`Extracted ${text.length} characters!`);
        }
      }, 700);
    } catch (err) {
      setStage("error");
      toast.error(err.response?.data?.message || "OCR extraction failed");
    }
  };

  // ── Step 2: Direct Image → AI Extraction ─────────────────
  const handleDirectAI = async (existingResultId = null) => {
    if (!file) return toast.error("Please select a file first");
    const formData = new FormData();
    formData.append("file", file);
    if (existingResultId) formData.append("existingResultId", existingResultId);

    try {
      setShowHistoryModal(false);
      setStage("ai_processing");
      setProgress(0);
      animateProgress(0, 90, 4000);

      const res = await api.post("/upload/direct-ai", formData);

      animateProgress(90, 100, 600);
      setTimeout(() => {
        setAiAnalysis(res.data.aiAnalysis);
        setExcelReady(res.data.excelReady);
        setUploadId(res.data.uploadId);
        setStage("done");
        setProgress(100);
        toast.success(existingResultId ? "Appended to existing Excel!" : "AI extracted and structured data directly!");
      }, 700);
    } catch (err) {
      setStage("error");
      toast.error(err.response?.data?.message || "Direct AI extraction failed");
    }
  };

  // ── Step 2: Send edited text to AI ───────────────────────
  const handleSendToAI = async (existingResultId = null) => {
    if (!editedText.trim()) return toast.error("No text to analyze");
    try {
      setShowHistoryModal(false);
      setStage("ai_processing");
      setProgress(0);
      animateProgress(0, 85, 3000);

      const res = await api.post("/upload/analyze", {
        uploadId,
        text: editedText,
        existingResultId,
      });

      animateProgress(85, 100, 400);
      setTimeout(() => {
        setAiAnalysis(res.data.aiAnalysis);
        setExcelReady(res.data.excelReady);
        setStage("done");
        setProgress(100);
        toast.success(existingResultId ? "Appended to existing Excel!" : "Excel file generated!");
      }, 500);
    } catch (err) {
      setStage("error");
      toast.error(err.response?.data?.message || "AI analysis failed");
    }
  };

  const openHistoryModal = (action) => {
    setPendingAction(action);
    fetchHistory();
    setShowHistoryModal(true);
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/result/excel/${uploadId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name?.replace(/\.[^.]+$/, "") || "ledgerscan"}_data.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStage("idle");
    setProgress(0);
    setExtractedText("");
    setEditedText("");
    setAiAnalysis(null);
    setExcelReady(false);
    setUploadId(null);
  };

  const animateProgress = (from, to, duration) => {
    const steps = 30;
    const increment = (to - from) / steps;
    const delay = duration / steps;
    let current = from;
    const timer = setInterval(() => {
      current += increment;
      setProgress(Math.min(Math.round(current), to));
      if (current >= to) clearInterval(timer);
    }, delay);
  };

  const stepLabels = [
    { key: "upload", label: "Upload", icon: "↑" },
    { key: "ocr", label: "OCR Extract", icon: "🔍" },
    { key: "review", label: "Review", icon: "✎" },
    { key: "ai", label: "AI Analyze", icon: "🤖" },
    { key: "excel", label: "Download", icon: "📊" },
  ];
  const currentStepIdx =
    { idle: 0, uploading: 1, ocr_done: 2, ai_processing: 3, done: 4, error: 0 }[
      stage
    ] ?? 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 80,
        paddingBottom: 64,
        background: "#F8FAFF",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 30,
              background: "rgba(79,142,247,0.08)",
              border: "1px solid rgba(79,142,247,0.15)",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4F8EF7",
              }}
              className="pulse-ring"
            ></div>
            <span
              style={{
                fontFamily: "DM Sans",
                fontSize: 13,
                color: "#4F8EF7",
                fontWeight: 500,
              }}
            >
              OCR → AI → Excel Pipeline
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 36,
              color: "#1A1F36",
              margin: "0 0 10px",
              letterSpacing: "-0.5px",
            }}
          >
            Extract & Structure Your Data
          </h1>
          <p
            style={{
              fontFamily: "DM Sans",
              color: "#6B7280",
              fontSize: 15,
              margin: 0,
            }}
          >
            Upload an image or PDF → review extracted text → send to AI →
            download Excel
          </p>
        </motion.div>

        {/* ── Step Progress Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "white",
            borderRadius: 16,
            padding: "20px 28px",
            marginBottom: 28,
            border: "1px solid #E5E9F2",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* connector line */}
            <div
              style={{
                position: "absolute",
                top: 18,
                left: "10%",
                right: "10%",
                height: 2,
                background: "#E5E9F2",
                zIndex: 0,
              }}
            ></div>
            <motion.div
              animate={{
                width: `${(currentStepIdx / (stepLabels.length - 1)) * 80}%`,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                top: 18,
                left: "10%",
                height: 2,
                background: "linear-gradient(90deg,#4F8EF7,#FF6B35)",
                zIndex: 1,
              }}
            ></motion.div>

            {stepLabels.map((step, i) => {
              const done = i < currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 2,
                    flex: 1,
                  }}
                >
                  <motion.div
                    animate={{
                      background: done ? "#4F8EF7" : "#ffffff",
                      borderColor: done || active ? "#4F8EF7" : "#E5E9F2",
                      scale: active ? 1.15 : 1,
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "2px solid #E5E9F2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      background: "#ffffff",
                      boxShadow: active
                        ? "0 0 0 4px rgba(79,142,247,0.15)"
                        : "none",
                    }}
                  >
                    {done ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2 7l4 4 6-6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span
                        style={{
                          fontSize: 13,
                          filter: active ? "none" : "grayscale(1) opacity(0.4)",
                        }}
                      >
                        {step.icon}
                      </span>
                    )}
                  </motion.div>
                  <span
                    style={{
                      fontFamily: "DM Sans",
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#4F8EF7" : done ? "#4F8EF7" : "#9CA3AF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Main Content ── */}
        <AnimatePresence mode="wait">
          {/* IDLE: Dropzone */}
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: file ? "1fr 1fr" : "1fr",
                  gap: 20,
                }}
              >
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  style={{
                    background: isDragActive
                      ? "rgba(79,142,247,0.04)"
                      : "white",
                    border: `2px dashed ${isDragActive ? "#4F8EF7" : "#CBD5E1"}`,
                    borderRadius: 20,
                    padding: "48px 32px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: isDragActive
                      ? "0 0 0 4px rgba(79,142,247,0.1)"
                      : "0 2px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={{ y: isDragActive ? -8 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>
                      {isDragActive ? "📂" : "☁️"}
                    </div>
                    <p
                      style={{
                        fontFamily: "Outfit",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#1A1F36",
                        marginBottom: 8,
                      }}
                    >
                      {isDragActive
                        ? "Drop your file here!"
                        : "Drag & drop your file"}
                    </p>
                    <p
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 14,
                        color: "#9CA3AF",
                        marginBottom: 20,
                      }}
                    >
                      or click to browse your computer
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {["PNG", "JPG", "PDF", "WEBP"].map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: "#EFF6FF",
                            color: "#4F8EF7",
                            fontFamily: "Outfit",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 12,
                        color: "#CBD5E1",
                        marginTop: 16,
                      }}
                    >
                      Max 20 MB
                    </p>
                  </motion.div>
                </div>

                {/* File Preview */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: 24,
                      border: "1px solid #E5E9F2",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Outfit",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#1A1F36",
                        }}
                      >
                        Selected File
                      </span>
                      <button
                        onClick={handleReset}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9CA3AF",
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Image preview */}
                    {preview && (
                      <div
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#F8FAFF",
                          maxHeight: 180,
                        }}
                      >
                        <img
                          src={preview}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}
                    {!preview && (
                      <div
                        style={{
                          height: 100,
                          borderRadius: 12,
                          background: "#F8FAFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 40,
                        }}
                      >
                        📄
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "#F8FAFF",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background:
                            file.type === "application/pdf"
                              ? "#FEF3C7"
                              : "#EFF6FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        {file.type === "application/pdf" ? "📄" : "🖼️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "DM Sans",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1A1F36",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "DM Sans",
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          {(file.size / 1024).toFixed(1)} KB ·{" "}
                          {file.type.split("/")[1].toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOCR}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          background: "linear-gradient(135deg, #4F8EF7, #2563EB)",
                          color: "white",
                          fontFamily: "Outfit",
                          fontWeight: 700,
                          fontSize: 14,
                          boxShadow: "0 6px 20px rgba(79,142,247,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <span>🔍</span> Extract Text with OCR
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDirectAI()}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          background: "linear-gradient(135deg, #FF6B35, #E85D04)",
                          color: "white",
                          fontFamily: "Outfit",
                          fontWeight: 700,
                          fontSize: 14,
                          boxShadow: "0 6px 20px rgba(255,107,53,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <span>🤖</span> Direct AI (New File)
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openHistoryModal("direct-ai")}
                        style={{
                          flex: 1,
                          padding: "14px",
                          borderRadius: 12,
                          border: "2px solid #FF6B35",
                          cursor: "pointer",
                          background: "white",
                          color: "#E85D04",
                          fontFamily: "Outfit",
                          fontWeight: 700,
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <span>📂</span> Direct AI (Update File)
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {!file && (
                <div
                  style={{
                    marginTop: 24,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 16,
                  }}
                >
                  {[
                    {
                      icon: "🧾",
                      title: "Bills & Invoices",
                      desc: "Extract line items, amounts, GST",
                    },
                    {
                      icon: "📋",
                      title: "Ledgers & Tables",
                      desc: "Preserve row/column structure",
                    },
                    {
                      icon: "🗒️",
                      title: "Scanned Docs",
                      desc: "Works on image PDFs too",
                    },
                  ].map((c) => (
                    <div
                      key={c.title}
                      style={{
                        background: "white",
                        borderRadius: 14,
                        padding: "18px 16px",
                        border: "1px solid #E5E9F2",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>
                        {c.icon}
                      </div>
                      <div
                        style={{
                          fontFamily: "Outfit",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#1A1F36",
                          marginBottom: 4,
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "DM Sans",
                          fontSize: 12,
                          color: "#9CA3AF",
                        }}
                      >
                        {c.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* UPLOADING / AI PROCESSING: Animated progress */}
          {(stage === "uploading" || stage === "ai_processing") && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: "white",
                borderRadius: 20,
                padding: 40,
                textAlign: "center",
                border: "1px solid #E5E9F2",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Animated icon */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "3px solid #EFF6FF",
                  borderTopColor: "#4F8EF7",
                  margin: "0 auto 24px",
                }}
              ></motion.div>

              <h2
                style={{
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#1A1F36",
                  marginBottom: 8,
                }}
              >
                {stage === "uploading"
                  ? "🔍 Running PaddleOCR..."
                  : "🤖 AI Analyzing Data..."}
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  color: "#9CA3AF",
                  marginBottom: 32,
                }}
              >
                {stage === "uploading"
                  ? "Extracting all readable text from your file. This may take a moment."
                  : "Claude AI is identifying patterns and building your Excel structure."}
              </p>

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "#F3F4F6",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #4F8EF7, #FF6B35)",
                    borderRadius: 8,
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 13,
                  color: "#4F8EF7",
                  fontWeight: 600,
                }}
              >
                {progress}%
              </p>

              {/* Animated steps */}
              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textAlign: "left",
                  maxWidth: 320,
                  margin: "28px auto 0",
                }}
              >
                {(stage === "uploading"
                  ? [
                      "Receiving file",
                      "Pre-processing image",
                      "Running PaddleOCR engine",
                      "Parsing text lines",
                    ]
                  : [
                      "Reading extracted text",
                      "Identifying data patterns",
                      "Building column structure",
                      "Generating Excel file",
                    ]
                ).map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <motion.div
                      animate={{
                        background:
                          progress > i * 25 + 10 ? "#4F8EF7" : "#E5E9F2",
                      }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 13,
                        color: progress > i * 25 + 10 ? "#1A1F36" : "#9CA3AF",
                      }}
                    >
                      {step}
                    </span>
                    {progress > i * 25 + 10 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          marginLeft: "auto",
                          color: "#10B981",
                          fontSize: 12,
                        }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* OCR DONE: Review extracted text & send to AI */}
          {stage === "ocr_done" && (
            <motion.div
              key="ocr_done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Success banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  border: "1px solid #A7F3D0",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3 9l5 5 7-7"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "Outfit",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#065F46",
                    }}
                  >
                    OCR Extraction Complete
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Sans",
                      fontSize: 13,
                      color: "#047857",
                    }}
                  >
                    {extractedText
                      ? `${extractedText.length} characters · ${extractedText.split("\n").filter(Boolean).length} lines extracted`
                      : "No text found — try a clearer image"}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Outfit",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#10B981",
                  }}
                >
                  {extractedText.length}
                </div>
              </div>

              {/* Two-panel layout: file preview + text editor */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.4fr",
                  gap: 20,
                }}
              >
                {/* Left: File info */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #E5E9F2",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Outfit",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#1A1F36",
                    }}
                  >
                    Source File
                  </div>
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        objectFit: "contain",
                        maxHeight: 200,
                        background: "#F8FAFF",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        borderRadius: 10,
                        background: "#F8FAFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 40,
                      }}
                    >
                      📄
                    </div>
                  )}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "#F8FAFF",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file?.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginTop: 2,
                      }}
                    >
                      {(file?.size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  {/* Char stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {[
                      { label: "Characters", value: extractedText.length },
                      {
                        label: "Lines",
                        value: extractedText.split("\n").filter(Boolean).length,
                      },
                      {
                        label: "Words",
                        value: extractedText.split(/\s+/).filter(Boolean)
                          .length,
                      },
                      {
                        label: "Confidence",
                        value: extractedText.length > 0 ? "High" : "Low",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "#F8FAFF",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "Outfit",
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#4F8EF7",
                          }}
                        >
                          {s.value}
                        </div>
                        <div
                          style={{
                            fontFamily: "DM Sans",
                            fontSize: 10,
                            color: "#9CA3AF",
                            marginTop: 1,
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Editable OCR text */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #E5E9F2",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "Outfit",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1A1F36",
                        }}
                      >
                        Extracted Text
                      </div>
                      <div
                        style={{
                          fontFamily: "DM Sans",
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginTop: 2,
                        }}
                      >
                        Review and edit before sending to AI
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditedText(extractedText)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 7,
                          border: "1px solid #E5E9F2",
                          background: "white",
                          fontFamily: "DM Sans",
                          fontSize: 11,
                          color: "#6B7280",
                          cursor: "pointer",
                        }}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(editedText);
                          toast.success("Copied!");
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 7,
                          border: "1px solid #E5E9F2",
                          background: "white",
                          fontFamily: "DM Sans",
                          fontSize: 11,
                          color: "#4F8EF7",
                          cursor: "pointer",
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {extractedText ? (
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      style={{
                        flex: 1,
                        minHeight: 260,
                        width: "100%",
                        padding: "14px",
                        borderRadius: 10,
                        border: "1.5px solid #E5E9F2",
                        fontFamily: "monospace",
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: "#374151",
                        background: "#FAFBFF",
                        resize: "vertical",
                        outline: "none",
                        transition: "border 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#4F8EF7")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E9F2")}
                      placeholder="Extracted text will appear here..."
                    />
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        minHeight: 220,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#FEF9C3",
                        borderRadius: 10,
                        border: "1.5px dashed #FDE68A",
                        padding: 24,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                      <div
                        style={{
                          fontFamily: "Outfit",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#92400E",
                          marginBottom: 6,
                        }}
                      >
                        No text extracted
                      </div>
                      <div
                        style={{
                          fontFamily: "DM Sans",
                          fontSize: 12,
                          color: "#B45309",
                        }}
                      >
                        Try a higher resolution image, or ensure the document
                        has readable text
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#F0F5FF",
                      border: "1px solid rgba(79,142,247,0.15)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                    <span
                      style={{
                        fontFamily: "DM Sans",
                        fontSize: 12,
                        color: "#4F8EF7",
                        lineHeight: 1.5,
                      }}
                    >
                      You can edit the text above before sending to AI. Fix any
                      OCR errors for better Excel output.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
              >
                <button
                  onClick={handleReset}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E9F2",
                    background: "white",
                    fontFamily: "DM Sans",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  ← Upload Different File
                </button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openHistoryModal("ai")}
                  disabled={!editedText.trim()}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 12,
                    border: "2px solid #4F8EF7",
                    cursor: editedText.trim() ? "pointer" : "not-allowed",
                    background: "white",
                    color: editedText.trim() ? "#4F8EF7" : "#9CA3AF",
                    borderColor: editedText.trim() ? "#4F8EF7" : "#E5E9F2",
                    fontFamily: "Outfit",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>📂</span>
                  Update Existing Excel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendToAI()}
                  disabled={!editedText.trim()}
                  style={{
                    padding: "12px 28px",
                    borderRadius: 12,
                    border: "none",
                    cursor: editedText.trim() ? "pointer" : "not-allowed",
                    background: editedText.trim()
                      ? "linear-gradient(135deg, #4F8EF7, #2563EB)"
                      : "#E5E9F2",
                    color: editedText.trim() ? "white" : "#9CA3AF",
                    fontFamily: "Outfit",
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: editedText.trim()
                      ? "0 6px 20px rgba(79,142,247,0.35)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>🤖</span>
                  Create New Excel
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ marginLeft: 2 }}
                  >
                    <path
                      d="M3 7h8M8 4l3 3-3 3"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Success card */}
              <div
                style={{
                  borderRadius: 20,
                  padding: "36px",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #1A1F36 0%, #253065 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(79,142,247,0.1)",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: -20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(255,107,53,0.08)",
                  }}
                ></div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: "#10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M5 14l7 7 11-11"
                      stroke="white"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <h2
                  style={{
                    fontFamily: "Outfit",
                    fontWeight: 800,
                    fontSize: 26,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  Processing Complete!
                </h2>
                <p
                  style={{
                    fontFamily: "DM Sans",
                    fontSize: 15,
                    color: "rgba(255,255,255,0.65)",
                    marginBottom: 28,
                  }}
                >
                  Your document has been analyzed and structured into Excel
                  format.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownload}
                    style={{
                      padding: "13px 28px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      background: "white",
                      color: "#4F8EF7",
                      fontFamily: "Outfit",
                      fontWeight: 700,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 2v8M5 7l3 3 3-3M3 13h10"
                        stroke="#4F8EF7"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Download Excel
                  </motion.button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                      padding: "13px 24px",
                      borderRadius: 12,
                      border: "1.5px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "white",
                      fontFamily: "Outfit",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    View Dashboard
                  </button>
                </div>
              </div>

              {/* Tabs: OCR text vs Structured data */}
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #E5E9F2",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{ display: "flex", borderBottom: "1px solid #E5E9F2" }}
                >
                  {[
                    { key: "ocr", label: "📝 Extracted Text" },
                    { key: "structured", label: "📊 Structured Data (AI)" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        flex: 1,
                        padding: "14px",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "DM Sans",
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        fontSize: 14,
                        color: activeTab === tab.key ? "#4F8EF7" : "#9CA3AF",
                        background: "white",
                        borderBottom:
                          activeTab === tab.key
                            ? "2px solid #4F8EF7"
                            : "2px solid transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 20 }}>
                  {activeTab === "ocr" && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Outfit",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#1A1F36",
                          }}
                        >
                          OCR Output
                        </span>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 20,
                            background: "#ECFDF5",
                            color: "#059669",
                            fontFamily: "DM Sans",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {editedText.length} characters
                        </span>
                      </div>
                      <pre
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#374151",
                          background: "#FAFBFF",
                          padding: "14px",
                          borderRadius: 10,
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.7,
                          border: "1px solid #E5E9F2",
                          maxHeight: 320,
                          overflowY: "auto",
                        }}
                      >
                        {editedText || "No text extracted"}
                      </pre>
                    </div>
                  )}

                  {activeTab === "structured" && aiAnalysis && (
                    <div>
                      <div
                        style={{
                          marginBottom: 12,
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          {
                            label: "Document Type",
                            value:
                              aiAnalysis.summary?.documentType || "Unknown",
                          },
                          {
                            label: "Total",
                            value: aiAnalysis.summary?.totalAmount || "N/A",
                          },
                          {
                            label: "Date",
                            value: aiAnalysis.summary?.date || "N/A",
                          },
                          {
                            label: "Rows",
                            value: aiAnalysis.rows?.length || 0,
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "#F0F5FF",
                              border: "1px solid rgba(79,142,247,0.12)",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "DM Sans",
                                fontSize: 11,
                                color: "#9CA3AF",
                              }}
                            >
                              {s.label}:{" "}
                            </span>
                            <span
                              style={{
                                fontFamily: "DM Sans",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4F8EF7",
                              }}
                            >
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {aiAnalysis.rows?.length > 0 && (
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontFamily: "DM Sans",
                              fontSize: 12,
                            }}
                          >
                            <thead>
                              <tr>
                                {aiAnalysis.headers?.map((h) => (
                                  <th
                                    key={h}
                                    style={{
                                      padding: "8px 12px",
                                      background: "#4F8EF7",
                                      color: "white",
                                      fontWeight: 600,
                                      textAlign: "left",
                                      fontSize: 11,
                                    }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {aiAnalysis.rows.map((row, i) => (
                                <tr
                                  key={i}
                                  style={{
                                    background:
                                      i % 2 === 0 ? "#FAFBFF" : "white",
                                  }}
                                >
                                  {row.map((cell, j) => (
                                    <td
                                      key={j}
                                      style={{
                                        padding: "7px 12px",
                                        color: "#374151",
                                        borderBottom: "1px solid #E5E9F2",
                                      }}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleReset}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "DM Sans",
                    fontSize: 14,
                    color: "#4F8EF7",
                    fontWeight: 500,
                  }}
                >
                  ↺ Upload Another File
                </button>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "white",
                borderRadius: 20,
                padding: 48,
                textAlign: "center",
                border: "1.5px solid #FEE2E2",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2
                style={{
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#1A1F36",
                  marginBottom: 8,
                }}
              >
                Processing Failed
              </h2>
              <p
                style={{
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  color: "#9CA3AF",
                  marginBottom: 24,
                }}
              >
                Something went wrong. Check that your Python OCR service is
                running on port 8000.
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#4F8EF7,#2563EB)",
                  color: "white",
                  border: "none",
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── History Selection Modal ── */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 20,
              }}
              onClick={() => setShowHistoryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  borderRadius: 20,
                  width: "100%",
                  maxWidth: 600,
                  maxHeight: "80vh",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ padding: "24px 30px", borderBottom: "1px solid #E5E9F2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontFamily: "Outfit", fontSize: 20, color: "#1A1F36" }}>Select File to Update</h2>
                    <p style={{ margin: "4px 0 0", fontFamily: "DM Sans", fontSize: 13, color: "#6B7280" }}>New extracted data will be appended to the selected file.</p>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9CA3AF" }}>✕</button>
                </div>
                
                <div style={{ padding: "10px 30px", overflowY: "auto", flex: 1 }}>
                  {historyFiles.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontFamily: "DM Sans" }}>No previously generated Excel files found.</div>
                  ) : (
                    historyFiles.map((h) => (
                      <div
                        key={h._id}
                        onClick={() => pendingAction === "direct-ai" ? handleDirectAI(h.result._id) : handleSendToAI(h.result._id)}
                        style={{
                          padding: 16,
                          border: "1px solid #E5E9F2",
                          borderRadius: 12,
                          marginBottom: 12,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F8EF7"; e.currentTarget.style.background = "#F8FAFF"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E9F2"; e.currentTarget.style.background = "white"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 24 }}>📊</span>
                          <div>
                            <div style={{ fontFamily: "Outfit", fontWeight: 600, fontSize: 15, color: "#1A1F36" }}>{h.originalName} Data</div>
                            <div style={{ fontFamily: "DM Sans", fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                              Created {new Date(h.createdAt).toLocaleDateString()} · {h.result.aiAnalysis?.rows?.length || 0} existing rows
                            </div>
                          </div>
                        </div>
                        <div style={{ color: "#4F8EF7", fontWeight: 600, fontFamily: "DM Sans", fontSize: 13 }}>Append &rarr;</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
