import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Heart, Sparkles, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

interface HeartScratchCardProps {
  photoUrl: string;
  partnerName: string;
  photoScale?: number;
  photoOffsetY?: number;
  photoOffsetX?: number;
  onRevealComplete?: () => void;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  spikes: number;
  rotation: number;
  rotationSpeed: number;
}

// Path2D matching the SVG heart clip path for calculating exact percentage inside the heart
const getHeartPath2D = (width: number, height: number): Path2D => {
  const p = new Path2D();
  const w = width;
  const h = height;
  p.moveTo(0.50 * w, 0.22 * h);
  p.bezierCurveTo(0.45 * w, 0.12 * h, 0.36 * w, 0.06 * h, 0.25 * w, 0.06 * h);
  p.bezierCurveTo(0.14 * w, 0.06 * h, 0.05 * w, 0.17 * h, 0.05 * w, 0.34 * h);
  p.bezierCurveTo(0.05 * w, 0.54 * h, 0.24 * w, 0.73 * h, 0.50 * w, 0.92 * h);
  p.bezierCurveTo(0.76 * w, 0.73 * h, 0.95 * w, 0.54 * h, 0.95 * w, 0.34 * h);
  p.bezierCurveTo(0.95 * w, 0.17 * h, 0.86 * w, 0.06 * h, 0.75 * w, 0.06 * h);
  p.bezierCurveTo(0.64 * w, 0.06 * h, 0.55 * w, 0.12 * h, 0.50 * w, 0.22 * h);
  p.closePath();
  return p;
};

