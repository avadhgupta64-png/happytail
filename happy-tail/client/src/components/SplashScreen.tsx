import { useEffect, useState, useRef } from "react";
import logoImg from "@assets/logo.png";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  tx: number;
  ty: number;
}

interface PawPrint {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
    opacity: Math.random() * 0.6 + 0.2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    tx: (Math.random() - 0.5) * 60,
    ty: -(Math.random() * 80 + 20),
  }));
}

function generatePaws(count: number): PawPrint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 90 + 5,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.6 + 0.4,
    delay: (i / count) * 2.5,
  }));
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="22" rx="10" ry="13" />
      <ellipse cx="70" cy="22" rx="10" ry="13" />
      <ellipse cx="14" cy="46" rx="8" ry="11" />
      <ellipse cx="86" cy="46" rx="8" ry="11" />
      <path d="M50 35 C25 35 15 55 18 72 C21 85 35 90 50 90 C65 90 79 85 82 72 C85 55 75 35 50 35Z" />
    </svg>
  );
}

function DogSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="100" rx="55" ry="38" />
      <circle cx="158" cy="72" r="28" />
      <ellipse cx="145" cy="50" rx="10" ry="16" transform="rotate(-15 145 50)" />
      <ellipse cx="170" cy="48" rx="10" ry="16" transform="rotate(15 170 48)" />
      <path d="M50 90 Q20 60 35 40 Q42 30 48 45 Q38 60 55 80Z" />
      <rect x="128" y="130" width="14" height="28" rx="7" />
      <rect x="150" y="130" width="14" height="28" rx="7" />
      <rect x="68" y="130" width="14" height="28" rx="7" />
      <rect x="90" y="130" width="14" height="28" rx="7" />
      <ellipse cx="183" cy="77" rx="6" ry="5" fill="rgba(0,0,0,0.3)" />
      <circle cx="162" cy="64" r="5" fill="rgba(0,0,0,0.4)" />
      <circle cx="163" cy="63" r="2" fill="white" />
    </svg>
  );
}

function HeartbeatLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="0,30 40,30 55,10 65,50 75,10 85,30 100,30 110,15 120,45 130,5 140,55 150,30 190,30 200,20 210,40 220,30 300,30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "peak" | "exit">("enter");
  const [particles] = useState(() => generateParticles(28));
  const [paws] = useState(() => generatePaws(12));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // enter → peak
    timerRef.current = setTimeout(() => setPhase("peak"), 600);
    // peak → exit
    const exitTimer = setTimeout(() => setPhase("exit"), 2800);
    // done
    const doneTimer = setTimeout(() => onComplete(), 3600);
    return () => {
      clearTimeout(timerRef.current!);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`splash-root ${phase}`}
      data-testid="splash-screen"
      aria-label="Happy Tail loading"
      role="status"
      aria-live="polite"
    >
      {/* Radial glow layers */}
      <div className="splash-glow-outer" />
      <div className="splash-glow-mid" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="splash-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Scattered paw prints */}
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="splash-paw"
          style={{
            left: `${paw.x}%`,
            top: `${paw.y}%`,
            transform: `rotate(${paw.rotation}deg) scale(${paw.scale})`,
            animationDelay: `${paw.delay}s`,
          }}
        >
          <PawIcon className="w-8 h-8" />
        </div>
      ))}

      {/* Dog silhouette — bottom-right accent */}
      <div className="splash-dog-silhouette">
        <DogSilhouette className="w-48 h-48 sm:w-64 sm:h-64" />
      </div>

      {/* Center content */}
      <div className="splash-center">
        <div className="splash-ring splash-ring-1" />
        <div className="splash-ring splash-ring-2" />
        <div className="splash-ring splash-ring-3" />

        <div className="splash-logo-wrap">
          <div className="splash-logo-shine" />
          <img
            src={logoImg}
            alt="Happy Tail Logo"
            className="splash-logo-img"
            data-testid="img-splash-logo"
          />
        </div>

        <div className="splash-title-wrap">
          <h1 className="splash-title">Happy Tail</h1>
          <p className="splash-subtitle">AI Dog Care Companion</p>
        </div>

        <div className="splash-heartbeat-wrap">
          <HeartbeatLine className="splash-heartbeat" />
        </div>

        <div className="splash-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="splash-dot"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="splash-tagline">
        <PawIcon className="w-4 h-4 inline-block mr-1 opacity-60" />
        <span>Tech for Paws, Care for Life</span>
        <PawIcon className="w-4 h-4 inline-block ml-1 opacity-60" />
      </div>
    </div>
  );
}
