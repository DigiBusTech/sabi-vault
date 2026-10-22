"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Check, X, UploadCloud, AlertCircle, Sparkles } from "lucide-react";

export interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileCaptured: (file: File) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onFileCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start back/rear camera stream
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    setCapturedBlob(null);
    setPreviewUrl(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser. Please use file upload.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // Rear camera for mobile document scanning
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("[CameraScanner] getUserMedia failed:", err.message);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera access or choose a document photo from your files."
          : "Rear camera not accessible. You can upload an existing document photo instead."
      );
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Ensure video element receives the stream when stream state updates
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Export as high-quality compressed JPEG
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          stopCamera();
        }
      },
      "image/jpeg",
      0.88
    );
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCapturedBlob(null);
    startCamera();
  };

  const handleConfirmUse = () => {
    if (!capturedBlob) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const scannedFile = new File([capturedBlob], `scanned_doc_${timestamp}.jpg`, {
      type: "image/jpeg",
    });
    onFileCaptured(scannedFile);
    onClose();
  };

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileCaptured(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-poppins">
                Scan Physical Document
              </h3>
              <p className="text-xs text-slate-500">
                Frame document within border for instant AI extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            /* Review Captured Frame */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={previewUrl}
                alt="Captured Document Scan"
                className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center space-x-1.5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready for AI Analysis</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Error / Fallback Card */
            <div className="p-6 text-center text-white max-w-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1.5 font-poppins">
                Camera Notice
              </h4>
              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Choose Document from Device</span>
              </button>
            </div>
          ) : (
            /* Active Live Camera Stream with A4 Framing Guide */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* A4 Scanner Frame Overlay */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />

                {/* Animated Horizontal Scan Line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 opacity-75 animate-pulse" />

                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="bg-slate-900/80 text-emerald-300 text-[11px] font-mono font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                    Align edges of certificate / statement
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Picker Fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            className="hidden"
            onChange={handleNativeFileInput}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          {previewUrl ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Scan</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmUse}
                className="inline-flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all font-poppins"
              >
                <Check className="w-4 h-4" />
                <span>Extract Document Details</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-2"
              >
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Pick from gallery</span>
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={isInitializing || !!cameraError}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-md transition-all font-poppins"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Document</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