export const HeartScratchCard: React.FC<HeartScratchCardProps> = ({
  photoUrl,
  partnerName,
  photoScale,
  photoOffsetY,
  photoOffsetX,
  onRevealComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparkleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const sparklesRef = useRef<SparkleParticle[]>([]);
  const sparkleAnimRef = useRef<number | null>(null);
  const touchGlowRef = useRef<{ x: number; y: number; alpha: number }>({ x: 0, y: 0, alpha: 0 });

  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const hasTriggeredCelebrationRef = useRef(false);

  // Full visibility tracking (only allows scratching when heart is 100% visible on screen)
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const isFullyVisibleRef = useRef(false);

  // Check if container element is completely visible within the viewport
  const checkIsFullyInView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    // Heart must have top, bottom, left and right totally visible within the viewport
    // Allowing 4px tolerance for subpixel borders
    const fullyVisible =
      rect.top >= -4 &&
      rect.bottom <= windowHeight + 4 &&
      rect.left >= -4 &&
      rect.right <= windowWidth + 4;

    if (isFullyVisibleRef.current !== fullyVisible) {
      isFullyVisibleRef.current = fullyVisible;
      setIsFullyVisible(fullyVisible);
    }
    return fullyVisible;
  }, []);

  // Update visibility on scroll, resize, and via IntersectionObserver
  useEffect(() => {
    const onScrollOrResize = () => {
      checkIsFullyInView();
    };

    checkIsFullyInView();
    const timer = setTimeout(checkIsFullyInView, 120);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && containerRef.current) {
      observer = new IntersectionObserver(
        () => {
          checkIsFullyInView();
        },
        { threshold: [0, 0.2, 0.4, 0.6, 0.8, 0.95, 1.0] }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (observer) observer.disconnect();
    };
  }, [checkIsFullyInView]);

  // Photo adjustment state (scale, vertical offset %, horizontal offset %)
  const [scale, setScale] = useState(photoScale ?? 1.12);
  const [offsetY, setOffsetY] = useState(photoOffsetY ?? 14);
  const [offsetX, setOffsetX] = useState(photoOffsetX ?? 0);

  // Sync state if props change externally
  useEffect(() => {
    if (photoScale !== undefined) setScale(photoScale);
  }, [photoScale]);

  useEffect(() => {
    if (photoOffsetY !== undefined) setOffsetY(photoOffsetY);
  }, [photoOffsetY]);

  useEffect(() => {
    if (photoOffsetX !== undefined) setOffsetX(photoOffsetX);
  }, [photoOffsetX]);

  // Initialize and paint the scratch-off canvas surface
  const drawCover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Rich romantic metallic rose-gold gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#fb7185'); // rose-400
    gradient.addColorStop(0.3, '#f43f5e'); // rose-500
    gradient.addColorStop(0.7, '#e11d48'); // rose-600
    gradient.addColorStop(1, '#be123c'); // rose-700

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle shimmer speckles/glitter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 90; i++) {
      const sx = (Math.sin(i * 997) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 349) * 0.5 + 0.5) * height;
      const r = (Math.sin(i * 47) * 0.5 + 0.5) * 2 + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Little golden sparkling stars
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    for (let i = 0; i < 25; i++) {
      const sx = (Math.sin(i * 123) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 789) * 0.5 + 0.5) * height;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered romantic scratch instructions
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Scale font sizes with canvas resolution (DPR) - reduced by half for a delicate, subtle look
    const dprScale = Math.max(1, width / 280);
    const centerY = height * 0.44; // Placed at optical center of the heart
    const iconSize = Math.round(15 * dprScale);
    const titleSize = Math.round(11.5 * dprScale);
    const subtitleSize = Math.round(7 * dprScale);

    // Subtle dark radial shadow behind text to guarantee maximum contrast and pop
    ctx.save();
    const bgGrad = ctx.createRadialGradient(
      width / 2, centerY, 0,
      width / 2, centerY, width * 0.28
    );
    bgGrad.addColorStop(0, 'rgba(112, 10, 36, 0.45)');
    bgGrad.addColorStop(1, 'rgba(112, 10, 36, 0)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(width / 2, centerY, width * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Little heart & sparkles icon
    ctx.font = `${iconSize}px serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = Math.round(4 * dprScale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(1 * dprScale);
    ctx.fillText('✨ 💖 ✨', width / 2, centerY - titleSize * 1.6);

    // Call to action text: "Passe o dedo aqui" - HALVED SIZE
    ctx.font = `bold ${titleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(68, 5, 23, 0.8)';
    ctx.shadowBlur = Math.round(5 * dprScale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(1 * dprScale);
    ctx.fillText('Passe o dedo aqui', width / 2, centerY);

    // Subtitle: "e raspe para liberar o álbum" - HALVED SIZE
    ctx.font = `600 ${subtitleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = 'rgba(255, 241, 245, 0.98)';
    ctx.shadowColor = 'rgba(68, 5, 23, 0.7)';
    ctx.shadowBlur = Math.round(3 * dprScale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(1 * dprScale);
    ctx.fillText('e raspe para liberar o álbum', width / 2, centerY + titleSize * 1.35);

    ctx.restore();
  }, []);

  // Setup canvas resolution and initial draw
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const sparkleCanvas = sparkleCanvasRef.current;
    if (sparkleCanvas) {
      if (sparkleCanvas.width !== targetW || sparkleCanvas.height !== targetH) {
        sparkleCanvas.width = targetW;
        sparkleCanvas.height = targetH;
      }
    }

    drawCover();
    setScratchedPercent(0);
    setIsRevealed(false);
    hasTriggeredCelebrationRef.current = false;
  }, [drawCover]);

  // Clean animation loop for glowing sparkles trailing finger movement
  const animateSparkles = useCallback(() => {
    const canvas = sparkleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw glowing finger aura if active or fading
    const glow = touchGlowRef.current;
    if (glow.alpha > 0.01) {
      ctx.save();
      const rad = Math.max(38, canvas.width * 0.13);
      const grad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, rad);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * glow.alpha})`);
      grad.addColorStop(0.25, `rgba(254, 240, 138, ${0.7 * glow.alpha})`);
      grad.addColorStop(0.65, `rgba(251, 113, 133, ${0.4 * glow.alpha})`);
      grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(glow.x, glow.y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!isDrawingRef.current) {
        glow.alpha *= 0.86;
        if (glow.alpha < 0.02) glow.alpha = 0;
      }
    }

    // 2. Draw sparkling particles and 4-point twinkling stars
    for (let i = sparklesRef.current.length - 1; i >= 0; i--) {
      const p = sparklesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.rotation += p.rotationSpeed;

      if (p.alpha <= 0) {
        sparklesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      if (p.spikes === 4) {
        // Draw 4-point twinkle star
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        const rOuter = p.size;
        const rInner = p.size * 0.28;
        for (let s = 0; s < 8; s++) {
          const r = s % 2 === 0 ? rOuter : rInner;
          const angle = (s * Math.PI) / 4;
          const sx = Math.cos(angle) * r;
          const sy = Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw glowing sparkle circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (sparklesRef.current.length > 0 || glow.alpha > 0.01 || isDrawingRef.current) {
      sparkleAnimRef.current = requestAnimationFrame(animateSparkles);
    } else {
      sparkleAnimRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sparkleAnimRef.current) {
        cancelAnimationFrame(sparkleAnimRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initial setup with slight delay for container rendering
    const timer = setTimeout(setupCanvas, 100);
    window.addEventListener('resize', setupCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [setupCanvas]);

  // Reveal everything totally
  const handleRevealAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    setScratchedPercent(100);
    setIsRevealed(true);

    if (!hasTriggeredCelebrationRef.current) {
      hasTriggeredCelebrationRef.current = true;
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.75 },
        colors: ['#ff4081', '#f43f5e', '#fb7185', '#ffffff'],
      });

      if (onRevealComplete) {
        onRevealComplete();
      }
    }
  }, [onRevealComplete]);

  // Calculate percentage of canvas that has been cleared inside the heart
  const calculateScratchedPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Sample every 16 pixels inside the heart path for accurate measurement
    const step = 16;
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let clearPixels = 0;
      let totalSampled = 0;
      const heartPath = getHeartPath2D(width, height);

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (ctx.isPointInPath(heartPath, x, y)) {
            const index = (y * width + x) * 4;
            // Alpha channel is index + 3 (< 128 means scratched away)
            if (data[index + 3] < 128) {
              clearPixels++;
            }
            totalSampled++;
          }
        }
      }

      if (totalSampled > 0) {
        const percent = Math.min(100, Math.round((clearPixels / totalSampled) * 100));
        setScratchedPercent(percent);

        // Desbloqueia o álbum após raspar 84% do coração!
        if (percent >= 84 && !hasTriggeredCelebrationRef.current) {
          handleRevealAll();
        }
      }
    } catch {
      // Security boundary fallback if canvas was tainted
    }
  }, [handleRevealAll]);

  // Scratch action drawing
  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const currentX = (clientX - rect.left) * scaleX;
      const currentY = (clientY - rect.top) * scaleY;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(38, canvas.width * 0.12);

      if (lastPosRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(currentX, currentY, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      lastPosRef.current = { x: currentX, y: currentY };

      // Update radiant glow & spawn magical sparkles as finger moves
      touchGlowRef.current = { x: currentX, y: currentY, alpha: 1 };
      const sparkleColors = ['#ffffff', '#fff59d', '#ffdf00', '#fbcfe8', '#fda4af', '#f43f5e'];
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 2.8;
        sparklesRef.current.push({
          x: currentX + (Math.random() - 0.5) * 18,
          y: currentY + (Math.random() - 0.5) * 18,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          size: 2.5 + Math.random() * 4.5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          spikes: Math.random() > 0.35 ? 4 : 0,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
      }

      if (!sparkleAnimRef.current) {
        sparkleAnimRef.current = requestAnimationFrame(animateSparkles);
      }
    },
    [animateSparkles]
  );

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only primary button / touch
    if (e.button !== 0) return;

    // Só possibilita a raspagem quando o coração estiver aparecendo por completo na tela
    if (!checkIsFullyInView()) {
      return;
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPosRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (!checkIsFullyInView()) {
      isDrawingRef.current = false;
      return;
    }
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
      calculateScratchedPercent();
      // Keep sparkle loop running so lingering glow and particles finish fading smoothly
      if (!sparkleAnimRef.current) {
        sparkleAnimRef.current = requestAnimationFrame(animateSparkles);
      }
    }
  };

  // Touch event listeners directly on element to prevent page scroll ONLY while actively scratching
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      // Se não estiver com o coração todo visível ou não estiver ativamente raspando, permite rolar a página normalmente
      if (isFullyVisibleRef.current && isDrawingRef.current) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);



  // Reset cover
  const handleReset = () => {
    drawCover();
    setScratchedPercent(0);
    setIsRevealed(false);
    hasTriggeredCelebrationRef.current = false;
    sparklesRef.current = [];
    touchGlowRef.current = { x: 0, y: 0, alpha: 0 };
    if (sparkleCanvasRef.current) {
      const ctx = sparkleCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, sparkleCanvasRef.current.width, sparkleCanvasRef.current.height);
    }
  };

  return (
    <section
      id="heart-scratch-section"
      className="w-full max-w-md mx-auto my-8 sm:my-12 px-4 flex flex-col items-center select-none"
    >
      {/* SVG Definition of the Perfectly Symmetrical & Rounded Heart Clip Path */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="scratch-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.50, 0.22 C 0.45, 0.12, 0.36, 0.06, 0.25, 0.06 C 0.14, 0.06, 0.05, 0.17, 0.05, 0.34 C 0.05, 0.54, 0.24, 0.73, 0.50, 0.92 C 0.76, 0.73, 0.95, 0.54, 0.95, 0.34 C 0.95, 0.17, 0.86, 0.06, 0.75, 0.06 C 0.64, 0.06, 0.55, 0.12, 0.50, 0.22 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Romantic Title & Description with Fade Animation (triggers once) */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-5"
      >
        <h3 className="text-[34px] sm:text-[40px] md:text-[44px] font-serif italic font-bold text-[#5c1322] tracking-wide leading-tight drop-shadow-xs">
          Nossos momentos...
        </h3>
      </motion.div>

      {/* Main Heart Scratch Container with Fade Animation (triggers once) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative flex flex-col items-center w-full"
      >
        {/* Decorative Outer Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-300/30 via-rose-300/40 to-pink-300/30 rounded-full blur-xl pointer-events-none" />

        {/* Heart Frame / Card */}
        <div
          ref={containerRef}
          className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] drop-shadow-xl transition-transform duration-300"
        >
          {/* Heart Clip Container for Photo & Scratch Canvas */}
          <div
            className="w-full h-full relative"
            style={{
              clipPath: 'url(#scratch-heart-clip)',
              WebkitClipPath: 'url(#scratch-heart-clip)',
            }}
          >
            {/* 1. Underlying Secret Photo - Responsive & customizable framing */}
            <img
              src={photoUrl}
              alt="Foto Surpresa Revelada"
              className="w-full h-full object-cover select-none pointer-events-none bg-rose-100 transition-transform duration-100"
              style={{
                transform: `scale(${scale}) translate(${offsetX}%, ${offsetY}%)`,
                transformOrigin: 'center center',
                objectPosition: 'center center',
              }}
              referrerPolicy="no-referrer"
            />

            {/* 2. Scratchable Canvas Overlay on top of the Photo */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute inset-0 w-full h-full z-10 transition-colors ${
                isFullyVisible ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                touchAction: isFullyVisible ? 'none' : 'pan-y',
              }}
              title={
                isFullyVisible
                  ? 'Passe o dedo para raspar'
                  : 'Role a página até o coração ficar visível por inteiro para raspar'
              }
            />

            {/* 3. Magical Glowing Sparkle Trail Canvas */}
            <canvas
              ref={sparkleCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />
          </div>

          {/* Golden/Rose Outer Border Accent Contour */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
          >
            <path
              d="M 50, 22 C 45, 12, 36, 6, 25, 6 C 14, 6, 5, 17, 5, 34 C 5, 54, 24, 73, 50, 92 C 76, 73, 95, 54, 95, 34 C 95, 17, 86, 6, 75, 6 C 64, 6, 55, 12, 50, 22 Z"
              fill="none"
              stroke="rgba(244, 63, 94, 0.45)"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Progress & Status */}
        <div className="mt-4 flex flex-col items-center gap-1.5 w-full max-w-[260px]">
          {!isRevealed && !isFullyVisible && (
            <p className="text-[11px] font-medium text-rose-700/85 italic text-center animate-pulse mb-0.5">
              Role a tela até o coração aparecer por inteiro para raspar ✨
            </p>
          )}

          <div className="flex items-center justify-between w-full text-xs font-medium text-pink-900/80">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span>{isRevealed ? 'Revelado!' : isFullyVisible ? 'Raspando...' : 'Aguardando visão total'}</span>
            </span>
            <span className="font-semibold text-pink-600">{scratchedPercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden border border-pink-200/70 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${scratchedPercent}%` }}
            />
          </div>

          {isRevealed && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {partnerName && !partnerName.toLowerCase().includes('ano') && partnerName.length <= 15
                  ? `Foto revelada com sucesso para ${partnerName}! 🥰`
                  : 'Foto revelada com sucesso! 🥰'}
              </span>
            </motion.p>
          )}
        </div>

        {/* Action Controls - only show Revelar tudo while not revealed */}
        {!isRevealed && (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleRevealAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-medium text-pink-900 border border-pink-200/80 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Revelar a foto completa instantaneamente"
            >
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>Revelar tudo</span>
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
};
