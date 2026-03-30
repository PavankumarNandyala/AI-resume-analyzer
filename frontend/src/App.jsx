import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { motion } from "framer-motion";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e) {
    setError("");
    setResponse(null);

    const f = e.target.files && e.target.files[0];
    if (!f) return;

    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF files are allowed.");
      e.target.value = null;
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function removeFile() {
    setFile(null);
    setPreviewUrl("");
    setError("");
    setResponse(null);
    if (inputRef.current) inputRef.current.value = null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!file) {
      setError("Please upload a PDF resume before submitting.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("cover_letter", coverLetter);

      const resp = await fetch("http://127.0.0.1:8000/analyze-cv", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setResponse(data.model_response);
    } catch (err) {
      setError(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCoverLetterAsDoc() {
    if (!response?.cover_letter) return;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Cover Letter",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: response.cover_letter,
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cover-letter.docx";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadCoverLetterAsPdf() {
    if (!response?.cover_letter) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    pdf.setFontSize(18);
    pdf.text("Cover Letter", margin, 20);

    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(response.cover_letter, maxWidth);

    let y = 35;
    lines.forEach((line) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += 7;
    });

    pdf.save("cover-letter.pdf");
  }

  return (
    <div className="app-root">
      <div className="background-blobs">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.header
          className="site-header"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1>AI Resume Analyzer</h1>
          <p className="subtitle">
            Upload your resume and get smart AI insights with a polished, modern experience.
          </p>
        </motion.header>

        <motion.form
          className="card"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="upload-section">
            <div className="upload-box">
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden-input"
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => inputRef.current?.click()}
              >
                {file ? "Replace Resume" : "Upload Resume"}
              </button>

              {file && (
                <div className="file-chip">
                  <span>{file.name}</span>
                  <button type="button" className="btn btn-ghost" onClick={removeFile}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={coverLetter}
                onChange={(e) => setCoverLetter(e.target.checked)}
              />
              <span>Generate cover letter</span>
            </label>
          </div>

          {error && (
            <motion.div
              className="error-box"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="actions-row">
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>

          {loading && (
            <motion.div
              className="loader-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="loader-ring"></div>
              <p>Analyzing your resume with AI...</p>
            </motion.div>
          )}

          {!loading && previewUrl && !response && (
            <motion.div
              className="preview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-title">Resume Preview</div>
              <iframe title="pdf-preview" src={previewUrl} className="preview-frame" />
            </motion.div>
          )}

          {!loading && response && (
            <motion.div
              className="results-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="section-title">Analysis Results</h2>

              <div className="result-grid">
                <div className="result-box">
                  <span className="label">Name</span>
                  <p>{response.name}</p>
                </div>

                <div className="result-box">
                  <span className="label">Experience</span>
                  <p>{response.experience} Years</p>
                </div>
              </div>

              <div className="result-box full-width">
                <span className="label">Skills & Expertise</span>
                <div className="skills-wrap">
                  {response.domain_expertise?.map((skill, index) => (
                    <motion.span
                      key={index}
                      className="skill-badge"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {response.cover_letter && response.cover_letter !== "" && (
                <div className="result-box full-width">
                  <span className="label">Cover Letter</span>
                  <pre className="cover-letter-box">{response.cover_letter}</pre>

                  <div className="download-buttons">
                    <button
                      type="button"
                      className="btn btn-download"
                      onClick={downloadCoverLetterAsDoc}
                    >
                      Download DOCX
                    </button>
                    <button
                      type="button"
                      className="btn btn-download alt"
                      onClick={downloadCoverLetterAsPdf}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.form>

        <footer className="site-footer">
          Built with React, FastAPI, LangChain and OpenAI
        </footer>
      </motion.div>
    </div>
  );
}

export default App;