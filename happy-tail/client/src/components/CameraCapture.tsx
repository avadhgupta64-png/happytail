import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Video, X, Circle, Square, RotateCcw, Check, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────
export type CaptureMode = "photo" | "video" | "audio";

export type CaptureResult =
  | { mode: "photo"; dataUrl: string }
  | { mode: "video"; blobUrl: string; blob: Blob }
  | { mode: "audio"; blobUrl: string; blob: Blob };

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
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Camera / mic start ──────────────────────────────────────────
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera/microphone is not available. Please open the app over HTTPS.");
        return;
      }

      let stream: MediaStream | null = null;

      if (mode === "audio") {
        // Audio-only mode — only need microphone
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } else {
        // Photo or video — need camera, optionally mic
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: mode === "video",
        };
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (audioErr: any) {
          // Mic denied but camera might still work — retry without audio
          if (
            mode === "video" &&
            (audioErr.name === "NotAllowedError" || audioErr.name === "NotFoundError")
          ) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false,
            });
          } else {
            throw audioErr;
          }
        }
      }

      streamRef.current = stream;

      if (mode !== "audio" && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setReady(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError(
          mode === "audio"
            ? "Microphone permission denied. Please allow microphone access in your browser settings."
            : "Camera permission denied. Please allow camera access in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          mode === "audio"
            ? "No microphone found on this device."
            : "No camera found on this device."
        );
      } else {
        setError("Could not start: " + (err.message || err.name));
      }
    }
  }, [mode]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Waveform visualiser (audio mode) ───────────────────────────
  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f97316";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // ── Flip camera ─────────────────────────────────────────────────
  const flipCamera = () => {
    if (mode === "audio") return;
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  // ── Photo capture ───────────────────────────────────────────────
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreview(dataUrl);
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

  // ── Video / audio recording ─────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Pick best supported mime type
    const mimeType =
      mode === "audio"
        ? MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
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
      // Stop waveform animation
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    recorder.start(100);
    setRecording(true);
    setRecordedSeconds(0);
    timerRef.current = setInterval(() => setRecordedSeconds((s) => s + 1), 1000);

    // Start waveform for audio mode
    if (mode === "audio") {
      try {
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(streamRef.current);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        drawWaveform();
      } catch {}
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const retakeRecording = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setPreviewBlob(null);
    setRecordedSeconds(0);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
  };

  const confirmRecording = () => {
    if (!preview || !previewBlob) return;
    if (mode === "audio") {
      onCapture({ mode: "audio", blobUrl: preview, blob: previewBlob });
    } else {
      onCapture({ mode: "video", blobUrl: preview, blob: previewBlob });
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Mode label ──────────────────────────────────────────────────
  const modeLabel =
    mode === "photo" ? "Take a Photo" : mode === "audio" ? "Record Audio" : "Record a Video";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-safe-top py-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm tracking-wide">{modeLabel}</span>
          {mode !== "audio" ? (
            <button
              onClick={flipCamera}
              aria-label="Flip camera"
              disabled={!ready || !!preview}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors disabled:opacity-30"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>

        {/* ── Viewfinder / preview area ── */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          {/* Error state */}
          {error && (
            <div className="text-center px-8 absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                {mode === "photo" ? (
                  <Camera className="w-8 h-8 text-red-400" />
                ) : mode === "audio" ? (
                  <Mic className="w-8 h-8 text-red-400" />
                ) : (
                  <Video className="w-8 h-8 text-red-400" />
                )}
              </div>
              <p className="text-red-300 text-sm leading-relaxed mb-5 max-w-xs">{error}</p>
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => startCamera(facingMode)}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading state */}
          {!error && !ready && !preview && (
            <div className="flex flex-col items-center gap-3 text-white/60 absolute inset-0 justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">
                {mode === "audio" ? "Starting microphone…" : "Starting camera…"}
              </p>
            </div>
          )}

          {/* Live viewfinder (video/photo) */}
          {mode !== "audio" && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${preview ? "hidden" : ""}`}
            />
          )}

          {/* Audio mode idle state (not recording, no preview) */}
          {mode === "audio" && ready && !recording && !preview && (
            <div className="flex flex-col items-center gap-5 text-white/70 px-8 text-center">
              <div className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-400/40 flex items-center justify-center">
                <Mic className="w-10 h-10 text-orange-400" />
              </div>
              <p className="text-sm max-w-xs">
                Point the mic towards your dog and tap Record to capture their bark
              </p>
            </div>
          )}

          {/* Audio waveform while recording */}
          {mode === "audio" && recording && !preview && (
            <div className="flex flex-col items-center gap-6 w-full px-6">
              <canvas
                ref={canvasRef}
                width={320}
                height={80}
                className="w-full max-w-sm rounded-xl bg-white/5"
              />
              <p className="text-white/60 text-sm">Recording… tap Stop when done</p>
            </div>
          )}

          {/* Photo preview */}
          {mode === "photo" && preview && (
            <img src={preview} alt="Captured" className="w-full h-full object-contain" />
          )}

          {/* Video preview */}
          {mode === "video" && preview && (
            <video
              key={preview}
              src={preview}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {/* Audio preview */}
          {mode === "audio" && preview && (
            <div className="flex flex-col items-center gap-5 px-8 text-center">
              <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-400/40 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <p className="text-white/80 text-sm">
                Recording captured ({formatTime(recordedSeconds)})
              </p>
              <audio
                key={preview}
                src={preview}
                controls
                className="w-full max-w-xs rounded-xl"
              />
            </div>
          )}

          {/* Recording indicator overlay */}
          {(mode === "video" || mode === "audio") && recording && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur rounded-full px-4 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-mono">{formatTime(recordedSeconds)}</span>
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="px-6 py-5 flex items-center justify-center gap-8 bg-black/90">
          {/* Photo: shutter */}
          {mode === "photo" && !preview && ready && (
            <button
              onClick={capturePhoto}
              aria-label="Take photo"
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          )}

          {/* Photo: retake + confirm */}
          {mode === "photo" && preview && (
            <>
              <button
                onClick={retakePhoto}
                aria-label="Retake"
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={confirmPhoto}
                aria-label="Use photo"
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
              >
                <Check className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Video/audio: start recording */}
          {(mode === "video" || mode === "audio") && !preview && ready && !recording && (
            <button
              onClick={startRecording}
              aria-label="Start recording"
              className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <Circle className="w-10 h-10 fill-red-500 text-red-500" />
            </button>
          )}

          {/* Video/audio: stop recording */}
          {(mode === "video" || mode === "audio") && recording && (
            <button
              onClick={stopRecording}
              aria-label="Stop recording"
              className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 active:scale-95 transition-all"
            >
              <Square className="w-8 h-8 fill-red-500 text-red-500" />
            </button>
          )}

          {/* Video/audio: retake + confirm */}
          {(mode === "video" || mode === "audio") && preview && !recording && (
            <>
              <button
                onClick={retakeRecording}
                aria-label="Redo recording"
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={confirmRecording}
                aria-label="Use recording"
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
