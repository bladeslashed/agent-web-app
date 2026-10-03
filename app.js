/**
 * SYNAPSE 50 — MODERN APPLIED MACHINE LEARNING BLUEPRINTS
 * Interactive Application Engine & Neural Simulations
 */

(function () {
  'use strict';

  // --- Audio Effects Synthesizer & High-Fidelity Audio Engine ---
  class SoundFX {
    constructor() {
      this.enabled = localStorage.getItem('synapse_audio_enabled') !== 'false';
      this.ctx = null;

      // User-specified high fidelity SFX audio files
      this.masteringAudio = new Audio('sfx/soynoviembre-digital-success-chime-futuristic-ui-notification-sfx-562086 (1).mp3');
      this.resetAudio = new Audio('sfx/miraclei-sample_confirm_accept02_kofi_by_miraclei-364180.mp3');
      this.masteringAudio.preload = 'auto';
      this.resetAudio.preload = 'auto';
    }

    init() {
      if (!this.ctx && typeof window.AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('synapse_audio_enabled', this.enabled);
      return this.enabled;
    }

    playSuccess() {
      if (!this.enabled) return;
      try {
        this.masteringAudio.currentTime = 0;
        this.masteringAudio.volume = 0.65;
        const p = this.masteringAudio.play();
        if (p) p.catch(() => {});
      } catch (e) {
        this.fallbackTone(800, 'sine', 0.15);
      }
    }

    playReset() {
      if (!this.enabled) return;
      try {
        this.resetAudio.currentTime = 0;
        this.resetAudio.volume = 0.65;
        const p = this.resetAudio.play();
        if (p) p.catch(() => {});
      } catch (e) {
        this.fallbackTone(450, 'triangle', 0.12);
      }
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    }

    playTone(freq, type = 'sine', duration = 0.08) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    fallbackTone(freq, type = 'sine', duration = 0.1) {
      this.playTone(freq, type, duration);
    }
  }

  const sfx = new SoundFX();

  // ==========================================================================
  // THREE.JS 3D MULTI-LAYER VOLUMETRIC ORB & ILLUMINATED COSMIC SCENE
  // ==========================================================================
  function initInteractiveOrangeSphere() {
    const canvas = document.getElementById('synapse-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
      setTimeout(initInteractiveOrangeSphere, 100);
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.error('WebGL init error:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // 1. Multi-Point Scene Illumination
    const ambientLight = new THREE.AmbientLight(0xff8833, 1.9);
    scene.add(ambientLight);

    const leftFillLight = new THREE.PointLight(0xffaa00, 2.6, 60);
    leftFillLight.position.set(-14, 6, 8);
    scene.add(leftFillLight);

    const rightFillLight = new THREE.PointLight(0xff4500, 2.8, 60);
    rightFillLight.position.set(14, -6, 6);
    scene.add(rightFillLight);

    const topSun = new THREE.DirectionalLight(0xffb703, 1.4);
    topSun.position.set(5, 14, 10);
    scene.add(topSun);

    // =========================================================================
    // BACKGROUND ILLUMINATION: AMBER STARFIELD, DATA NODES, ENERGY GRID
    // =========================================================================
    function createGlowPointTexture() {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const pCtx = pCanvas.getContext('2d');
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 220, 120, 0.95)');
      grad.addColorStop(0.5, 'rgba(255, 107, 0, 0.6)');
      grad.addColorStop(0.8, 'rgba(255, 60, 0, 0.2)');
      grad.addColorStop(1, 'rgba(255, 60, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.beginPath();
      pCtx.arc(32, 32, 32, 0, Math.PI * 2);
      pCtx.fill();
      return new THREE.CanvasTexture(pCanvas);
    }

    const starTexture = createGlowPointTexture();
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfff3d4),
      new THREE.Color(0xffc107),
      new THREE.Color(0xff9e1b),
      new THREE.Color(0xff6b00),
      new THREE.Color(0xff4500)
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 60;
      starPositions[idx + 1] = (Math.random() - 0.5) * 44;
      starPositions[idx + 2] = (Math.random() - 0.5) * 45 - 5;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[idx] = c.r;
      starColors[idx + 1] = c.g;
      starColors[idx + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.42,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 18 Floating Holographic Wireframe Polyhedra
    const polyhedraGroup = new THREE.Group();
    const polyhedraList = [];
    const polyMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 18; i++) {
      let geo;
      const type = i % 3;
      if (type === 0) geo = new THREE.OctahedronGeometry(0.65, 0);
      else if (type === 1) geo = new THREE.IcosahedronGeometry(0.6, 0);
      else geo = new THREE.TetrahedronGeometry(0.7, 0);

      // Clone material so each shape can be individually highlighted when hovered or dragged
      const mesh = new THREE.Mesh(geo, polyMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 22 - 6
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const rotSpeed = {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.018,
        z: (Math.random() - 0.5) * 0.012
      };
      const floatSpeed = Math.random() * 0.01 + 0.005;
      const floatOffset = Math.random() * Math.PI * 2;
      const initY = mesh.position.y;

      polyhedraGroup.add(mesh);
      polyhedraList.push({ mesh, rotSpeed, floatSpeed, floatOffset, initY });
    }
    scene.add(polyhedraGroup);

    // Cybernetic Horizon Grid
    const cyberGrid = new THREE.GridHelper(90, 48, 0xff7700, 0x4a2200);
    cyberGrid.position.set(0, -11, -8);
    cyberGrid.rotation.x = Math.PI * 0.06;
    if (cyberGrid.material) {
      cyberGrid.material.transparent = true;
      cyberGrid.material.opacity = 0.28;
      cyberGrid.material.blending = THREE.AdditiveBlending;
    }
    scene.add(cyberGrid);

    // =========================================================================
    // THE 3D ORB (DEEP MULTI-LAYER VOLUMETRIC SYSTEM & PULSING FOUNDATION)
    // =========================================================================
    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(4.4, 1.0, 0);
    scene.add(sphereGroup);

    // Dynamic internal lights
    const corePointLight = new THREE.PointLight(0xfff5dd, 4.5, 22);
    sphereGroup.add(corePointLight);

    const sphereAuraLight = new THREE.PointLight(0xff6b00, 4.0, 38);
    sphereGroup.add(sphereAuraLight);

    // -------------------------------------------------------------------------
    // INTERNAL DEPTH LAYER 1: INNER SWIRLING MOLTEN CORE (Radius 1.35)
    // -------------------------------------------------------------------------
    const innerCoreGeo = new THREE.SphereGeometry(1.35, 48, 48);
    const innerCoreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0xffffff) }, // molten white
        uColorB: { value: new THREE.Color(0xffb703) }, // radiant gold
        uColorC: { value: new THREE.Color(0xff5500) }  // fiery orange
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vChurn;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          // Internal turbulent churning waves
          float churn = sin(position.x * 3.5 - uTime * 3.2) * cos(position.y * 3.5 + uTime * 2.8) * sin(position.z * 3.5 - uTime * 2.4);
          vChurn = churn;
          vec3 newPos = position + normal * (churn * 0.18);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec3 vNormal;
        varying float vChurn;

        void main() {
          float t = smoothstep(-0.6, 0.6, vChurn);
          vec3 col = mix(uColorC, uColorB, t);
          float peak = smoothstep(0.3, 0.9, vChurn);
          col = mix(col, uColorA, peak * 0.85);
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    sphereGroup.add(innerCoreMesh);

    // -------------------------------------------------------------------------
    // INTERNAL DEPTH LAYER 2: MIDDLE TRANSLUCENT PLASMA MANTLE (Radius 1.88)
    // -------------------------------------------------------------------------
    const mantleGeo = new THREE.SphereGeometry(1.88, 48, 48);
    const mantleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vFlow;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          float flow = sin(position.y * 4.0 - uTime * 2.5) * cos(position.x * 4.0 + uTime * 2.0);
          vFlow = flow;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vFlow;

        void main() {
          float fresnel = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 1.8);
          float ribbon = smoothstep(-0.4, 0.5, vFlow);
          vec3 col = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.75, 0.2), ribbon);
          float alpha = (0.35 + ribbon * 0.35) * (0.4 + fresnel * 0.6);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
    sphereGroup.add(mantleMesh);

    // -------------------------------------------------------------------------
    // INTERNAL DEPTH LAYER 3: OUTER REFRACTIVE VOLUMETRIC CRUST (Radius 2.40)
    // -------------------------------------------------------------------------
    const outerSphereGeo = new THREE.SphereGeometry(2.40, 64, 64);
    const outerSphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uVelocity: { value: 0 },
        uFresnelColor: { value: new THREE.Color(0xffe082) }, // glowing golden amber rim
        uCoreColor: { value: new THREE.Color(0xff5500) },    // electric neon orange
        uPeakColor: { value: new THREE.Color(0xffffff) },    // incandescent white highlights
        uDeepColor: { value: new THREE.Color(0x801400) }     // deep burning vermilion
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPulse;
        uniform float uVelocity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewDir;
        varying float vNoise;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;

          float w1 = sin(position.x * 1.8 + uTime * 2.4) * cos(position.y * 1.8 + uTime * 2.0) * sin(position.z * 1.8 + uTime * 1.6);
          float w2 = sin(position.y * 3.2 - uTime * 3.2) * cos(position.z * 3.2 + uTime * 2.6) * 0.45;
          float w3 = sin(position.x * 5.0 + position.z * 5.0 + uTime * 4.0) * 0.2;
          float wave = w1 + w2 + w3;

          float displacement = wave * (0.26 + uVelocity * 0.22) + uPulse * 0.25;
          vNoise = wave;

          vec3 newPos = position + normal * displacement;
          vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uVelocity;
        uniform vec3 uFresnelColor;
        uniform vec3 uCoreColor;
        uniform vec3 uPeakColor;
        uniform vec3 uDeepColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewDir;
        varying float vNoise;

        void main() {
          float NdotV = max(0.0, dot(vNormal, vViewDir));
          float fresnel = pow(1.0 - NdotV, 2.2);

          float tVal = smoothstep(-0.9, 0.9, vNoise);
          vec3 col = mix(uDeepColor, uCoreColor, tVal);

          float peak = smoothstep(0.35, 0.95, vNoise);
          col = mix(col, uPeakColor, peak * 0.75);

          col = mix(col, uFresnelColor, fresnel * 0.92);
          col += uFresnelColor * fresnel * (0.6 + uVelocity * 0.6);

          // Optical semi-transparency in the center lets the viewer see inside!
          float centerAlpha = 0.58 + (1.0 - NdotV) * 0.42;
          gl_FragColor = vec4(col, centerAlpha);
        }
      `,
      transparent: true,
      depthWrite: true
    });
    const outerSphereMesh = new THREE.Mesh(outerSphereGeo, outerSphereMat);
    sphereGroup.add(outerSphereMesh);

    // -------------------------------------------------------------------------
    // MULTI-LAYERED GLOWING, GROWING & PULSING SPHERICAL AURA SYSTEM
    // (Surrounding the central orb with deep concentric volumetric radiance)
    // -------------------------------------------------------------------------

    // AURA LAYER 1: Chromosphere Plasma Envelope (Radius 2.62)
    const chromosphereGeo = new THREE.SphereGeometry(2.62, 54, 54);
    const chromosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uColorA: { value: new THREE.Color(0xff7700) },
        uColorB: { value: new THREE.Color(0xffbe3b) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vNoise;
        uniform float uTime;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          float n = sin(position.y * 3.5 + uTime * 2.2) * cos(position.x * 3.5 - uTime * 1.8);
          vNoise = n;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uVelocity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vNoise;
        void main() {
          float NdotV = max(0.0, dot(vNormal, vViewDir));
          float rim = pow(1.0 - NdotV, 2.2);
          vec3 col = mix(uColorA, uColorB, smoothstep(-0.4, 0.4, vNoise));
          gl_FragColor = vec4(col, rim * (0.65 + uVelocity * 0.35));
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });
    const chromosphereMesh = new THREE.Mesh(chromosphereGeo, chromosphereMat);
    sphereGroup.add(chromosphereMesh);

    // AURA LAYER 2: Translucent Plasma Corona Shell (Radius 3.05)
    const coronaGeo = new THREE.SphereGeometry(3.05, 48, 48);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff6000) },
        uVelocity: { value: 0 },
        uPulse: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uVelocity;
        uniform float uPulse;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float intensity = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 2.6);
          float glowAlpha = intensity * (0.55 + uPulse * 0.25 + uVelocity * 0.35);
          gl_FragColor = vec4(uColor, glowAlpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sphereGroup.add(coronaMesh);

    // AURA LAYER 3: Atmospheric Radiant Halo Shell (Radius 3.55)
    const haloGeo = new THREE.SphereGeometry(3.55, 40, 40);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff8811) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 3.2);
          gl_FragColor = vec4(uColor, rim * 0.42);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    sphereGroup.add(haloMesh);

    // AURA LAYER 4: Deep Celestial Exosphere Shell (Radius 4.15)
    const exosphereGeo = new THREE.SphereGeometry(4.15, 36, 36);
    const exosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xff5500) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 3.8);
          gl_FragColor = vec4(uColor, rim * 0.28);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const exosphereMesh = new THREE.Mesh(exosphereGeo, exosphereMat);
    sphereGroup.add(exosphereMesh);

    // =========================================================================
    // UI OCCLUSION CHECKER & INTERACTION CONTROLS
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2(-1000, -1000);
    let flashIntensity = 0;
    let elementsZoomSurge = 0;
    let isHoveringOrb = false;
    let orbZoomCurrent = 1.0;
    let orbZoomTarget = 1.0;

    // Drag and Drop state for background holographic wireframe shapes
    let draggedPolyhedron = null;
    let hoveredPolyhedron = null;
    const dragPlane = new THREE.Plane();
    const dragIntersect = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();
    const lastDragPointer = new THREE.Vector2();

    /**
     * Checks if the mouse cursor at (clientX, clientY) is obstructed by an actual
     * interactive/opaque UI element (modals, cards, navigation bar, buttons, dialogs, etc.).
     * Ignores full-width transparent structural containers (app-wrapper, section, hero, etc.).
     */
    function isOrbObscuredByUI(clientX, clientY) {
      const topEl = document.elementFromPoint(clientX, clientY);
      if (!topEl) return false;

      // Only block interaction if cursor is on an actual opaque UI card, button, modal, or input:
      const blockingElement = topEl.closest(
        '.modal-dialog, .modal-header, .modal-tabs-bar, .modal-body, ' +
        '.project-card, .wizard-box, .sandbox-card, .cmd-palette-box, ' +
        '.navbar, .term-window, .code-container, .playground-panel, ' +
        '.view-btn, .track-filter-btn, .stat-item, ' +
        'button, input, select, textarea, a, label'
      );

      return blockingElement !== null;
    }

    function triggerOrbClickGlow() {
      flashIntensity = 1.0;
      elementsZoomSurge = 1.0; // Temporarily zoom 3D environment in

      // Trigger full page edge radiant bloom overlay (NO SOUND)
      const pageGlow = document.getElementById('orb-page-glow');
      if (pageGlow) {
        pageGlow.classList.add('active');
        setTimeout(() => pageGlow.classList.remove('active'), 250);
      }
    }

    // --- MOUSE MOVE (Hover detection & Dragging wireframes) ---
    window.addEventListener('mousemove', (e) => {
      mouseNorm.x = (e.clientX / width) * 2 - 1;
      mouseNorm.y = -(e.clientY / height) * 2 + 1;

      // 1. If currently dragging a wireframe shape:
      if (draggedPolyhedron) {
        raycaster.setFromCamera(mouseNorm, camera);
        if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
          const newPos = dragIntersect.add(dragOffset);
          draggedPolyhedron.mesh.position.x = newPos.x;
          draggedPolyhedron.mesh.position.y = newPos.y;
          draggedPolyhedron.initY = newPos.y; // Update baseline resting Y to new position

          // Impart rotational tumble while dragging
          draggedPolyhedron.mesh.rotation.x += (mouseNorm.y - lastDragPointer.y) * 8.0;
          draggedPolyhedron.mesh.rotation.y += (mouseNorm.x - lastDragPointer.x) * 8.0;
        }
        lastDragPointer.set(mouseNorm.x, mouseNorm.y);
        canvas.style.cursor = 'grabbing';
        return;
      }

      // 2. Check UI occlusion before testing 3D scene hover:
      if (isOrbObscuredByUI(e.clientX, e.clientY)) {
        isHoveringOrb = false;
        if (hoveredPolyhedron) {
          hoveredPolyhedron.mesh.material.opacity = 0.38;
          hoveredPolyhedron.mesh.material.color.setHex(0xffaa00);
          hoveredPolyhedron = null;
        }
        canvas.style.cursor = 'default';
        return;
      }

      raycaster.setFromCamera(mouseNorm, camera);

      // 3. Test hover over floating wireframe shapes (draggable):
      const polyMeshes = polyhedraList.map(p => p.mesh);
      const polyHits = raycaster.intersectObjects(polyMeshes);

      if (polyHits.length > 0) {
        const hitMesh = polyHits[0].object;
        if (hoveredPolyhedron && hoveredPolyhedron.mesh !== hitMesh) {
          hoveredPolyhedron.mesh.material.opacity = 0.38;
          hoveredPolyhedron.mesh.material.color.setHex(0xffaa00);
        }
        hoveredPolyhedron = polyhedraList.find(p => p.mesh === hitMesh);
        if (hoveredPolyhedron) {
          hoveredPolyhedron.mesh.material.opacity = 0.90;
          hoveredPolyhedron.mesh.material.color.setHex(0xfff5dd);
        }
        canvas.style.cursor = 'grab';
        isHoveringOrb = false;
        return;
      } else if (hoveredPolyhedron) {
        hoveredPolyhedron.mesh.material.opacity = 0.38;
        hoveredPolyhedron.mesh.material.color.setHex(0xffaa00);
        hoveredPolyhedron = null;
      }

      // 4. Test hover over 3D orb:
      const orbHits = raycaster.intersectObject(outerSphereMesh);
      isHoveringOrb = orbHits.length > 0;

      if (isHoveringOrb) {
        canvas.style.cursor = orbZoomCurrent > 1.2 ? 'zoom-out' : 'zoom-in';
      } else {
        canvas.style.cursor = 'default';
      }
    });

    // --- MOUSE DOWN (Pick up wireframe shape for drag) ---
    window.addEventListener('mousedown', (e) => {
      if (isOrbObscuredByUI(e.clientX, e.clientY)) return;

      raycaster.setFromCamera(mouseNorm, camera);
      const polyMeshes = polyhedraList.map(p => p.mesh);
      const polyHits = raycaster.intersectObjects(polyMeshes);

      if (polyHits.length > 0) {
        const hitMesh = polyHits[0].object;
        draggedPolyhedron = polyhedraList.find(p => p.mesh === hitMesh);
        if (draggedPolyhedron) {
          // Construct plane perpendicular to camera passing through shape's position
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(), draggedPolyhedron.mesh.position);

          raycaster.ray.intersectPlane(dragPlane, dragIntersect);
          dragOffset.copy(draggedPolyhedron.mesh.position).sub(dragIntersect);
          lastDragPointer.set(mouseNorm.x, mouseNorm.y);

          // Highlight actively dragged shape
          draggedPolyhedron.mesh.material.opacity = 1.0;
          draggedPolyhedron.mesh.material.color.setHex(0xffffff);
          canvas.style.cursor = 'grabbing';
          sfx.playClick();
        }
      }
    });

    // --- MOUSE UP (Drop wireframe shape at new coordinates) ---
    window.addEventListener('mouseup', () => {
      if (draggedPolyhedron) {
        draggedPolyhedron.mesh.material.opacity = 0.38;
        draggedPolyhedron.mesh.material.color.setHex(0xffaa00);
        draggedPolyhedron.initY = draggedPolyhedron.mesh.position.y;
        draggedPolyhedron = null;
        canvas.style.cursor = 'default';
      }
    });

    // --- CLICK (Orb Bloom Trigger) ---
    window.addEventListener('click', (e) => {
      // Prevent click bloom if clicking on an overlapping UI element or dragging
      if (isOrbObscuredByUI(e.clientX, e.clientY) || draggedPolyhedron) return;

      raycaster.setFromCamera(mouseNorm, camera);
      const hits = raycaster.intersectObject(outerSphereMesh);
      if (hits.length > 0) {
        triggerOrbClickGlow();
      }
    });

    // --- SCROLL WHEEL (Manual zoom when hovering directly on orb) ---
    window.addEventListener('wheel', (e) => {
      if (isHoveringOrb && !isOrbObscuredByUI(e.clientX, e.clientY)) {
        e.preventDefault();
        orbZoomTarget += e.deltaY * -0.0028;
        orbZoomTarget = Math.max(1.0, Math.min(2.8, orbZoomTarget));
      }
    }, { passive: false });

    // =========================================================================
    // SECTION THRESHOLD TWEENING & AUTOMATIC ZOOM SYSTEM
    // =========================================================================
    let prevScrollY = window.scrollY;
    let scrollVelocity = 0;
    let time = 0;

    // Defined section milestones: positions & AUTOMATIC ZOOM scales
    const SECTION_ANCHORS = [
      { id: 'hero',       anchor: { x:  4.4, y:  0.8, z:  0.0, scale: 1.00 } }, // Hero: baseline scale
      { id: 'sandbox',    anchor: { x: -4.6, y:  0.2, z: -0.6, scale: 1.45 } }, // Playgrounds: zooms in prominently!
      { id: 'catalog',    anchor: { x:  4.2, y: -0.2, z: -1.0, scale: 0.88 } }, // Catalog: zooms out for reading cards!
      { id: 'wizard',     anchor: { x: -4.0, y: -0.2, z: -0.5, scale: 1.38 } }, // Decision Matrix: zooms in as advisor core!
      { id: 'quickstart', anchor: { x:  0.0, y: -0.4, z:  0.4, scale: 1.65 } }  // Quickstart/CLI: centers and zooms in!
    ];

    const currentTweenAnchor = { x: 4.4, y: 0.8, z: 0.0, scale: 1.00 };
    const screenProj = new THREE.Vector3();

    function getTargetSectionAnchor() {
      const midY = window.scrollY + window.innerHeight * 0.42;
      const sSandbox = document.getElementById('sandbox');
      const sCatalog = document.getElementById('catalog');
      const sWizard  = document.getElementById('wizard');
      const sQuick   = document.getElementById('quickstart');

      const tSandbox = sSandbox ? sSandbox.offsetTop : 800;
      const tCatalog = sCatalog ? sCatalog.offsetTop : 1900;
      const tWizard  = sWizard  ? sWizard.offsetTop  : 3700;
      const tQuick   = sQuick   ? sQuick.offsetTop   : 4500;

      if (midY < tSandbox) return SECTION_ANCHORS[0].anchor; // Hero
      if (midY < tCatalog) return SECTION_ANCHORS[1].anchor; // Sandboxes (Auto Zoom In: 1.45x)
      if (midY < tWizard)  return SECTION_ANCHORS[2].anchor; // Catalog (Auto Zoom Out: 0.88x)
      if (midY < tQuick)   return SECTION_ANCHORS[3].anchor; // Wizard (Auto Zoom In: 1.38x)
      return SECTION_ANCHORS[4].anchor;                      // Quickstart (Auto Zoom In: 1.65x)
    }

    function animate() {
      requestAnimationFrame(animate);
      time += 0.02;

      // Scroll velocity dynamics for shader reaction
      const currentScrollY = window.scrollY;
      const rawVelocity = Math.abs(currentScrollY - prevScrollY);
      scrollVelocity += (rawVelocity - scrollVelocity) * 0.15;
      prevScrollY = currentScrollY;

      // Smooth section threshold tweening & automatic zoom interpolation
      const targetAnchor = getTargetSectionAnchor();
      currentTweenAnchor.x += (targetAnchor.x - currentTweenAnchor.x) * 0.045;
      currentTweenAnchor.y += (targetAnchor.y - currentTweenAnchor.y) * 0.045;
      currentTweenAnchor.z += (targetAnchor.z - currentTweenAnchor.z) * 0.045;
      currentTweenAnchor.scale += (targetAnchor.scale - currentTweenAnchor.scale) * 0.045;

      // Subtle mouse sway
      const mouseSwayX = mouseNorm.x * 0.35;
      const mouseSwayY = mouseNorm.y * 0.25;

      // Smooth interpolation to position
      sphereGroup.position.x += ((currentTweenAnchor.x + mouseSwayX) - sphereGroup.position.x) * 0.06;
      sphereGroup.position.y += ((currentTweenAnchor.y + mouseSwayY) - sphereGroup.position.y) * 0.06;
      sphereGroup.position.z += (currentTweenAnchor.z - sphereGroup.position.z) * 0.06;

      // Smooth Orb Zoom Interpolation (Section scale combined with manual hover zoom)
      orbZoomCurrent += (orbZoomTarget - orbZoomCurrent) * 0.08;
      const finalScale = currentTweenAnchor.scale * orbZoomCurrent;
      sphereGroup.scale.set(finalScale, finalScale, finalScale);

      // Temporary Elements Zoom-in Surge decay (on click page bloom)
      elementsZoomSurge += (0 - elementsZoomSurge) * 0.075;
      const surgeOffsetZ = elementsZoomSurge * 3.8;

      // Camera Parallax & Zoom Surge
      camera.position.x += (mouseNorm.x * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (mouseNorm.y * 1.2 - camera.position.y) * 0.04;
      camera.position.z = 16 - surgeOffsetZ;
      camera.lookAt(0, 0, 0);

      // Controlled Orb Rotation Speed
      const velocitySpin = Math.min(0.005, scrollVelocity * 0.0005);
      sphereGroup.rotation.y += 0.0035 + velocitySpin;
      sphereGroup.rotation.x = Math.sin(time * 0.6) * 0.08 + mouseNorm.y * 0.15;
      sphereGroup.rotation.z = Math.cos(time * 0.5) * 0.05;

      // Counter-rotation of inner core & mantle for optical parallax
      innerCoreMesh.rotation.y -= 0.008;
      innerCoreMesh.rotation.x += 0.006;
      mantleMesh.rotation.y += 0.012;
      mantleMesh.rotation.z -= 0.009;

      // Update shader uniforms
      const pulseVal = Math.sin(time * 2.2) * 0.6 + Math.cos(time * 1.4) * 0.3;
      innerCoreMat.uniforms.uTime.value = time;
      mantleMat.uniforms.uTime.value = time;
      outerSphereMat.uniforms.uTime.value = time;
      outerSphereMat.uniforms.uPulse.value = pulseVal;
      outerSphereMat.uniforms.uVelocity.value += (Math.min(1.5, scrollVelocity * 0.15) - outerSphereMat.uniforms.uVelocity.value) * 0.1;

      // Multi-Layered Aura Shell Dynamics (Glow, Grow & Pulse)
      const pulse1 = Math.sin(time * 2.4);
      chromosphereMesh.scale.setScalar(1.0 + pulse1 * 0.05);
      chromosphereMat.uniforms.uTime.value = time;
      chromosphereMat.uniforms.uVelocity.value = outerSphereMat.uniforms.uVelocity.value;
      chromosphereMesh.rotation.y += 0.004;

      const pulse2 = Math.sin(time * 1.9 + 0.8);
      coronaMesh.scale.setScalar(1.0 + pulse2 * 0.08);
      coronaMat.uniforms.uVelocity.value = outerSphereMat.uniforms.uVelocity.value;
      coronaMat.uniforms.uPulse.value = pulse2;
      coronaMesh.rotation.y -= 0.003;

      const pulse3 = Math.cos(time * 1.5 + 1.6);
      haloMesh.scale.setScalar(1.0 + pulse3 * 0.11);
      haloMesh.rotation.z += 0.002;

      const pulse4 = Math.sin(time * 1.1 + 2.2);
      exosphereMesh.scale.setScalar(1.0 + pulse4 * 0.15);

      // Light flash intensity decay
      if (flashIntensity > 0.001) {
        flashIntensity *= 0.90;
        corePointLight.intensity = 4.5 + flashIntensity * 16.0;
        sphereAuraLight.intensity = 4.0 + flashIntensity * 14.0;
        ambientLight.intensity = 1.9 + flashIntensity * 2.5;
      } else {
        corePointLight.intensity = 4.5;
        sphereAuraLight.intensity = 4.0;
        ambientLight.intensity = 1.9;
      }

      // Starfield drift & click surge
      starField.rotation.y = time * 0.015;
      starField.rotation.x = Math.sin(time * 0.01) * 0.05;
      starField.scale.setScalar(1.0 + elementsZoomSurge * 0.16);

      // Floating polyhedra rotation & click surge (skip dragged polyhedron position overwrite)
      polyhedraGroup.scale.setScalar(1.0 + elementsZoomSurge * 0.12);
      polyhedraList.forEach(({ mesh, rotSpeed, floatSpeed, floatOffset, initY }) => {
        if (draggedPolyhedron && draggedPolyhedron.mesh === mesh) {
          return; // Allow direct user drag control
        }
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
        mesh.rotation.z += rotSpeed.z;
        mesh.position.y = initY + Math.sin(time * floatSpeed * 2.0 + floatOffset) * 0.6;
      });

      // Project coordinates to CSS variables
      screenProj.setFromMatrixPosition(sphereGroup.matrixWorld);
      screenProj.project(camera);
      const screenX = (screenProj.x * 0.5 + 0.5) * width;
      const screenY = (-screenProj.y * 0.5 + 0.5) * height;
      document.documentElement.style.setProperty('--sphere-x', `${Math.round(screenX)}px`);
      document.documentElement.style.setProperty('--sphere-y', `${Math.round(screenY)}px`);

      renderer.render(scene, camera);
    }
    animate();
  }


  // --- Toast Notification System ---
  function showToast(message, icon = '✓') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color:var(--accent-orange); font-weight:bold;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    sfx.playTone(600, 'sine', 0.05);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Curriculum Progress Management (localStorage) ---
  const ProgressManager = {
    getCompleted() {
      try {
        const stored = localStorage.getItem('synapse_completed_projects');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },
    isCompleted(id) {
      return this.getCompleted().includes(id);
    },
    toggle(id) {
      const completed = this.getCompleted();
      const idx = completed.indexOf(id);
      let isNowDone = false;
      if (idx > -1) {
        completed.splice(idx, 1);
        isNowDone = false;
      } else {
        completed.push(id);
        isNowDone = true;
      }
      localStorage.setItem('synapse_completed_projects', JSON.stringify(completed));
      this.updateUI();

      if (isNowDone) {
        sfx.playSuccess();
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#ff6b00', '#ffaa00', '#ff3800', '#ff8533']
          });
        }
        showToast(`Project #${String(id).padStart(2, '0')} marked as completed!`, '🎉');
      } else {
        sfx.playReset();
        showToast(`Project #${String(id).padStart(2, '0')} removed from completed.`);
      }
      return isNowDone;
    },
    reset() {
      localStorage.removeItem('synapse_completed_projects');
      this.updateUI();
      showToast('All progress has been reset.');
      sfx.playReset();
    },
    updateUI() {
      const completed = this.getCompleted();
      const count = completed.length;
      const total = 50;
      const pct = Math.round((count / total) * 100);

      // Top header chip
      const headerChip = document.getElementById('nav-progress-text');
      if (headerChip) {
        headerChip.textContent = `${count}/${total} Completed (${pct}%)`;
      }

      // Circular gauge in mastery dashboard
      const pctDisplay = document.getElementById('mastery-pct-num');
      const countDisplay = document.getElementById('mastery-count-num');
      const circleFill = document.getElementById('mastery-circle-fill');
      if (pctDisplay) pctDisplay.textContent = `${pct}%`;
      if (countDisplay) countDisplay.textContent = `${count} / ${total} Mastered`;
      if (circleFill) {
        const circumference = 440; // 2 * PI * r (~70)
        const offset = circumference - (pct / 100) * circumference;
        circleFill.style.strokeDashoffset = offset;
      }

      // Track progress bars
      const trackCounts = {
        'Regression': 0,
        'Classification': 0,
        'Unsupervised': 0,
        'NLP & Text': 0,
        'Vision, Recs & RL': 0
      };

      if (window.PROJECTS_DATA) {
        window.PROJECTS_DATA.forEach(p => {
          if (completed.includes(p.id)) {
            if (trackCounts[p.track] !== undefined) {
              trackCounts[p.track]++;
            }
          }
        });
      }

      for (const [track, tCount] of Object.entries(trackCounts)) {
        const bar = document.getElementById(`track-bar-${track.replace(/[^a-zA-Z]/g, '')}`);
        const label = document.getElementById(`track-lbl-${track.replace(/[^a-zA-Z]/g, '')}`);
        if (bar) bar.style.width = `${(tCount / 10) * 100}%`;
        if (label) label.textContent = `${tCount}/10`;
      }

      // Update checkboxes in cards and table
      document.querySelectorAll('.card-check-input').forEach(chk => {
        const id = parseInt(chk.dataset.id, 10);
        chk.checked = completed.includes(id);
      });
    }
  };

  // --- PLAYGROUND 1: California Housing Price Estimator (Regression) ---
  function initHousingPlayground() {
    const incomeSlider = document.getElementById('house-income');
    const ageSlider = document.getElementById('house-age');
    const roomsSlider = document.getElementById('house-rooms');
    const oceanSelect = document.getElementById('house-ocean');

    if (!incomeSlider || !ageSlider || !roomsSlider || !oceanSelect) return;

    function calculatePrice() {
      const income = parseFloat(incomeSlider.value); // in thousands
      const age = parseFloat(ageSlider.value);
      const rooms = parseFloat(roomsSlider.value);
      const ocean = oceanSelect.value;

      // Update slider text labels
      document.getElementById('lbl-house-income').textContent = `$${(income * 10).toLocaleString()}k / yr`;
      document.getElementById('lbl-house-age').textContent = `${age} years`;
      document.getElementById('lbl-house-rooms').textContent = `${rooms} rooms`;

      // OLS / Ridge approximate weights from California Housing dataset:
      // Target is in $100k
      // MedInc has largest positive weight (~0.84), HouseAge has slight positive (~0.015),
      // AveRooms (~ -0.10 due to suburban sprawl collinearity), Ocean proximity adds premium.
      const oceanMultiplier = {
        'INLAND': -0.45,
        '<1H OCEAN': 0.15,
        'NEAR BAY': 0.35,
        'ISLAND': 0.85
      }[ocean] || 0;

      let basePrice = 0.5 + (income * 0.42) + (age * 0.008) - ((rooms - 4) * 0.05) + oceanMultiplier;
      basePrice = Math.max(0.6, basePrice); // minimum floor

      const priceDollars = Math.round(basePrice * 100000);

      // Animate price ticker
      const priceElem = document.getElementById('predicted-house-price');
      if (priceElem) {
        priceElem.textContent = `$${priceDollars.toLocaleString()}`;
        priceElem.classList.remove('pulse-update');
        void priceElem.offsetWidth; // trigger reflow
        priceElem.classList.add('pulse-update');
      }

      // Tier badge
      const tierBadge = document.getElementById('house-tier-badge');
      if (tierBadge) {
        if (priceDollars < 200000) {
          tierBadge.textContent = 'Affordable District';
          tierBadge.className = 'badge-tag badge-emerald';
        } else if (priceDollars < 400000) {
          tierBadge.textContent = 'Mid-Market District';
          tierBadge.className = 'badge-tag badge-cyan';
        } else if (priceDollars < 650000) {
          tierBadge.textContent = 'Premium Coastal District';
          tierBadge.className = 'badge-tag badge-violet';
        } else {
          tierBadge.textContent = 'Luxury Bayfront Tier';
          tierBadge.className = 'badge-tag badge-amber';
        }
      }

      // Feature impact waterfall
      const incBar = document.getElementById('bar-impact-income');
      const ageBar = document.getElementById('bar-impact-age');
      const roomBar = document.getElementById('bar-impact-rooms');
      const oceanBar = document.getElementById('bar-impact-ocean');

      if (incBar) incBar.style.width = `${Math.min(100, Math.max(10, (income / 15) * 100))}%`;
      if (ageBar) ageBar.style.width = `${Math.min(100, (age / 52) * 100)}%`;
      if (roomBar) roomBar.style.width = `${Math.min(100, (rooms / 10) * 100)}%`;
      if (oceanBar) oceanBar.style.width = `${ocean === 'ISLAND' ? 100 : ocean === 'NEAR BAY' ? 75 : ocean === '<1H OCEAN' ? 50 : 20}%`;
    }

    [incomeSlider, ageSlider, roomsSlider, oceanSelect].forEach(el => {
      el.addEventListener('input', () => {
        calculatePrice();
        sfx.playClick();
      });
    });

    calculatePrice();
  }

  // --- PLAYGROUND 2: NLP Spam & Sentiment Shield (Naive Bayes) ---
  function initSpamPlayground() {
    const input = document.getElementById('nlp-input');
    const resultBadge = document.getElementById('spam-result-badge');
    const probFill = document.getElementById('spam-gauge-fill');
    const probText = document.getElementById('spam-prob-text');
    const tokensWrap = document.getElementById('salient-tokens-wrap');

    if (!input || !resultBadge) return;

    // Lexicon of high-salience spam trigger tokens
    const spamTokens = {
      'free': 3.2, 'prize': 4.1, 'urgent': 3.8, 'claim': 4.5, 'win': 3.6, 'winner': 4.2,
      'won': 3.9, 'cash': 3.4, 'guaranteed': 3.1, 'credit': 2.8, 'loan': 3.0, 'click': 2.5,
      'bank': 2.4, 'password': 3.5, 'verify': 3.3, 'compromised': 3.9, 'congratulations': 4.0,
      'gift': 3.2, 'card': 2.2, 'lottery': 4.8, 'refund': 3.1, 'wire': 3.7, 'transfer': 2.8
    };

    const hamTokens = {
      'meeting': -2.5, 'project': -2.8, 'feature': -2.2, 'code': -3.1, 'pull': -2.6,
      'request': -2.0, 'branch': -2.4, 'model': -2.9, 'lunch': -2.5, 'tomorrow': -1.8,
      'team': -2.0, 'standup': -2.7, 'release': -2.3, 'review': -2.1, 'dataset': -3.0
    };

    function analyzeText() {
      const text = input.value.toLowerCase();
      const words = text.match(/[a-z0-9]+/g) || [];

      let logOdds = -1.2; // prior toward ham
      const matchedSpam = [];
      const matchedHam = [];

      words.forEach(w => {
        if (spamTokens[w]) {
          logOdds += spamTokens[w];
          if (!matchedSpam.includes(w)) matchedSpam.push(w);
        } else if (hamTokens[w]) {
          logOdds += hamTokens[w];
          if (!matchedHam.includes(w)) matchedHam.push(w);
        }
      });

      // Sigmoid probability: P(Spam) = 1 / (1 + exp(-logOdds))
      const pSpam = 1 / (1 + Math.exp(-logOdds));
      const spamPercent = Math.min(99.9, Math.max(0.1, pSpam * 100)).toFixed(1);

      if (probFill) probFill.style.width = `${spamPercent}%`;
      if (probText) probText.textContent = `Spam Probability: ${spamPercent}%`;

      if (pSpam > 0.6) {
        resultBadge.textContent = `🚨 SPAM DETECTED (${spamPercent}%)`;
        resultBadge.className = 'badge-tag badge-rose';
        if (probFill) probFill.style.backgroundColor = 'var(--accent-rose)';
      } else if (pSpam > 0.35) {
        resultBadge.textContent = `⚠️ SUSPICIOUS CONTENT (${spamPercent}%)`;
        resultBadge.className = 'badge-tag badge-amber';
        if (probFill) probFill.style.backgroundColor = 'var(--accent-amber)';
      } else {
        resultBadge.textContent = `✓ VERIFIED LEGITIMATE (HAM ${ (100 - spamPercent).toFixed(1) }%)`;
        resultBadge.className = 'badge-tag badge-emerald';
        if (probFill) probFill.style.backgroundColor = 'var(--accent-emerald)';
      }

      // Display salient token chips
      if (tokensWrap) {
        tokensWrap.innerHTML = '';
        if (matchedSpam.length === 0 && matchedHam.length === 0) {
          tokensWrap.innerHTML = '<span style="color:#64748b; font-size:0.8rem;">No high-salience trigger keywords detected.</span>';
        } else {
          matchedSpam.forEach(token => {
            const badge = document.createElement('span');
            badge.className = 'badge-tag badge-rose';
            badge.textContent = `+ ${token} (Spam Risk)`;
            tokensWrap.appendChild(badge);
          });
          matchedHam.forEach(token => {
            const badge = document.createElement('span');
            badge.className = 'badge-tag badge-cyan';
            badge.textContent = `- ${token} (Benign)`;
            tokensWrap.appendChild(badge);
          });
        }
      }
    }

    input.addEventListener('input', analyzeText);

    // Preset chip clicks
    document.querySelectorAll('.nlp-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.text;
        analyzeText();
        sfx.playClick();
      });
    });

    analyzeText();
  }

  // --- PLAYGROUND 3: 2D Interactive Cluster & Decision Studio ---
  function initClusterPlayground() {
    const canvas = document.getElementById('cluster-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 340);

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 340;
        draw();
      }
    });

    const clusterColors = ['#ff6b00', '#ffaa00', '#ff3d00', '#ffcc00', '#ff8533'];
    let points = [];
    let centroids = [];
    let k = 3;
    let iteration = 0;

    function generatePreset(preset) {
      points = [];
      centroids = [];
      iteration = 0;

      if (preset === 'blobs') {
        const centers = [
          { x: width * 0.25, y: height * 0.35 },
          { x: width * 0.72, y: height * 0.3 },
          { x: width * 0.5, y: height * 0.75 }
        ];
        centers.forEach(c => {
          for (let i = 0; i < 35; i++) {
            points.push({
              x: c.x + (Math.random() - 0.5) * 80 + (Math.random() - 0.5) * 40,
              y: c.y + (Math.random() - 0.5) * 70 + (Math.random() - 0.5) * 40,
              cluster: -1
            });
          }
        });
      } else if (preset === 'rings') {
        for (let i = 0; i < 50; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.random() * 35;
          points.push({ x: width * 0.5 + Math.cos(theta) * r, y: height * 0.5 + Math.sin(theta) * r, cluster: -1 });
        }
        for (let i = 0; i < 70; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = 80 + Math.random() * 25;
          points.push({ x: width * 0.5 + Math.cos(theta) * r, y: height * 0.5 + Math.sin(theta) * r, cluster: -1 });
        }
      } else {
        // Random
        for (let i = 0; i < 90; i++) {
          points.push({
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            cluster: -1
          });
        }
      }

      initCentroids();
      draw();
    }

    function initCentroids() {
      centroids = [];
      iteration = 0;
      k = parseInt(document.getElementById('cluster-k-select')?.value || 3, 10);
      for (let i = 0; i < k; i++) {
        const p = points[Math.floor(Math.random() * points.length)] || { x: Math.random() * width, y: Math.random() * height };
        centroids.push({
          x: p.x + (Math.random() - 0.5) * 20,
          y: p.y + (Math.random() - 0.5) * 20,
          color: clusterColors[i % clusterColors.length]
        });
      }
    }

    function stepKMeans() {
      if (points.length === 0 || centroids.length === 0) return;

      // 1. Assign points to nearest centroid
      let totalSSE = 0;
      points.forEach(p => {
        let minDist = Infinity;
        let bestCluster = 0;
        centroids.forEach((c, idx) => {
          const dx = p.x - c.x;
          const dy = p.y - c.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < minDist) {
            minDist = d2;
            bestCluster = idx;
          }
        });
        p.cluster = bestCluster;
        totalSSE += minDist;
      });

      // 2. Recompute centroids
      const sums = centroids.map(() => ({ x: 0, y: 0, count: 0 }));
      points.forEach(p => {
        sums[p.cluster].x += p.x;
        sums[p.cluster].y += p.y;
        sums[p.cluster].count++;
      });

      centroids.forEach((c, idx) => {
        if (sums[idx].count > 0) {
          c.x = sums[idx].x / sums[idx].count;
          c.y = sums[idx].y / sums[idx].count;
        }
      });

      iteration++;
      document.getElementById('cluster-iter-count').textContent = `Iteration: ${iteration}`;
      document.getElementById('cluster-sse-val').textContent = `Inertia (SSE): ${Math.round(totalSSE).toLocaleString()}`;

      draw();
      sfx.playClick();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw points
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.cluster >= 0 ? clusterColors[p.cluster % clusterColors.length] : 'rgba(255,255,255,0.4)';
        ctx.fill();
      });

      // Draw centroids as glowing diamonds with pulsing rings
      centroids.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = c.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = c.color;
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
      });
    }

    // User can click on canvas to add points manually!
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      points.push({ x, y, cluster: -1 });
      draw();
      sfx.playTone(500, 'triangle', 0.04);
    });

    document.getElementById('btn-cluster-step')?.addEventListener('click', stepKMeans);
    document.getElementById('btn-cluster-auto')?.addEventListener('click', () => {
      for (let i = 0; i < 8; i++) {
        setTimeout(stepKMeans, i * 140);
      }
    });

    document.getElementById('cluster-k-select')?.addEventListener('change', () => {
      initCentroids();
      draw();
      sfx.playClick();
    });

    document.querySelectorAll('.cluster-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        generatePreset(btn.dataset.preset);
        sfx.playClick();
      });
    });

    generatePreset('blobs');
  }

  // --- PLAYGROUND 4: Multi-Armed Bandit Casino (Project 50) ---
  function initBanditPlayground() {
    const trueProbs = [0.25, 0.40, 0.75, 0.35]; // Arm 2 (index 2) is the optimal arm!
    const armCount = trueProbs.length;
    let Q = [0, 0, 0, 0];
    let N = [0, 0, 0, 0];
    let totalSteps = 0;
    let totalReward = 0;
    let optimalCount = 0;

    function pullArm(arm) {
      const win = Math.random() < trueProbs[arm];
      const reward = win ? 1 : 0;

      N[arm]++;
      // Incremental sample-average update: Q_new = Q_old + (1/N) * (reward - Q_old)
      Q[arm] += (1.0 / N[arm]) * (reward - Q[arm]);

      totalSteps++;
      totalReward += reward;
      if (arm === 2) optimalCount++;

      // Reel spin visual animation
      const card = document.getElementById(`bandit-arm-${arm}`);
      if (card) {
        card.classList.remove('pulled');
        void card.offsetWidth; // trigger reflow
        card.classList.add('pulled');
      }

      updateBanditUI();
      if (win) {
        sfx.playTone(880, 'triangle', 0.08);
      } else {
        sfx.playTone(220, 'sawtooth', 0.04);
      }
    }

    function updateBanditUI() {
      for (let i = 0; i < armCount; i++) {
        const qElem = document.getElementById(`bandit-q-${i}`);
        const nElem = document.getElementById(`bandit-n-${i}`);
        if (qElem) qElem.textContent = `Q: ${(Q[i] * 100).toFixed(1)}%`;
        if (nElem) nElem.textContent = `${N[i]} pulls`;
      }

      const stepsElem = document.getElementById('bandit-total-steps');
      const rewardElem = document.getElementById('bandit-total-reward');
      const winrateElem = document.getElementById('bandit-win-rate');
      const optElem = document.getElementById('bandit-optimal-ratio');

      if (stepsElem) stepsElem.textContent = totalSteps;
      if (rewardElem) rewardElem.textContent = `${totalReward} pts`;
      if (winrateElem) {
        const rate = totalSteps > 0 ? ((totalReward / totalSteps) * 100).toFixed(1) : '0.0';
        winrateElem.textContent = `${rate}%`;
      }
      if (optElem) {
        const optRate = totalSteps > 0 ? ((optimalCount / totalSteps) * 100).toFixed(1) : '0.0';
        optElem.textContent = `${optRate}% Optimal Arm (#3)`;
      }
    }

    function runAgent(steps) {
      const eps = parseFloat(document.getElementById('bandit-epsilon-select')?.value || 0.1);
      let stepCount = 0;

      const interval = setInterval(() => {
        let action = 0;
        // Epsilon-Greedy Action Selection
        if (Math.random() < eps) {
          action = Math.floor(Math.random() * armCount); // Explore
        } else {
          // Exploit: argmax Q
          let maxQ = -1;
          for (let i = 0; i < armCount; i++) {
            if (Q[i] > maxQ) {
              maxQ = Q[i];
              action = i;
            }
          }
        }
        pullArm(action);
        stepCount++;
        if (stepCount >= steps) {
          clearInterval(interval);
          sfx.playSuccess();
          showToast(`Completed ${steps} agent iterations with ε=${eps}!`);
        }
      }, 40);
    }

    for (let i = 0; i < armCount; i++) {
      document.getElementById(`btn-pull-arm-${i}`)?.addEventListener('click', () => {
        pullArm(i);
      });
    }

    document.getElementById('btn-run-agent-50')?.addEventListener('click', () => runAgent(50));
    document.getElementById('btn-run-agent-200')?.addEventListener('click', () => runAgent(200));

    document.getElementById('btn-reset-bandit')?.addEventListener('click', () => {
      Q = [0, 0, 0, 0];
      N = [0, 0, 0, 0];
      totalSteps = 0;
      totalReward = 0;
      optimalCount = 0;
      updateBanditUI();
      sfx.playClick();
      showToast('Bandit telemetry reset.');
    });

    updateBanditUI();
  }

  // --- THE 50 PROJECTS CATALOG & DIRECTORY ENGINE ---
  let activeTrack = 'all';
  let activeDifficulty = 'all';
  let activeView = 'grid'; // 'grid', 'table', 'roadmap'
  let searchQuery = '';

  function renderProjectsCatalog() {
    const data = window.PROJECTS_DATA || [];
    const gridContainer = document.getElementById('projects-grid-container');
    const tableContainer = document.getElementById('projects-table-container');
    const roadmapContainer = document.getElementById('projects-roadmap-container');
    const countBadge = document.getElementById('catalog-results-count');

    if (!gridContainer || !tableContainer || !roadmapContainer) return;

    // Filter data
    const filtered = data.filter(p => {
      // Track match
      if (activeTrack !== 'all' && p.track !== activeTrack) return false;

      // Difficulty match
      if (activeDifficulty !== 'all' && p.difficulty !== activeDifficulty) return false;

      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAlgo = p.algorithm.toLowerCase().includes(q);
        const matchDataset = p.dataset.toLowerCase().includes(q);
        const matchProblem = p.problem.toLowerCase().includes(q);
        const matchId = String(p.id).includes(q) || p.idStr.includes(q);
        if (!matchTitle && !matchAlgo && !matchDataset && !matchProblem && !matchId) return false;
      }

      return true;
    });

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} of ${data.length} Projects`;
    }

    // Toggle view containers
    gridContainer.style.display = activeView === 'grid' ? 'grid' : 'none';
    tableContainer.style.display = activeView === 'table' ? 'block' : 'none';
    roadmapContainer.style.display = activeView === 'roadmap' ? 'flex' : 'none';

    // 1. Render Grid View
    if (activeView === 'grid') {
      gridContainer.innerHTML = '';
      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; color:#64748b;">
            <p style="font-size:1.4rem; margin-bottom:8px;">No projects matched your criteria.</p>
            <p style="font-size:0.9rem;">Try clearing your search query or switching to 'All' tracks.</p>
          </div>
        `;
        return;
      }

      filtered.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card reveal-on-scroll';
        card.style.setProperty('--card-track-color', p.color);
        card.style.transitionDelay = `${(idx % 6) * 0.05}s`;

        // 3D tilt and cursor spotlight
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--card-mouse-x', `${x}px`);
          card.style.setProperty('--card-mouse-y', `${y}px`);

          const xPercent = (x / rect.width) - 0.5;
          const yPercent = (y / rect.height) - 0.5;
          card.style.transform = `perspective(1000px) rotateY(${xPercent * 7}deg) rotateX(${-yPercent * 7}deg) translateY(-6px) scale(1.01)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)';
        });

        const isDone = ProgressManager.isCompleted(p.id);

        card.innerHTML = `
          <div>
            <div class="card-top">
              <span class="card-id-pill">#${p.idStr}</span>
              <div class="card-badges">
                <span class="badge-tag" style="background:${p.color}22; color:${p.color}; border:1px solid ${p.color}44;">
                  ${p.track}
                </span>
                <span class="badge-tag ${p.difficulty === 'Beginner' ? 'badge-emerald' : 'badge-amber'}">
                  ${p.difficulty}
                </span>
              </div>
            </div>

            <h3 class="card-title">${p.title}</h3>
            <div class="card-algo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>${p.algorithm}</span>
            </div>
            <p class="card-problem">${p.problem}</p>
          </div>

          <div>
            <div class="card-meta-row">
              <div><strong>Dataset:</strong> ${p.dataset}</div>
              <div><strong>Prerequisites:</strong> ${p.prerequisites}</div>
            </div>

            <div class="card-actions">
              <label class="card-check-wrap">
                <input type="checkbox" class="card-check-input" data-id="${p.id}" ${isDone ? 'checked' : ''}>
                <span>Done</span>
              </label>

              <div style="display:flex; gap:8px;">
                <button class="card-btn-copy" data-id="${p.id}" title="Copy Runnable Code">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="card-btn-inspect" data-id="${p.id}">
                  Inspect Blueprint →
                </button>
              </div>
            </div>
          </div>
        `;
        gridContainer.appendChild(card);
      });
    }

    // 2. Render Matrix Table View
    if (activeView === 'table') {
      const tbody = document.getElementById('matrix-table-body');
      if (tbody) {
        tbody.innerHTML = '';
        filtered.forEach(p => {
          const isDone = ProgressManager.isCompleted(p.id);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family:var(--font-mono); font-weight:700; color:${p.color}">#${p.idStr}</td>
            <td style="font-weight:600; color:#fff; cursor:pointer;" class="table-row-title" data-id="${p.id}">${p.title}</td>
            <td><span class="badge-tag" style="background:${p.color}22; color:${p.color}; border:1px solid ${p.color}44;">${p.track}</span></td>
            <td style="font-family:var(--font-mono); font-size:0.8rem;">${p.algorithm}</td>
            <td><span class="badge-tag ${p.difficulty === 'Beginner' ? 'badge-emerald' : 'badge-amber'}">${p.difficulty}</span></td>
            <td style="font-size:0.8rem; color:#94a3b8;">${p.dataset}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" class="card-check-input" data-id="${p.id}" ${isDone ? 'checked' : ''}>
                <button class="card-btn-inspect" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem;">View</button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // 3. Render Roadmap View
    if (activeView === 'roadmap') {
      roadmapContainer.innerHTML = '';
      const tracks = [
        { name: 'Regression', title: 'Phase 1: Supervised Regression Foundations (Projects 01 - 10)', color: '#ff8533' },
        { name: 'Classification', title: 'Phase 2: Classification & Decision Boundaries (Projects 11 - 20)', color: '#ff5500' },
        { name: 'Unsupervised', title: 'Phase 3: Unsupervised Clustering & Anomaly Mining (Projects 21 - 30)', color: '#ffaa00' },
        { name: 'NLP & Text', title: 'Phase 4: Natural Language Processing & Computational Linguistics (Projects 31 - 40)', color: '#ff7043' },
        { name: 'Vision, Recs & RL', title: 'Phase 5: Computer Vision, Forecasting, RecSys & RL (Projects 41 - 50)', color: '#e64a19' }
      ];

      tracks.forEach(t => {
        const trackProjects = filtered.filter(p => p.track === t.name);
        if (trackProjects.length === 0) return;

        const phaseCard = document.createElement('div');
        phaseCard.className = 'roadmap-phase-card';
        phaseCard.style.setProperty('--phase-color', t.color);

        let chipsHtml = '';
        trackProjects.forEach(p => {
          const isDone = ProgressManager.isCompleted(p.id);
          chipsHtml += `
            <div class="phase-project-chip" data-id="${p.id}">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-family:var(--font-mono); color:${t.color}; font-weight:bold;">#${p.idStr}</span>
                <span style="font-size:0.85rem; color:#fff;">${p.title}</span>
              </div>
              <span style="color:${isDone ? '#10b981' : '#64748b'}; font-size:0.8rem;">${isDone ? '✓ Done' : '→'}</span>
            </div>
          `;
        });

        phaseCard.innerHTML = `
          <div class="phase-header">
            <h4 class="phase-title" style="color:${t.color};">${t.title}</h4>
            <span style="font-size:0.8rem; color:#94a3b8;">${trackProjects.length} Projects</span>
          </div>
          <div class="phase-projects-list">
            ${chipsHtml}
          </div>
        `;
        roadmapContainer.appendChild(phaseCard);
      });
    }

    // Attach event listeners for card actions
    attachCatalogListeners();

    // Observe newly rendered cards for scroll reveal
    if (scrollRevealObserver) {
      document.querySelectorAll('.project-card.reveal-on-scroll:not(.is-revealed)').forEach(el => {
        scrollRevealObserver.observe(el);
      });
    }
  }


  // ==========================================================================
  // UI & TEXT ANIMATION SYSTEMS
  // ==========================================================================

  // 1. Scroll-Triggered Reveal System (IntersectionObserver)
  let scrollRevealObserver = null;
  function initScrollReveal() {
    scrollRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      scrollRevealObserver.observe(el);
    });
  }

  // 2. Reading Scroll Progress Bar & Active Nav Links
  function initNavScrollProgress() {
    const progressBar = document.getElementById('nav-scroll-bar');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }

      // Active nav link highlight
      let currentSectionId = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 140;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${currentSectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }

  // 3. Hero Stats Animated Numerical Counter
  function initHeroStatsCounter() {
    const statNumbers = document.querySelectorAll('.hero-stats-banner .stat-number');
    if (!statNumbers.length) return;

    const targets = [
      { el: statNumbers[0], target: 50, suffix: '', duration: 1200 },
      { el: statNumbers[1], target: 5, suffix: '', duration: 1000 },
      { el: statNumbers[2], target: 15, suffix: '+', duration: 1100 },
      { el: statNumbers[3], target: 0, suffix: '', duration: 800 }
    ];

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          targets.forEach(({ el, target, suffix, duration }) => {
            if (!el) return;
            if (target === 0) {
              el.textContent = '0' + suffix;
              return;
            }
            const startTime = performance.now();
            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * target);
              el.textContent = current + suffix;
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = target + suffix;
              }
            }
            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.2 });

    const banner = document.querySelector('.hero-stats-banner');
    if (banner) observer.observe(banner);
  }

  function attachCatalogListeners() {
    // Checkboxes
    document.querySelectorAll('.card-check-input').forEach(chk => {
      chk.onchange = (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        ProgressManager.toggle(id);
      };
    });

    // Copy Code buttons
    document.querySelectorAll('.card-btn-copy').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const p = (window.PROJECTS_DATA || []).find(item => item.id === id);
        if (p && p.code) {
          navigator.clipboard.writeText(p.code);
          showToast(`Copied runnable Python code for #${p.idStr} to clipboard!`, '📋');
        }
      };
    });

    // Inspect buttons & row clicks
    document.querySelectorAll('.card-btn-inspect, .table-row-title, .phase-project-chip').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(el.dataset.id, 10);
        openBlueprintModal(id);
      };
    });
  }

  // --- PROJECT BLUEPRINT MODAL DRAWER ---
  let currentModalProjectId = 1;

  // Blueprint Markdown & Content Parsers
  function formatInlineMarkdown(str) {
    if (!str) return '';
    return str
      .replace(/`([^`]+)`/g, '<code class="code-inline" style="background:rgba(255,107,0,0.12); color:#ffbe3b; padding:2px 6px; border-radius:5px; font-family:var(--font-mono); font-size:0.86em; border:1px solid rgba(255,140,50,0.25);">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fff; font-weight:700;">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em style="color:#e2e8f0;">$1</em>');
  }

  function renderOutputsSection(outputsText) {
    if (!outputsText) return '';
    const lines = outputsText.split('\n').filter(l => l.trim().length > 0);
    let html = '<div class="diag-output-grid">';
    lines.forEach(line => {
      const match = line.match(/^[-*]\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        const [_, title, desc] = match;
        html += `
          <div class="diag-output-card">
            <div class="diag-badge">
              <span class="diag-beacon"></span>
              <span>${title}</span>
            </div>
            <div class="diag-body">${formatInlineMarkdown(desc)}</div>
          </div>
        `;
      } else {
        html += `
          <div class="diag-output-card">
            <div class="diag-body">${formatInlineMarkdown(line.replace(/^[-*]\s*/, ''))}</div>
          </div>
        `;
      }
    });
    html += '</div>';
    return html;
  }

  function renderChallengesSection(challengesText, projectId) {
    if (!challengesText) return '';
    const lines = challengesText.split('\n').filter(l => l.trim().length > 0);
    let completedChallenges = [];
    try {
      completedChallenges = JSON.parse(localStorage.getItem('synapse_completed_challenges') || '[]');
    } catch(e) {}

    let html = '<div class="challenge-task-list">';
    lines.forEach((line, idx) => {
      const cleanLine = line.replace(/^[-*]\s*\[[ xX]?\]\s*/, '').trim();
      const challengeKey = `${projectId}_${idx}`;
      const isDone = completedChallenges.includes(challengeKey);
      html += `
        <div class="challenge-task-card ${isDone ? 'completed' : ''}" data-challenge-key="${challengeKey}">
          <div class="challenge-checkbox">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="challenge-text">${formatInlineMarkdown(cleanLine)}</div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  function renderPipelineSection(stepsText) {
    if (!stepsText) return '';
    const lines = stepsText.split('\n').filter(l => l.trim().length > 0);
    let html = '<div class="pipeline-flow">';
    lines.forEach((line, idx) => {
      const match = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        const [_, num, title, desc] = match;
        const padNum = String(num).padStart(2, '0');
        html += `
          <div class="pipeline-step-node">
            <div class="pipeline-step-badge">${padNum}</div>
            <div class="pipeline-step-content">
              <div class="pipeline-step-title">${title}</div>
              <p class="pipeline-step-desc">${formatInlineMarkdown(desc)}</p>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="pipeline-step-node">
            <div class="pipeline-step-badge">${String(idx + 1).padStart(2, '0')}</div>
            <div class="pipeline-step-content">
              <p class="pipeline-step-desc">${formatInlineMarkdown(line.replace(/^\d+\.\s*/, ''))}</p>
            </div>
          </div>
        `;
      }
    });
    html += '</div>';
    return html;
  }

  function bindChallengeListeners() {
    document.querySelectorAll('.challenge-task-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.challengeKey;
        let completed = [];
        try {
          completed = JSON.parse(localStorage.getItem('synapse_completed_challenges') || '[]');
        } catch(e) {}

        const isNowDone = !card.classList.contains('completed');
        card.classList.toggle('completed', isNowDone);

        if (isNowDone) {
          if (!completed.includes(key)) completed.push(key);
          sfx.playSuccess();
          showToast('Challenge goal completed!', '✨');
        } else {
          completed = completed.filter(k => k !== key);
          sfx.playReset();
          showToast('Challenge goal reset');
        }
        localStorage.setItem('synapse_completed_challenges', JSON.stringify(completed));
      });
    });
  }

  function openBlueprintModal(id) {
    const data = window.PROJECTS_DATA || [];
    const p = data.find(item => item.id === id);
    if (!p) return;

    currentModalProjectId = id;
    const modal = document.getElementById('blueprint-modal');
    if (!modal) return;

    // Header info
    document.getElementById('modal-project-id').textContent = `#${p.idStr}`;
    document.getElementById('modal-project-title').textContent = p.title;

    const trackBadge = document.getElementById('modal-track-badge');
    if (trackBadge) {
      trackBadge.textContent = p.track;
      trackBadge.style.color = p.color;
      trackBadge.style.borderColor = `${p.color}66`;
      trackBadge.style.backgroundColor = `${p.color}15`;
    }

    const diffBadge = document.getElementById('modal-diff-badge');
    if (diffBadge) {
      diffBadge.textContent = p.difficulty;
      diffBadge.className = `badge-tag ${p.difficulty === 'Beginner' ? 'badge-emerald' : 'badge-amber'}`;
    }

    // Tab 1: Overview
    document.getElementById('modal-tab-overview').innerHTML = `
      <div class="modal-meta-grid">
        <div class="meta-spec-item">
          <span class="meta-spec-key">Category</span>
          <span class="meta-spec-val">${p.category}</span>
        </div>
        <div class="meta-spec-item">
          <span class="meta-spec-key">Key Algorithm</span>
          <span class="meta-spec-val" style="color:${p.color}; font-family:var(--font-mono);">${p.algorithm}</span>
        </div>
        <div class="meta-spec-item">
          <span class="meta-spec-key">Recommended Dataset</span>
          <span class="meta-spec-val">${p.dataset}</span>
        </div>
        <div class="meta-spec-item">
          <span class="meta-spec-key">Prerequisites</span>
          <span class="meta-spec-val">${p.prerequisites}</span>
        </div>
      </div>

      <h4 class="content-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        1. Problem Statement & Objective
      </h4>
      <div class="overview-content-card">
        ${formatInlineMarkdown(p.problem)}
      </div>

      <h4 class="content-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        2. Architectural Approach
      </h4>
      <div class="overview-content-card" style="color:#94a3b8;">
        This blueprint implements an end-to-end production scikit-learn pipeline configured specifically for standard CPU runtime environments. Features are sanitized and normalized, partitioned via stratified holdouts, fit with loss function diagnostics, and validated against generalization benchmarks.
      </div>
    `;

    // Tab 2: Math & Foundations
    document.getElementById('modal-tab-math').innerHTML = `
      <h4 class="content-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        Mathematical Intuition & Formulation
      </h4>
      <div class="math-formula-box">
        ${formatInlineMarkdown(p.theory).replace(/\n/g, '<br>')}
      </div>
    `;

    // Tab 3: Code
    const codeElem = document.getElementById('modal-code-block');
    if (codeElem) {
      codeElem.textContent = p.code;
      if (window.Prism) {
        Prism.highlightElement(codeElem);
      }
    }
    const lineCountElem = document.getElementById('modal-code-lines');
    if (lineCountElem) {
      lineCountElem.textContent = `${p.code.split('\n').length} lines`;
    }

    // Tab 4: Pipeline Steps
    document.getElementById('modal-tab-steps').innerHTML = `
      <h4 class="content-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        Implementation Pipeline
      </h4>
      ${renderPipelineSection(p.steps)}
    `;

    // Tab 5: Outputs & Challenges
    document.getElementById('modal-tab-outputs').innerHTML = `
      <h4 class="content-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        Expected Outputs & Diagnostic Interpretation
      </h4>
      ${renderOutputsSection(p.outputs)}

      <h4 class="content-section-title" style="margin-top:28px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        Extension Challenges & Production Enhancements
      </h4>
      ${renderChallengesSection(p.challenges, p.id)}
    `;

    // Bind interactive challenge checkboxes
    bindChallengeListeners();

    // Switch to Overview tab by default
    switchModalTab('overview');

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    sfx.playClick();
  }

  function closeBlueprintModal() {
    const modal = document.getElementById('blueprint-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    sfx.playClick();
  }

  function switchModalTab(tabName) {
    document.querySelectorAll('.modal-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    document.querySelectorAll('.modal-body .tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `modal-tab-${tabName}`);
    });
    sfx.playClick();
  }

  function initModalListeners() {
    const modal = document.getElementById('blueprint-modal');
    if (!modal) return;

    // Close button
    document.getElementById('btn-close-modal')?.addEventListener('click', closeBlueprintModal);

    // Backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBlueprintModal();
    });

    // Keyboard ESC & Arrows
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeBlueprintModal();
      if (e.key === 'ArrowLeft') {
        if (currentModalProjectId > 1) openBlueprintModal(currentModalProjectId - 1);
      }
      if (e.key === 'ArrowRight') {
        if (currentModalProjectId < 50) openBlueprintModal(currentModalProjectId + 1);
      }
    });

    // Prev / Next buttons
    document.getElementById('btn-modal-prev')?.addEventListener('click', () => {
      if (currentModalProjectId > 1) openBlueprintModal(currentModalProjectId - 1);
    });
    document.getElementById('btn-modal-next')?.addEventListener('click', () => {
      if (currentModalProjectId < 50) openBlueprintModal(currentModalProjectId + 1);
    });

    // Modal Tabs
    document.querySelectorAll('.modal-tab').forEach(t => {
      t.addEventListener('click', () => {
        switchModalTab(t.dataset.tab);
      });
    });

    // Copy Code button in modal
    document.getElementById('btn-modal-copy-code')?.addEventListener('click', () => {
      const p = (window.PROJECTS_DATA || []).find(item => item.id === currentModalProjectId);
      if (p && p.code) {
        navigator.clipboard.writeText(p.code);
        showToast(`Copied Python script for Project #${p.idStr}!`, '📋');
      }
    });

    // Download .py script button
    document.getElementById('btn-modal-download-code')?.addEventListener('click', () => {
      const p = (window.PROJECTS_DATA || []).find(item => item.id === currentModalProjectId);
      if (p && p.code) {
        const blob = new Blob([p.code], { type: 'text/x-python;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_${p.idStr}_${p.filename.replace('.md', '.py')}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${a.download}`);
      }
    });
  }

  // --- ALGORITHM DECISION MATRIX & ARCHITECTURAL GUIDANCE ---
  function initAlgorithmWizard() {
    let targetType = 'continuous';
    let constraint = 'interpretability';

    // Comprehensive 15-node architectural decision matrix covering all target/constraint combinations
    const recommendations = {
      // 1. Continuous (Regression)
      'continuous-interpretability': {
        id: 1,
        track: 'Regression',
        trackColor: '#ff8533',
        title: 'Ordinary Least Squares & Ridge Regression',
        estimator: 'sklearn.linear_model.Ridge',
        desc: 'Provides exact analytic coefficients beta and white-box geometric interpretability. L2 regularization penalizes extreme weight magnitudes to suppress multicollinearity without sacrificing explainability.',
        metric: 'RMSE & Adjusted R²',
        tradeoff: 'Closed-Form Analytic Solution'
      },
      'continuous-accuracy': {
        id: 8,
        track: 'Regression',
        trackColor: '#ff8533',
        title: 'Medical Insurance Cost Estimator with Gradient Boosting',
        estimator: 'sklearn.ensemble.GradientBoostingRegressor',
        desc: 'Non-parametric tree ensemble that sequentially fits weak regressors to residual gradients. Excels at capturing non-linear interactions and tabular non-monotonicities.',
        metric: 'Mean Absolute Error (MAE) & R²',
        tradeoff: 'Maximum Non-Linear Feature Capture'
      },
      'continuous-imbalance': {
        id: 5,
        track: 'Regression',
        trackColor: '#ff8533',
        title: 'Stock Trend & Volatility Regression with Robust Loss',
        estimator: 'sklearn.linear_model.HuberRegressor',
        desc: 'Applies piecewise continuous Huber loss that shifts from squared loss for small residuals to absolute loss for extreme tail anomalies, preventing market outliers from warping predictions.',
        metric: 'Median Absolute Error (MedAE)',
        tradeoff: 'Heavy-Tail Outlier Invariance'
      },

      // 2. Discrete (Classification)
      'discrete-interpretability': {
        id: 20,
        track: 'Classification',
        trackColor: '#ff5500',
        title: 'Mushroom Edibility Identification with Rule-Based Decision Trees',
        estimator: 'sklearn.tree.DecisionTreeClassifier',
        desc: 'Constructs transparent, orthogonal IF-THEN rule paths using Gini impurity or Shannon entropy splits. Crucial for clinical and regulated audits where every inference must be legally explainable.',
        metric: '0 False-Negative Safety Rate',
        tradeoff: 'White-Box Human Auditable Rules'
      },
      'discrete-accuracy': {
        id: 14,
        track: 'Classification',
        trackColor: '#ff5500',
        title: 'Heart Disease Clinical Risk Prediction with Random Forests',
        estimator: 'sklearn.ensemble.RandomForestClassifier',
        desc: 'Bagging ensemble of decorrelated decision trees with random feature subsampling. Minimizes variance over high-dimensional observations while offering calibrated probability outputs.',
        metric: 'ROC-AUC & Log-Loss Score',
        tradeoff: 'Variance Reduction via Bootstrap Bagging'
      },
      'discrete-imbalance': {
        id: 18,
        track: 'Classification',
        trackColor: '#ff5500',
        title: 'Credit Card Fraud Detection with Cost-Sensitive Loss',
        estimator: 'sklearn.ensemble.RandomForestClassifier(class_weight="balanced")',
        desc: 'Applies cost-sensitive class weighting to heavily penalize minority false-negative misses. Optimizes classification thresholds specifically along the Precision-Recall curve.',
        metric: 'Precision-Recall AUC (PR-AUC)',
        tradeoff: 'Cost-Weighted Minority Prioritization'
      },

      // 3. Unsupervised (Clustering & Anomaly)
      'unsupervised-interpretability': {
        id: 21,
        track: 'Unsupervised',
        trackColor: '#ffaa00',
        title: 'E-Commerce Customer Segmentation with K-Means',
        estimator: 'sklearn.cluster.KMeans',
        desc: 'Partitions unlabeled data into k spherical Voronoi cells minimizing within-cluster inertia. Cluster profiles can be interpreted immediately by inspecting centroid feature means.',
        metric: 'Silhouette Score & Elbow Inertia',
        tradeoff: 'Interpretable Centroid Coordinates'
      },
      'unsupervised-accuracy': {
        id: 24,
        track: 'Unsupervised',
        trackColor: '#ffaa00',
        title: 'Urban Traffic Density Hotspot Discovery with DBSCAN',
        estimator: 'sklearn.cluster.DBSCAN',
        desc: 'Density-connected spatial clustering that groups core density points and identifies arbitrary non-linear shapes without requiring predefined cluster counts k, isolating noise points.',
        metric: 'Density-Based Silhouette & Noise Ratio',
        tradeoff: 'Arbitrary Non-Convex Geometry Discovery'
      },
      'unsupervised-imbalance': {
        id: 26,
        track: 'Unsupervised',
        trackColor: '#ffaa00',
        title: 'Banking Outlier & Transaction Anomaly Isolation Forest',
        estimator: 'sklearn.ensemble.IsolationForest',
        desc: 'Exploits the geometric reality that anomalous observations require significantly fewer random partition splits to isolate than normal inliers in high-dimensional hyperplanes.',
        metric: 'Average Path Length & Anomaly Score',
        tradeoff: 'Unsupervised Subspace Isolation'
      },

      // 4. NLP & Text
      'nlp-interpretability': {
        id: 31,
        track: 'NLP & Text',
        trackColor: '#ff7043',
        title: 'SMS Spam / Ham Text Classification with Naive Bayes',
        estimator: 'sklearn.naive_bayes.MultinomialNB & TfidfVectorizer',
        desc: 'Probabilistic conditional classifier applying Bayes Theorem over sparse TF-IDF vocabulary matrices. Token weights can be audited directly through log-probability ratios.',
        metric: 'Macro F1-Score & Accuracy',
        tradeoff: 'Explicit Token Log-Likelihood Auditing'
      },
      'nlp-accuracy': {
        id: 32,
        track: 'NLP & Text',
        trackColor: '#ff7043',
        title: 'Movie Review Sentiment Analysis with Linear Support Vector Classifier',
        estimator: 'sklearn.svm.LinearSVC with Subword N-Grams',
        desc: 'Maximizes geometric margin in high-dimensional sparse TF-IDF feature space (25,000+ n-grams). Consistently achieves state-of-the-art tabular accuracy for text categorization.',
        metric: 'Balanced Accuracy & F1-Score',
        tradeoff: 'Maximum Margin Hyperplane in High Dims'
      },
      'nlp-imbalance': {
        id: 39,
        track: 'NLP & Text',
        trackColor: '#ff7043',
        title: 'Toxic Comment Flagger with Threshold Calibration',
        estimator: 'sklearn.linear_model.LogisticRegression(class_weight="balanced")',
        desc: 'Calibrates decision boundary probabilities with inverse class frequency weights, ensuring toxic edge cases are flagged even when clean messages constitute 98% of the stream.',
        metric: 'PR-AUC & Custom Cost-Weighted F-Beta',
        tradeoff: 'Skewed Text Frequency Compensation'
      },

      // 5. Reinforcement Learning & Sequential Decisions
      'rl-interpretability': {
        id: 50,
        track: 'Vision, Recs & RL',
        trackColor: '#e64a19',
        title: 'Multi-Armed Bandit A/B Testing with Epsilon-Greedy',
        estimator: 'EpsilonGreedyBandit(epsilon=0.1)',
        desc: 'Maintains running empirical reward expectations Q(a) per arm with explicit exploration factor epsilon. Decisions are completely transparent and auditable in real-time dashboards.',
        metric: 'Cumulative Regret & Arm Selection Ratio',
        tradeoff: 'Transparent Exploration-Exploitation'
      },
      'rl-accuracy': {
        id: 50,
        track: 'Vision, Recs & RL',
        trackColor: '#e64a19',
        title: 'Upper Confidence Bound (UCB1) Multi-Armed Bandit',
        estimator: 'UCB1BanditPolicy',
        desc: 'Implements "optimism in the face of uncertainty" by adding a confidence interval sqrt(2 ln t / N(a)) to estimated arm values, guaranteeing asymptotically optimal logarithmic regret.',
        metric: 'O(ln T) Logarithmic Theoretical Regret Bound',
        tradeoff: 'Provably Optimal Asymptotic Regret'
      },
      'rl-imbalance': {
        id: 50,
        track: 'Vision, Recs & RL',
        trackColor: '#e64a19',
        title: 'Bayesian Thompson Sampling Multi-Armed Bandit',
        estimator: 'ThompsonSampling(Beta(alpha, beta))',
        desc: 'Probability matching algorithm that draws samples from Beta posterior distributions per arm. Dynamically adapts to low-conversion sparse reward domains with minimal regret.',
        metric: 'Bayesian Regret & Posterior Shrinkage',
        tradeoff: 'Bayesian Posterior Probability Matching'
      }
    };

    function updateRecommendation() {
      const key = `${targetType}-${constraint}`;
      const rec = recommendations[key] || recommendations['continuous-interpretability'];

      const cardEl = document.querySelector('.wizard-result-card');
      const idEl = document.getElementById('wizard-rec-id');
      const trackEl = document.getElementById('wizard-rec-track');
      const titleEl = document.getElementById('wizard-rec-title');
      const estimatorEl = document.getElementById('wizard-rec-estimator');
      const descEl = document.getElementById('wizard-rec-desc');
      const metricEl = document.getElementById('wizard-rec-metric');
      const tradeoffEl = document.getElementById('wizard-rec-tradeoff');
      const btnEl = document.getElementById('wizard-rec-btn');

      if (idEl) idEl.textContent = `#${String(rec.id).padStart(2, '0')}`;
      if (trackEl) {
        trackEl.textContent = rec.track;
        trackEl.style.color = rec.trackColor;
        trackEl.style.borderColor = `${rec.trackColor}55`;
        trackEl.style.backgroundColor = `${rec.trackColor}18`;
      }
      if (titleEl) titleEl.textContent = rec.title;
      if (estimatorEl) estimatorEl.textContent = rec.estimator;
      if (descEl) descEl.textContent = rec.desc;
      if (metricEl) metricEl.textContent = rec.metric;
      if (tradeoffEl) tradeoffEl.textContent = rec.tradeoff;

      if (btnEl) {
        btnEl.innerHTML = `<span>Inspect Project #${String(rec.id).padStart(2, '0')} Blueprint</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        btnEl.onclick = () => openBlueprintModal(rec.id);
      }

      // Smooth pulse transition animation
      if (cardEl) {
        cardEl.classList.remove('fade-rec');
        void cardEl.offsetWidth; // trigger reflow
        cardEl.classList.add('fade-rec');
      }
    }

    document.querySelectorAll('.wizard-btn-target').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wizard-btn-target').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        targetType = btn.dataset.target;
        updateRecommendation();
        sfx.playClick();
      });
    });

    document.querySelectorAll('.wizard-btn-constraint').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wizard-btn-constraint').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        constraint = btn.dataset.constraint;
        updateRecommendation();
        sfx.playClick();
      });
    });

    updateRecommendation();
  }
  // --- COMMAND PALETTE (CTRL+K / CMD+K) ---
  function initCommandPalette() {
    const overlay = document.getElementById('cmd-palette-overlay');
    const input = document.getElementById('cmd-palette-input');
    const list = document.getElementById('cmd-results-list');
    const trigger = document.getElementById('cmd-k-btn');

    if (!overlay || !input || !list) return;

    function openPalette() {
      overlay.classList.add('active');
      input.value = '';
      renderPaletteResults('');
      input.focus();
      sfx.playClick();
    }

    function closePalette() {
      overlay.classList.remove('active');
    }

    trigger?.addEventListener('click', openPalette);

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('active')) closePalette();
        else openPalette();
      }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const mainSearch = document.getElementById('catalog-search-input');
        mainSearch?.focus();
      }
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closePalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });

    function renderPaletteResults(query) {
      const data = window.PROJECTS_DATA || [];
      const q = query.toLowerCase().trim();
      const results = q
        ? data.filter(p => p.title.toLowerCase().includes(q) || p.algorithm.toLowerCase().includes(q) || p.idStr.includes(q))
        : data.slice(0, 10);

      list.innerHTML = '';
      if (results.length === 0) {
        list.innerHTML = `<li style="padding:16px 20px; color:#64748b; font-size:0.9rem;">No matching blueprints found.</li>`;
        return;
      }

      results.forEach(p => {
        const li = document.createElement('li');
        li.className = 'cmd-result-item';
        li.innerHTML = `
          <div class="cmd-result-left">
            <span class="cmd-result-id">#${p.idStr}</span>
            <span class="cmd-result-title">${p.title}</span>
          </div>
          <span class="badge-tag" style="background:${p.color}22; color:${p.color}; font-size:0.7rem;">${p.track}</span>
        `;
        li.addEventListener('click', () => {
          closePalette();
          openBlueprintModal(p.id);
        });
        list.appendChild(li);
      });
    }

    input.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });
  }

  // --- CONTROLS, FILTERS & MAIN INITIALIZATION ---
  function initCatalogControls() {
    // Search input
    const searchInput = document.getElementById('catalog-search-input');
    const searchClear = document.getElementById('catalog-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
        renderProjectsCatalog();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        renderProjectsCatalog();
        sfx.playClick();
      });
    }

    // Track Filter buttons
    document.querySelectorAll('.track-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.track-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTrack = btn.dataset.track;
        renderProjectsCatalog();
        sfx.playClick();
      });
    });

    // Difficulty filter
    const diffSelect = document.getElementById('catalog-diff-select');
    if (diffSelect) {
      diffSelect.addEventListener('change', (e) => {
        activeDifficulty = e.target.value;
        renderProjectsCatalog();
        sfx.playClick();
      });
    }

    // View mode toggles
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeView = btn.dataset.view;
        renderProjectsCatalog();
        sfx.playClick();
      });
    });

    // Reset progress button
    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your curriculum progress?')) {
        ProgressManager.reset();
      }
    });

    // Mark all done button
    document.getElementById('btn-mark-all-done')?.addEventListener('click', () => {
      const allIds = (window.PROJECTS_DATA || []).map(p => p.id);
      localStorage.setItem('synapse_completed_projects', JSON.stringify(allIds));
      ProgressManager.updateUI();
      renderProjectsCatalog();
      sfx.playSuccess();
      showToast('All 50 projects marked as mastered!', '🏆');
    });

    // Audio toggle button in header
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isNowOn = sfx.toggle();
        audioBtn.classList.toggle('muted', !isNowOn);
        showToast(isNowOn ? 'UI Audio synthesis enabled' : 'UI Audio muted');
      });
      audioBtn.classList.toggle('muted', !sfx.enabled);
    }

    // Playground tabs switching
    document.querySelectorAll('.playground-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.playground-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.playground-panel').forEach(p => {
          p.classList.toggle('active', p.id === `playground-${tabId}`);
        });
        sfx.playClick();
      });
    });
  }

  // --- INITIAL BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', () => {
    initInteractiveOrangeSphere();
    initHousingPlayground();
    initSpamPlayground();
    initClusterPlayground();
    initBanditPlayground();
    initCatalogControls();
    initModalListeners();
    initAlgorithmWizard();
    initCommandPalette();

    initScrollReveal();
    initNavScrollProgress();
    initHeroStatsCounter();

    renderProjectsCatalog();
    ProgressManager.updateUI();
  });

})();
