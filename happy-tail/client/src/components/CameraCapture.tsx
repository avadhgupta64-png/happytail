import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, X, Circle, Square, RotateCcw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────
export type CaptureMode = "photo" | "video";

export type CaptureResult =
  | { mode: "photo"; dataUrl: string }
  | { mode: "video"; blobUrl: string; blob: Blob };

interface CameraCaptureProps {
  mode: CaptureMode;
  onCapture: (result: CaptureResult) => void;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────
export default function CameraCapture({ mode, onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === "video",
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setReady(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Could not start camera: " + (err.message || err.name));
      }
    }
  }, [mode]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Flip camera
  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  // ── Photo capture ──────────────────────────────────────────────
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
    // Pause the stream while previewing
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = false));
  };

  const retakePhoto = () => {
    setPreview(null);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
  };

  const confirmPhoto = () => {
    if (!preview) return;
    onCapture({ mode: "photo", dataUrl: preview });
  };

  // ── Video recording ────────────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setPreviewBlob(blob);
    };

    recorder.start(100);
    setRecording(true);
    setRecordedSeconds(0);
    timerRef.current = setInterval(() => setRecordedSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const retakeVideo = () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setPreviewBlob(null);
    setRecordedSeconds(0);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
  };

  const confirmVideo = () => {
    if (!preview || !previewBlob) return;
    onCapture({ mode: "video", blobUrl: preview, blob: previewBlob });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 absolute top-0 left-0 right-0 z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm tracking-wide">
            {mode === "photo" ? "Take a Photo" : "Record a Video"}
          </span>
          {/* Flip camera button */}
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            disabled={!ready || !!preview}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Camera / Preview */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          {error ? (
            <div className="text-center px-8">
              <div className="w-16 h-16 bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                {mode === "photo" ? <Camera className="w-8 h-8 text-red-400" /> : <Video className="w-8 h-8 text-red-400" />}
              </div>
              <p className="text-red-400 text-sm leading-relaxed mb-4">{error}</p>
              <Button variant="outline" className="text-white border-white/30" onClick={() => startCamera(facingMode)}>
                Try Again
              </Button>
            </div>
          ) : !ready && !preview ? (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Starting camera…</p>
            </div>
          ) : null}

          {/* Live viewfinder — always mounted so the stream can attach */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${preview ? "hidden" : ""}`}
          />

          {/* Photo preview */}
          {mode === "photo" && preview && (
            <img src={preview} alt="Captured" className="w-full h-full object-contain" />
          )}

          {/* Video preview */}
          {mode === "video" && preview && (
            <video src={preview} controls autoPlay className="w-full h-full object-contain" />
          )}

          {/* Recording indicator */}
          {mode === "video" && recording && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-4 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-mono">{formatTime(recordedSeconds)}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-6 flex items-center justify-center gap-8 bg-black">
          {mode === "photo" && !preview && ready && (
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          )}

          {mode === "photo" && preview && (
            <>
              <button
                onClick={retakePhoto}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={confirmPhoto}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
              >
                <Check className="w-8 h-8" />
              </button>
            </>
          )}

          {mode === "video" && !preview && ready && !recording && (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <Circle className="w-10 h-10 fill-red-500 text-red-500" />
            </button>
          )}

          {mode === "video" && recording && (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 active:scale-95 transition-all"
            >
              <Square className="w-8 h-8 fill-red-500 text-red-500" />
            </button>
          )}

          {mode === "video" && preview && !recording && (
            <>
              <button
                onClick={retakeVideo}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={confirmVideo}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
              >
                <Check className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
