"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Brain, Activity, AlertCircle, CheckCircle2, Loader2, X, ImageIcon } from "lucide-react"

interface ClassificationResult {
  brainTumor: number
  healthy: number
  prediction: "Brain Tumor" | "Healthy"
}

export function BrainClassifier() {
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processImage(file)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const processImage = (file: File) => {
    setImageFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!imageFile) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", imageFile)

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }


      setResult({
        prediction: data.prediction,
        brainTumor: data.probabilities.brainTumor, // تأكد من المسار الصحيح
        healthy: data.probabilities.healthy
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to API. Make sure the Python server is running on port 8000.",
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setImage(null)
    setImageFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
          <Brain className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Brain MRI Classification</h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Upload a brain MRI scan for AI-powered tumor detection using our advanced CNN model
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Upload MRI Scan</h2>
              <p className="text-white/50 text-sm">Drag & drop or click to browse</p>
            </div>
          </div>

          {!image ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300
                flex flex-col items-center justify-center min-h-[300px] cursor-pointer
                ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }
              `}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white/80 font-medium mb-2">Drop your MRI image here</p>
              <p className="text-white/40 text-sm">Supports JPG, PNG, DICOM</p>
            </div>
          ) : (
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-black/30">
                <img src={image || "/placeholder.svg"} alt="Uploaded MRI" className="w-full h-[300px] object-contain" />
              </div>
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {image && (
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Analyze Image
                </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Classification Result</h2>
              <p className="text-white/50 text-sm">AI-powered analysis output</p>
            </div>
          </div>

          {!result ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Brain className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-white/40 mb-2">No analysis yet</p>
              <p className="text-white/30 text-sm">Upload an MRI scan to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prediction Badge */}
              <div
                className={`
                rounded-2xl p-6 text-center
                ${
                  result.prediction === "Healthy"
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }
              `}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{
                    backgroundColor:
                      result.prediction === "Healthy" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  }}
                >
                  {result.prediction === "Healthy" ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  )}
                </div>
                <h3
                  className={`text-2xl font-bold mb-1 ${result.prediction === "Healthy" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {result.prediction}
                </h3>
                <p className="text-white/50 text-sm">
                  Confidence: {(Math.max(result.brainTumor, result.healthy) * 100).toFixed(1)}%
                </p>
              </div>

              {/* Probability Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium">Brain Tumor</span>
                    <span className="text-white/60 text-sm">{(result.brainTumor * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                      style={{ width: `${result.brainTumor * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium">Healthy</span>
                    <span className="text-white/60 text-sm">{(result.healthy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                      style={{ width: `${result.healthy * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Model Info */}
              <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                <p className="text-white/50 text-xs leading-relaxed">
                  <strong className="text-white/70">Model:</strong> 4-Layer CNN with MaxPool & ReLU •
                  <strong className="text-white/70 ml-2">Input:</strong> 224×224px normalized
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      

      {/* Footer Info */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { label: "Architecture", value: "4-Layer CNN" },
          { label: "Input Size", value: "224 × 224" },
          { label: "Classes", value: "2 (Binary)" },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-white font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
