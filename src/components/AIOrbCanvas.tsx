import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type AIOrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AIOrbCanvasProps {
  state?: AIOrbState;
  audioLevel?: number; // 0 to 1
  className?: string;
  size?: number;
}

export const AIOrbCanvas: React.FC<AIOrbCanvasProps> = ({
  state = 'idle',
  audioLevel = 0,
  className = '',
  size = 280
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Group for whole floating orb
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 1.5);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xff99cc, 1.8);
    backLight.position.set(0, 3, -3);
    scene.add(backLight);

    // --- 1. Outer Glass Sphere with Custom Glassmorphism & Chromatic Aberration Shader ---
    const glassVertexShader = `
      uniform float uTime;
      uniform float uWobble;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Organic liquid wobble & subtle breathing
        vec3 pos = position;
        float wobble1 = sin(pos.y * 2.8 + uTime * 1.5) * cos(pos.x * 2.2 + uTime * 1.2) * 0.035;
        float wobble2 = sin(pos.z * 3.2 + uTime * 1.8) * 0.02;
        pos += normal * (wobble1 + wobble2) * uWobble;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = viewMatrix * worldPos;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const glassFragmentShader = `
      uniform float uTime;
      uniform float uActivity;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel calculation for edge reflection & refraction
        float NdotV = max(dot(normal, viewDir), 0.0);
        float fresnel = pow(1.0 - NdotV, 2.8);
        float innerFresnel = pow(1.0 - NdotV, 1.2);

        // Subtle chromatic aberration on rim: iridescent shifts between lavender, ice blue, and soft pink
        vec3 edgeColorR = vec3(0.98, 0.70, 0.88); // Soft pink
        vec3 edgeColorG = vec3(0.70, 0.90, 1.0);  // Cyan/ice blue
        vec3 edgeColorB = vec3(0.85, 0.75, 1.0);  // Lavender

        float dispR = pow(1.0 - NdotV * 0.95, 3.0);
        float dispG = pow(1.0 - NdotV * 1.0, 3.0);
        float dispB = pow(1.0 - NdotV * 1.05, 3.0);

        vec3 chromaticRim = vec3(
          edgeColorR.r * dispR,
          edgeColorG.g * dispG,
          edgeColorB.b * dispB
        ) * 1.4;

        // Specular glint for realistic glass shine
        vec3 lightDir = normalize(vec3(0.5, 1.2, 0.8));
        vec3 halfVector = normalize(lightDir + viewDir);
        float NdotH = max(dot(normal, halfVector), 0.0);
        float specular = pow(NdotH, 45.0) * 1.2;
        float specular2 = pow(max(dot(normal, normalize(vec3(-0.6, 0.8, -0.4) + viewDir)), 0.0), 30.0) * 0.4;

        // Base glass color: pristine semi-transparent white/crystal with subtle lavender core
        vec3 glassBase = vec3(0.96, 0.96, 1.0);
        vec3 coreShine = vec3(0.92, 0.90, 0.98) * (0.08 + uActivity * 0.05);

        // Upper conical reflection highlight (seen in reference image)
        float topSheen = smoothstep(0.2, 0.9, vNormal.y) * smoothstep(-0.2, 0.6, vNormal.z) * 0.35;

        vec3 finalColor = glassBase * (innerFresnel * 0.15 + topSheen) + chromaticRim + (specular + specular2) * vec3(1.0) + coreShine;
        float alpha = clamp(0.12 + fresnel * 0.75 + specular * 0.8 + topSheen * 0.5, 0.0, 0.95);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const glassUniforms = {
      uTime: { value: 0 },
      uWobble: { value: 1.0 },
      uActivity: { value: 0 }
    };

    const glassGeometry = new THREE.SphereGeometry(1.6, 96, 96);
    const glassMaterial = new THREE.ShaderMaterial({
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      uniforms: glassUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.FrontSide
    });

    const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
    orbGroup.add(glassSphere);

    // --- 2. Upper Internal Refractive Cone / Highlight Sheen (Exact image match) ---
    const coneGeo = new THREE.ConeGeometry(1.2, 1.4, 48, 1, true);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, 0.6, 0.2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.scale.set(0.9, 0.8, 0.9);
    orbGroup.add(coneMesh);

    // --- 3. Internal Glowing Sinusoidal Wave Ribbons (Cyan & Magenta crossing waves) ---
    const WAVE_POINTS = 120;
    const waveRadius = 1.35; // fits inside 1.6 sphere

    // Curve functions
    const createWavePoints = (
      time: number,
      freq: number,
      speed: number,
      amp: number,
      phase: number,
      tiltZ: number
    ) => {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= WAVE_POINTS; i++) {
        const t = (i / WAVE_POINTS) * 2 - 1; // -1 to 1
        const x = t * waveRadius * 0.96;
        
        // Window function to taper cleanly at edges inside the sphere
        const windowFactor = Math.cos((t * Math.PI) / 2);
        const y = Math.sin(t * freq * Math.PI + time * speed + phase) * amp * windowFactor;
        const z = Math.cos(t * freq * 0.8 + time * speed * 0.7 + phase) * tiltZ * windowFactor;
        points.push(new THREE.Vector3(x, y, z));
      }
      return points;
    };

    // Tube mesh for Wave 1 (Neon Cyan / Blue)
    const curve1 = new THREE.CatmullRomCurve3(createWavePoints(0, 2.4, 2.0, 0.25, 0, 0.3));
    const tubeGeo1 = new THREE.TubeGeometry(curve1, 90, 0.038, 12, false);
    
    // Wave 1 Custom Glow Shader
    const waveShaderMat1 = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(0x00f5d4) }, // Neon cyan / turquoise
        uColorB: { value: new THREE.Color(0x0099ff) }, // Vivid electric blue
        uIntensity: { value: 2.2 },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vec3 col = mix(uColorA, uColorB, sin(vUv.x * 3.1415 + vUv.y) * 0.5 + 0.5);
          float glow = pow(abs(vNormal.z), 1.2) * 0.5 + 0.7;
          gl_FragColor = vec4(col * uIntensity * glow, 0.92);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const waveMesh1 = new THREE.Mesh(tubeGeo1, waveShaderMat1);
    orbGroup.add(waveMesh1);

    // Tube mesh for Wave 2 (Neon Pink / Coral Magenta)
    const curve2 = new THREE.CatmullRomCurve3(createWavePoints(0, 2.2, -1.8, 0.26, Math.PI * 0.7, -0.3));
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 90, 0.038, 12, false);
    
    const waveShaderMat2 = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(0xff3377) }, // Neon Magenta / Pink
        uColorB: { value: new THREE.Color(0xff7755) }, // Neon Coral
        uIntensity: { value: 2.2 },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vec3 col = mix(uColorA, uColorB, sin(vUv.x * 3.1415 + vUv.y) * 0.5 + 0.5);
          float glow = pow(abs(vNormal.z), 1.2) * 0.5 + 0.7;
          gl_FragColor = vec4(col * uIntensity * glow, 0.92);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const waveMesh2 = new THREE.Mesh(tubeGeo2, waveShaderMat2);
    orbGroup.add(waveMesh2);

    // --- 4. Internal Ambient Glow Core ---
    const coreGeo = new THREE.SphereGeometry(1.1, 32, 32);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActivity: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uActivity;
        varying vec3 vNormal;
        void main() {
          float rim = pow(1.0 - abs(vNormal.z), 2.0);
          vec3 glowColor = mix(vec3(0.5, 0.7, 1.0), vec3(0.9, 0.6, 0.9), sin(uTime * 0.8) * 0.5 + 0.5);
          gl_FragColor = vec4(glowColor, rim * (0.12 + uActivity * 0.18));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);

    // --- Animation Loop Variables ---
    let reqId: number;
    let clock = new THREE.Clock();
    let currentAmplitude = 0.24;
    let currentSpeed = 1.6;
    let currentWobble = 1.0;
    let currentGlow = 2.0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;

      // Target params based on state & audio reactivity
      let targetAmp = 0.24;
      let targetSpeed = 1.8;
      let targetWobble = 0.8;
      let targetGlow = 2.0;
      let targetActivity = 0.0;

      if (currentState === 'listening') {
        targetAmp = 0.28 + currentAudio * 0.55;
        targetSpeed = 2.8 + currentAudio * 2.0;
        targetWobble = 1.2 + currentAudio * 1.5;
        targetGlow = 2.6 + currentAudio * 1.8;
        targetActivity = 0.6 + currentAudio * 0.4;
      } else if (currentState === 'thinking') {
        targetAmp = 0.42;
        targetSpeed = 4.2;
        targetWobble = 1.4;
        targetGlow = 3.2;
        targetActivity = 0.9;
      } else if (currentState === 'speaking') {
        const speechPulse = Math.sin(time * 8.0) * 0.5 + 0.5;
        targetAmp = 0.35 + speechPulse * 0.25;
        targetSpeed = 3.2;
        targetWobble = 1.1;
        targetGlow = 2.8 + speechPulse * 0.8;
        targetActivity = 0.7;
      } else {
        // Idle
        targetAmp = 0.22 + Math.sin(time * 1.5) * 0.04;
        targetSpeed = 1.6;
        targetWobble = 0.7;
        targetGlow = 2.0;
        targetActivity = 0.0;
      }

      // Smooth interpolation (LERP)
      currentAmplitude += (targetAmp - currentAmplitude) * (delta * 6);
      currentSpeed += (targetSpeed - currentSpeed) * (delta * 6);
      currentWobble += (targetWobble - currentWobble) * (delta * 5);
      currentGlow += (targetGlow - currentGlow) * (delta * 6);

      // Smooth floating motion (up & down) and organic tilt
      orbGroup.position.y = Math.sin(time * 1.4) * 0.12;
      orbGroup.rotation.y = Math.sin(time * 0.4) * 0.1;
      orbGroup.rotation.x = Math.cos(time * 0.5) * 0.05;

      // Update Outer Glass Shader Uniforms
      glassUniforms.uTime.value = time;
      glassUniforms.uWobble.value = currentWobble;
      glassUniforms.uActivity.value = targetActivity;

      // Update Wave 1 (Cyan/Blue)
      const pts1 = createWavePoints(
        time,
        2.4,
        currentSpeed,
        currentAmplitude,
        0,
        0.28
      );
      const newCurve1 = new THREE.CatmullRomCurve3(pts1);
      waveMesh1.geometry.dispose();
      waveMesh1.geometry = new THREE.TubeGeometry(newCurve1, 90, 0.038, 12, false);
      waveShaderMat1.uniforms.uIntensity.value = currentGlow;
      waveShaderMat1.uniforms.uTime.value = time;

      // Update Wave 2 (Pink/Magenta)
      const pts2 = createWavePoints(
        time,
        2.2,
        -currentSpeed * 0.95,
        currentAmplitude * 1.05,
        Math.PI * 0.75,
        -0.28
      );
      const newCurve2 = new THREE.CatmullRomCurve3(pts2);
      waveMesh2.geometry.dispose();
      waveMesh2.geometry = new THREE.TubeGeometry(newCurve2, 90, 0.038, 12, false);
      waveShaderMat2.uniforms.uIntensity.value = currentGlow;
      waveShaderMat2.uniforms.uTime.value = time;

      // Update Core
      coreMat.uniforms.uTime.value = time;
      coreMat.uniforms.uActivity.value = targetActivity;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      glassGeometry.dispose();
      glassMaterial.dispose();
      coneGeo.dispose();
      coneMat.dispose();
      tubeGeo1.dispose();
      waveShaderMat1.dispose();
      tubeGeo2.dispose();
      waveShaderMat2.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
