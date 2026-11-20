import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, ShieldCheck, Zap, ShieldAlert, RotateCw, Eye } from 'lucide-react';
import type { PaymentStatus, SecurityAlert } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface Soundbox3DDeviceProps {
  status: PaymentStatus;
  securityAlert?: SecurityAlert;
  amountXof?: number;
  amountSats?: number;
  isMuted?: boolean;
}

export const Soundbox3DDevice: React.FC<Soundbox3DDeviceProps> = ({
  status,
  securityAlert = 'NONE',
  amountXof = 5000,
  amountSats,
  isMuted = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'reset' | 'front' | 'perspective'>('reset');
  const { t, language } = useTranslation();

  // Reference to update canvas texture dynamically without rebuilding Three.js scene
  const updateScreenTextureRef = useRef<(() => void) | null>(null);
  const setPresetRotationRef = useRef<((rx: number, ry: number) => void) | null>(null);

  // Status theme colors and labels
  const theme = useMemo(() => {
    if (securityAlert === 'SPOOF_REJECTED' || status === 'FAILED' || status === 'EXPIRED') {
      return {
        hex: 0xdc2626,
        css: '#DC2626',
        badgeBg: '#FEE2E2',
        badgeText: '#B91C1C',
        label: t('soundbox_state_alert_label'),
        subtext: t('soundbox_state_alert_subtext'),
        state: 'alert',
      };
    }
    if (securityAlert === 'UNSETTLED_HOLD') {
      return {
        hex: 0xd97706,
        css: '#D97706',
        badgeBg: '#FEF3C7',
        badgeText: '#B45309',
        label: 'UNSETTLED HTLC',
        subtext: 'AWAITING PREIMAGE · SILENT',
        state: 'pending',
      };
    }
    if (status === 'PAID') {
      return {
        hex: 0x10b981,
        css: '#10B981',
        badgeBg: '#D1FAE5',
        badgeText: '#047857',
        label: t('soundbox_state_paid_label'),
        subtext: t('soundbox_state_paid_subtext'),
        state: 'paid',
      };
    }
    if (status === 'PENDING' || status === 'UNPAID') {
      return {
        hex: 0xd97706,
        css: '#D97706',
        badgeBg: '#FEF3C7',
        badgeText: '#B45309',
        label: t('soundbox_state_pending_label'),
        subtext: t('soundbox_state_pending_subtext'),
        state: 'pending',
      };
    }
    return {
      hex: 0xc8963e,
      css: '#C8963E',
      badgeBg: '#FAF7F2',
      badgeText: '#0F3D2E',
      label: t('soundbox_state_idle_label'),
      subtext: t('soundbox_state_idle_subtext'),
      state: 'idle',
    };
  }, [status, securityAlert, t]);

  // Keep a mutable ref of latest props so Three.js render loop & textures never use stale closures
  const propsRef = useRef({
    status,
    securityAlert,
    amountXof,
    amountSats,
    isMuted,
    theme,
    language,
    t,
  });

  // Dedicated recoil shake trigger ref
  const shakeTriggerRef = useRef<{ startTime: number; active: boolean }>({
    startTime: 0,
    active: false,
  });

  // Track previous security alert to trigger fresh shake on new alert
  const prevSecurityAlertRef = useRef<SecurityAlert>(securityAlert);

  // Update canvas texture whenever props or language change
  useEffect(() => {
    propsRef.current = {
      status,
      securityAlert,
      amountXof,
      amountSats,
      isMuted,
      theme,
      language,
      t,
    };

    if (securityAlert === 'SPOOF_REJECTED' || (securityAlert !== 'NONE' && prevSecurityAlertRef.current !== securityAlert)) {
      shakeTriggerRef.current = {
        startTime: performance.now(),
        active: true,
      };
    }
    prevSecurityAlertRef.current = securityAlert;

    if (updateScreenTextureRef.current) {
      updateScreenTextureRef.current();
    }
  }, [theme, amountXof, amountSats, language, status, securityAlert, t]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLFailed(true);
        return;
      }
    } catch {
      setWebGLFailed(true);
      return;
    }

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.background = null;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 290;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.6);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setWebGLFailed(true);
      return;
    }

    // 2. Root Interactive Group
    const soundboxGroup = new THREE.Group();
    scene.add(soundboxGroup);

    // 3. Contact Shadow Plane underneath device
    const shadowGeo = new THREE.PlaneGeometry(2.4, 1.8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(15, 61, 46, 0.35)');
      grad.addColorStop(0.5, 'rgba(15, 61, 46, 0.12)');
      grad.addColorStop(1, 'rgba(15, 61, 46, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.02;
    soundboxGroup.add(shadowMesh);

    // 4. Main Countertop Body (Baobab Forest Matte Finish)
    const bodyGeo = new THREE.BoxGeometry(1.65, 1.95, 0.95);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f3d2e, // Deep Baobab Forest Green
      roughness: 0.32,
      metalness: 0.18,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    soundboxGroup.add(bodyMesh);

    // 5. Brushed Sahel Gold Top Plate
    const topCapGeo = new THREE.BoxGeometry(1.66, 0.08, 0.96);
    const topCapMat = new THREE.MeshStandardMaterial({
      color: 0xc8963e, // Anodized Sahel Gold
      roughness: 0.22,
      metalness: 0.85,
    });
    const topCapMesh = new THREE.Mesh(topCapGeo, topCapMat);
    topCapMesh.position.set(0, 0.98, 0);
    soundboxGroup.add(topCapMesh);

    // 6. Warm Ivory Chamfered Front Inset Panel
    const frontPanelGeo = new THREE.BoxGeometry(1.48, 1.76, 0.08);
    const frontPanelMat = new THREE.MeshStandardMaterial({
      color: 0xfaf7f2, // Warm Sahel Ivory Canvas
      roughness: 0.45,
      metalness: 0.05,
    });
    const frontPanelMesh = new THREE.Mesh(frontPanelGeo, frontPanelMat);
    frontPanelMesh.position.set(0, 0, 0.48);
    soundboxGroup.add(frontPanelMesh);

    // 7. Gold Speaker Grille Perforations Disk
    const grilleGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.04, 36);
    grilleGeo.rotateX(Math.PI / 2);
    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.25,
      metalness: 0.78,
    });
    const grilleMesh = new THREE.Mesh(grilleGeo, grilleMat);
    grilleMesh.position.set(0, 0.3, 0.53);
    soundboxGroup.add(grilleMesh);

    // Inner speaker acoustic cloth
    const clothGeo = new THREE.CircleGeometry(0.38, 32);
    const clothMat = new THREE.MeshBasicMaterial({ color: 0x071b14 });
    const clothMesh = new THREE.Mesh(clothGeo, clothMat);
    clothMesh.position.set(0, 0.3, 0.552);
    soundboxGroup.add(clothMesh);

    // 8. Glowing 360° LED Status Bezel Ring
    const haloGeo = new THREE.TorusGeometry(0.48, 0.038, 16, 48);
    const haloMat = new THREE.MeshStandardMaterial({
      color: theme.hex,
      emissive: theme.hex,
      emissiveIntensity: 1.4,
      roughness: 0.15,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.3, 0.538);
    soundboxGroup.add(haloMesh);

    // 9. Expanding 3D Translucent Emerald Acoustic Rings
    const waveRingGeos = [0.54, 0.66, 0.78].map((r) => new THREE.RingGeometry(r, r + 0.025, 36));
    const waveRings = waveRingGeos.map((geo) => {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(geo, ringMat);
      ring.position.set(0, 0.3, 0.545);
      soundboxGroup.add(ring);
      return ring;
    });

    // 10. Celebratory Floating Gold & Emerald Micro-Particles (PAID state)
    const particleCount = 42;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 2.2;
      particlePos[i * 3 + 1] = 0.2 + Math.random() * 1.5;
      particlePos[i * 3 + 2] = 0.4 + Math.random() * 0.8;
      particleVel[i * 3] = (Math.random() - 0.5) * 0.01;
      particleVel[i * 3 + 1] = 0.008 + Math.random() * 0.014;
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.07,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    soundboxGroup.add(particles);

    // 11. High-Resolution Live Canvas2D OLED Front Screen Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const s2d = screenCanvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const screenGeo = new THREE.BoxGeometry(1.24, 0.54, 0.025);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.12,
      metalness: 0.9,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, -0.42, 0.535);
    soundboxGroup.add(screenMesh);

    // Redraw screen canvas texture function
    const drawOledScreen = () => {
      if (!s2d) return;
      const w = screenCanvas.width;
      const h = screenCanvas.height;

      // Dark OLED Glass Background with subtle gradient
      const bgGrad = s2d.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#040806');
      bgGrad.addColorStop(1, '#08120D');
      s2d.fillStyle = bgGrad;
      s2d.fillRect(0, 0, w, h);

      const {
        status: curStatus,
        securityAlert: curAlert,
        amountXof: curXof,
        amountSats: curSats,
        language: curLang,
        t: curT,
      } = propsRef.current;

      // Top Header Row: Brand & Language Pill
      s2d.fillStyle = '#C8963E';
      s2d.font = 'bold 15px "JetBrains Mono", monospace';
      s2d.textAlign = 'left';
      s2d.fillText('⚡ SOVEREIGN SOUNDBOX', 24, 34);

      s2d.textAlign = 'right';
      s2d.fillStyle = '#C8963E';
      s2d.font = 'bold 13px "JetBrains Mono", monospace';
      s2d.fillText(`[${curLang.toUpperCase()}] · NIP-47`, w - 24, 34);

      // Dividing micro-line
      s2d.strokeStyle = 'rgba(200, 150, 62, 0.25)';
      s2d.lineWidth = 1.5;
      s2d.beginPath();
      s2d.moveTo(24, 46);
      s2d.lineTo(w - 24, 46);
      s2d.stroke();

      const isPaid = curStatus === 'PAID';
      const isAlert = curAlert === 'SPOOF_REJECTED' || curStatus === 'FAILED' || curStatus === 'EXPIRED';
      const isUnsettledHold = curAlert === 'UNSETTLED_HOLD';
      const isPending = curStatus === 'PENDING' || curStatus === 'UNPAID';

      if (curAlert === 'SPOOF_REJECTED' || (isAlert && curAlert !== 'UNSETTLED_HOLD')) {
        // Red-Team Spoof Rejection OLED Display
        s2d.fillStyle = '#EF4444';
        s2d.font = '800 32px "Plus Jakarta Sans", sans-serif';
        s2d.textAlign = 'center';
        s2d.fillText('⚠ SPOOF REJECTED', w / 2, 95);

        s2d.fillStyle = '#FF4D4D';
        s2d.font = '800 28px "JetBrains Mono", monospace';
        s2d.fillText('REJECTED: NO PROOF', w / 2, 138);

        s2d.fillStyle = '#DC2626';
        const pillW = 460;
        const pillH = 44;
        const pillX = (w - pillW) / 2;
        const pillY = 186;
        s2d.beginPath();
        s2d.roundRect(pillX, pillY, pillW, pillH, 12);
        s2d.fill();

        s2d.fillStyle = '#FFFFFF';
        s2d.font = 'bold 15px "JetBrains Mono", monospace';
        s2d.fillText('SPEAKER SILENT · ZERO NIP-47 PROOF', w / 2, pillY + 28);
      } else if (isUnsettledHold) {
        // Red-Team Unsettled Hold Invoice Display
        s2d.fillStyle = '#F59E0B';
        s2d.font = '800 30px "Plus Jakarta Sans", sans-serif';
        s2d.textAlign = 'center';
        s2d.fillText('⏳ UNSETTLED HTLC', w / 2, 95);

        s2d.fillStyle = '#FBBF24';
        s2d.font = '800 24px "JetBrains Mono", monospace';
        s2d.fillText('AWAITING PREIMAGE', w / 2, 138);

        s2d.fillStyle = '#D97706';
        const pillW = 460;
        const pillH = 44;
        const pillX = (w - pillW) / 2;
        const pillY = 186;
        s2d.beginPath();
        s2d.roundRect(pillX, pillY, pillW, pillH, 12);
        s2d.fill();

        s2d.fillStyle = '#FFFFFF';
        s2d.font = 'bold 15px "JetBrains Mono", monospace';
        s2d.fillText('SPEAKER SILENT · UNCLAIMED IN CHANNEL', w / 2, pillY + 28);
      } else {
        // Normal / Pending / Paid Amount Display
        s2d.fillStyle = '#FAF7F2';
        s2d.font = '800 46px "Plus Jakarta Sans", sans-serif';
        s2d.textAlign = 'center';
        const displayAmount = curXof ? `${curXof.toLocaleString('fr-SN')} CFA` : '0 CFA';
        s2d.fillText(displayAmount, w / 2, 110);

        // Sub-amount satoshis + rate source
        if (curSats) {
          s2d.fillStyle = '#DFC07B';
          s2d.font = '600 17px "JetBrains Mono", monospace';
          s2d.fillText(`≈ ${curSats.toLocaleString()} SATS · SHA-256`, w / 2, 144);
        } else {
          s2d.fillStyle = '#A3ABA7';
          s2d.font = '14px "JetBrains Mono", monospace';
          s2d.fillText('BITCOIN LIGHTNING POS', w / 2, 144);
        }

        // Bottom Status Pill Badge
        let pillBg = '#0F3D2E';
        let pillText = '#C8963E';
        let statusString = curT('oled_ready_sale');

        if (isPaid) {
          pillBg = '#10B981';
          pillText = '#042F20';
          statusString = `${curT('soundbox_state_paid_label')} · SHA-256 ✓`;
        } else if (isAlert) {
          pillBg = '#DC2626';
          pillText = '#FFFFFF';
          statusString = curT('soundbox_state_alert_label');
        } else if (isPending) {
          pillBg = '#D97706';
          pillText = '#FFFFFF';
          statusString = curT('oled_awaiting_payment');
        }

        const pillW = 440;
        const pillH = 44;
        const pillX = (w - pillW) / 2;
        const pillY = 186;

        s2d.fillStyle = pillBg;
        s2d.beginPath();
        s2d.roundRect(pillX, pillY, pillW, pillH, 12);
        s2d.fill();

        s2d.fillStyle = pillText;
        s2d.font = 'bold 17px "JetBrains Mono", monospace';
        s2d.textAlign = 'center';
        s2d.fillText(statusString, w / 2, pillY + 28);
      }

      screenTexture.needsUpdate = true;
    };

    updateScreenTextureRef.current = () => {
      drawOledScreen();
      const currentTheme = propsRef.current.theme;
      haloMat.color.setHex(currentTheme.hex);
      haloMat.emissive.setHex(currentTheme.hex);
      statusLight.color.setHex(currentTheme.hex);
    };

    drawOledScreen();

    // 12. Flagship Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.75);
    scene.add(ambientLight);

    // Warm Sahel Sunlight Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.45);
    keyLight.position.set(2.5, 4.0, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool Sky Rim Light
    const rimLight = new THREE.PointLight(0xa5c9e2, 0.85, 12);
    rimLight.position.set(-2.8, 1.8, 2.5);
    scene.add(rimLight);

    // Sahel Gold Specular Accent Light
    const goldSpecularLight = new THREE.PointLight(0xc8963e, 0.8, 8);
    goldSpecularLight.position.set(0, -1.5, 2.0);
    scene.add(goldSpecularLight);

    // Status Light
    const statusLight = new THREE.PointLight(theme.hex, 1.5, 3.5);
    statusLight.position.set(0, 0.3, 0.9);
    scene.add(statusLight);

    // 13. Interactive Drag Orbit & Tilt Controls + Presets
    let targetRotX = 0.06;
    let targetRotY = -0.14;
    let currentRotX = targetRotX;
    let currentRotY = targetRotY;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    setPresetRotationRef.current = (rx: number, ry: number) => {
      targetRotX = rx;
      targetRotY = ry;
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      targetRotY += deltaX * 0.0075;
      targetRotX += deltaY * 0.0075;

      // Limit yaw to ±28° and pitch to ±18°
      targetRotX = Math.max(-0.31, Math.min(0.31, targetRotX));
      targetRotY = Math.max(-0.49, Math.min(0.49, targetRotY));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      setIsInteracting(false);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    // 14. Render Loop with State Animations, Damped Recoil Shake & Particles
    let animFrameId: number;
    const clock = new THREE.Clock();

    let isVisible = true;
    const visibilityObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Save 100% GPU when scrolled away

      const elapsed = clock.getElapsedTime();
      const { status: curStatus, securityAlert: curAlert } = propsRef.current;

      // Smooth damping interpolation
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      // Violent recoil horizontal shake animation when alert triggered
      let shakeOffset = 0;
      let recoilTiltZ = 0;
      if (shakeTriggerRef.current.active) {
        const timeSinceShake = (performance.now() - shakeTriggerRef.current.startTime) / 1000;
        if (timeSinceShake < 1.8) {
          const shakeDecay = Math.max(0, 1.0 - timeSinceShake / 1.8);
          // High-frequency violent horizontal shake
          shakeOffset = Math.sin(timeSinceShake * 60) * 0.16 * shakeDecay;
          recoilTiltZ = Math.sin(timeSinceShake * 45) * 0.08 * shakeDecay;
        } else {
          shakeTriggerRef.current.active = false;
        }
      } else if (curAlert === 'SPOOF_REJECTED' || curStatus === 'FAILED') {
        // Continuous subtle warning jitter while alert persists
        shakeOffset = Math.sin(elapsed * 25) * 0.015;
      }
      soundboxGroup.position.x = shakeOffset;

      // Subtle idle breathing motion when not dragging
      const idleFloatY = isDragging ? 0 : Math.sin(elapsed * 1.6) * 0.015;
      const idleFloatX = isDragging ? 0 : Math.cos(elapsed * 1.1) * 0.01;

      soundboxGroup.rotation.x = currentRotX + idleFloatX;
      soundboxGroup.rotation.y = currentRotY + idleFloatY;
      soundboxGroup.rotation.z = recoilTiltZ;

      // Dynamic LED status halo pulse & Crimson Flash
      if (curAlert === 'SPOOF_REJECTED') {
        // Sharp, rapid crimson strobe flash
        const flash = 1.0 + Math.abs(Math.sin(elapsed * 20)) * 1.8;
        haloMat.emissiveIntensity = flash * 2.0;
        statusLight.intensity = flash * 2.5;
      } else if (curAlert === 'UNSETTLED_HOLD' || curStatus === 'PENDING') {
        // Rhythmic amber scanning pulse
        const amberPulse = 1.0 + Math.sin(elapsed * 3.5) * 0.6;
        haloMat.emissiveIntensity = amberPulse * 1.3;
        statusLight.intensity = amberPulse * 1.5;
      } else {
        const pulseSpeed = curStatus === 'PAID' ? 5.0 : 1.5;
        const pulse = 1.0 + Math.sin(elapsed * pulseSpeed) * 0.35;
        haloMat.emissiveIntensity = pulse * 1.3;
        statusLight.intensity = pulse * 1.4;
      }

      // Acoustic Wave Rings Animation (during PAID)
      if (curStatus === 'PAID') {
        waveRings.forEach((ring, idx) => {
          const ringElapsed = (elapsed * 2.0 + idx * 0.45) % 1.6;
          const scale = 1.0 + ringElapsed * 0.45;
          ring.scale.set(scale, scale, 1);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 0.75 - ringElapsed * 0.45);
        });
      } else {
        waveRings.forEach((ring) => {
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = 0;
        });
      }

      // Celebratory micro-particles during PAID
      if (curStatus === 'PAID') {
        particleMat.opacity = Math.min(0.85, (Math.sin(elapsed * 2.5) + 1) * 0.45 + 0.1);
        const posArr = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3 + 1] += particleVel[i * 3 + 1];
          if (posArr[i * 3 + 1] > 2.0) {
            posArr[i * 3 + 1] = 0.2;
            posArr[i * 3] = (Math.random() - 0.5) * 2.0;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particleMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 14. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      bodyGeo.dispose();
      frontPanelGeo.dispose();
      grilleGeo.dispose();
      haloGeo.dispose();
      screenGeo.dispose();
      screenTexture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []); // Mounted once, textures updated reactively

  return (
    <div
      className="relative w-full bg-surface border border-border-warm rounded-3xl p-5 shadow-flagship flex flex-col gap-3 overflow-hidden select-none"
      aria-label={t('soundbox_3d_title')}
    >
      {/* Top Header Strip */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border-warm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
            <Zap className="w-4 h-4 text-gold" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-forest tracking-wider uppercase font-mono">
              {t('soundbox_3d_title')}
            </h4>
            <p className="text-[10px] text-muted font-mono flex items-center gap-1.5">
              <span>{isMuted ? t('soundbox_speaker_muted') : t('soundbox_speaker_active')}</span>
              <span>•</span>
              <span className="text-forest font-semibold">{theme.subtext}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold font-mono border shadow-xs transition-colors"
          style={{
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            borderColor: `${theme.css}40`,
          }}
        >
          {theme.state === 'paid' ? (
            <ShieldCheck className="w-4 h-4 text-verified" />
          ) : theme.state === 'alert' ? (
            <ShieldAlert className="w-4 h-4 text-danger animate-pulse" />
          ) : theme.state === 'pending' ? (
            <span className="w-2 h-2 rounded-full bg-pending animate-ping" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gold" />
          )}
          <span>{theme.label}</span>
        </div>
      </div>

      {/* 3D Canvas Mounting Area with Orbit Drag Handle */}
      <div className="relative w-full h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none">
        {webGLFailed ? (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-canvas rounded-2xl border border-dashed border-border-warm text-xs font-mono text-muted">
            <Zap className="w-8 h-8 text-gold mb-2" />
            <p className="font-bold text-ink">{t('soundbox_webgl_fallback')}</p>
            <p className="text-[11px] mt-1">{displayFallbackDetails(status, amountXof, t)}</p>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}

        {/* 1-Click Camera Preset Control Bar */}
        <div className="absolute top-2 left-3 flex items-center gap-1 bg-surface/90 backdrop-blur-xs p-1 rounded-xl border border-border-warm shadow-xs">
          <Eye className="w-3 h-3 text-gold ml-1" />
          <button
            onClick={() => {
              setActivePreset('front');
              setPresetRotationRef.current?.(0, 0);
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-colors ${
              activePreset === 'front'
                ? 'bg-forest text-surface'
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            {t('camera_preset_front')}
          </button>
          <button
            onClick={() => {
              setActivePreset('perspective');
              setPresetRotationRef.current?.(0.14, -0.32);
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-colors ${
              activePreset === 'perspective'
                ? 'bg-forest text-surface'
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            {t('camera_preset_perspective')}
          </button>
          <button
            onClick={() => {
              setActivePreset('reset');
              setPresetRotationRef.current?.(0.06, -0.14);
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-colors ${
              activePreset === 'reset'
                ? 'bg-forest text-surface'
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            {t('camera_preset_reset')}
          </button>
        </div>

        {/* Subtle Orbit / Drag Hint Overlay */}
        <div
          className={`absolute bottom-2 left-3 flex items-center gap-1 text-[10px] font-mono text-muted/80 bg-surface/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border-warm/70 transition-opacity duration-300 pointer-events-none ${
            isInteracting ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <RotateCw className="w-3 h-3 text-gold" />
          <span>{t('soundbox_drag_hint')}</span>
        </div>

        {/* Audio Mute Indicator icon on corner */}
        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border-warm text-muted">
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-danger" /> : <Volume2 className="w-3.5 h-3.5 text-forest" />}
        </div>
      </div>
    </div>
  );
};

function displayFallbackDetails(status: PaymentStatus, amountXof: number, t: (k: any) => string): string {
  if (status === 'PAID') return `${amountXof.toLocaleString('fr-SN')} CFA · ${t('soundbox_state_paid_label')}`;
  if (status === 'PENDING') return t('soundbox_state_pending_label');
  return t('soundbox_state_idle_label');
}
