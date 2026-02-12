/**
 * Adscalify - Hero Particle Background
 * Faithful recreation of the Three.js WebGL flowing particle cloud/blob effect.
 * Uses 3D particle plane with periodic noise displacement, perspective projection,
 * depth-of-field blur, sparkle, and vignette — all in 2D Canvas.
 */
(function () {
  'use strict';

  var container = document.getElementById('heroParticles');
  if (!container) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  container.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var width, height;
  var animationId;
  var startTime = Date.now();

  // ─── Configuration (matches original Three.js Leva controls) ───
  var CONFIG = {
    gridSize: 250,         // 455x455 = 207,025 particles (~10x the previous 144x144)
    planeScale: 10.0,      // World-space plane extent
    noiseScale: 0.6,       // Noise frequency
    noiseIntensity: 0.52,  // Noise displacement strength
    timeScale: 1.0,        // Animation speed
    loopPeriod: 24.0,      // Seconds for full loop
    // Camera (from original)
    camX: 1.26,
    camY: 2.66,
    camZ: -1.82,
    fov: 50,
    // Depth of field
    focus: 3.8,
    aperture: 1.79,
    pointSize: 10.0,
    opacity: 0.8,
    // Vignette
    vignetteDarkness: 1.5,
    vignetteOffset: 0.4,
    // Reveal animation
    revealDuration: 3.5     // seconds
  };

  // ─── Periodic noise (ported from GLSL) ───
  function periodicNoise(px, py, pz, time) {
    var noise = 0.0;
    noise += Math.sin(px * 2.0 + time) * Math.cos(pz * 1.5 + time);
    noise += Math.sin(px * 3.2 + time * 2.0) * Math.cos(pz * 2.1 + time) * 0.6;
    noise += Math.sin(px * 1.7 + time) * Math.cos(pz * 2.8 + time * 3.0) * 0.4;
    noise += Math.sin(px * pz * 0.5 + time * 2.0) * 0.3;
    return noise * 0.3;
  }

  // ─── Sparkle noise (ported from fragment shader) ───
  function sparkleNoise(sx, sy, sz, time) {
    var hash = Math.sin(sx * 127.1 + sy * 311.7 + sz * 74.7) * 43758.5453;
    hash = hash - Math.floor(hash);
    var slowTime = time * 1.0;
    var sparkle = 0.0;
    sparkle += Math.sin(slowTime + hash * 6.28318) * 0.5;
    sparkle += Math.sin(slowTime * 1.7 + hash * 12.56636) * 0.3;
    sparkle += Math.sin(slowTime * 0.8 + hash * 18.84954) * 0.2;
    var hash2 = Math.sin(sx * 113.5 + sy * 271.9 + sz * 97.3) * 37849.3241;
    hash2 = hash2 - Math.floor(hash2);
    var sparkleMask = Math.sin(hash2 * 6.28318) * 0.7 + Math.sin(hash2 * 12.56636) * 0.3;
    if (sparkleMask < 0.3) sparkle *= 0.05;
    var ns = (sparkle + 1.0) * 0.5;
    var sc = Math.pow(ns, 4.0);
    var bf = ns * ns;
    var fb = ns + (sc - ns) * bf;
    return 0.7 + fb * 1.3;
  }

  // ─── Particle data ───
  var particleCount;
  var initialX, initialY, initialZ; // original grid positions
  var posX, posY, posZ;             // displaced world positions

  function initParticles() {
    var gs = CONFIG.gridSize;
    var scale = CONFIG.planeScale;
    particleCount = gs * gs;
    initialX = new Float32Array(particleCount);
    initialY = new Float32Array(particleCount);
    initialZ = new Float32Array(particleCount);
    posX = new Float32Array(particleCount);
    posY = new Float32Array(particleCount);
    posZ = new Float32Array(particleCount);

    for (var i = 0; i < particleCount; i++) {
      var gx = (i % gs) / (gs - 1);
      var gz = Math.floor(i / gs) / (gs - 1);
      initialX[i] = (gx - 0.5) * 2.0 * scale;
      initialY[i] = 0.0;
      initialZ[i] = (gz - 0.5) * 2.0 * scale;
    }
  }

  // ─── Simulation step (ported from SimulationMaterial fragment shader) ───
  function simulate(time) {
    var ns = CONFIG.noiseScale;
    var ni = CONFIG.noiseIntensity;
    var ct = time * CONFIG.timeScale * (6.28318530718 / CONFIG.loopPeriod);

    for (var i = 0; i < particleCount; i++) {
      var ox = initialX[i];
      var oy = initialY[i];
      var oz = initialZ[i];

      var nx = ox * ns;
      var ny = oy * ns;
      var nz = oz * ns;

      var dx = periodicNoise(nx, ny, nz, ct) * ni;
      var dy = periodicNoise(nx + 50.0, ny, nz, ct + 2.094) * ni;
      var dz = periodicNoise(nx, ny + 50.0, nz, ct + 4.188) * ni;

      posX[i] = ox + dx;
      posY[i] = oy + dy;
      posZ[i] = oz + dz;
    }
  }

  // ─── Vignette overlay ───
  var vignetteCanvas = null;
  function createVignette() {
    vignetteCanvas = document.createElement('canvas');
    vignetteCanvas.width = width;
    vignetteCanvas.height = height;
    var vctx = vignetteCanvas.getContext('2d');
    var cx = width * 0.5, cy = height * 0.5;
    var maxR = Math.sqrt(cx * cx + cy * cy);
    var grad = vctx.createRadialGradient(cx, cy, maxR * CONFIG.vignetteOffset, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,' + Math.min(CONFIG.vignetteDarkness * 0.6, 1.0) + ')');
    vctx.fillStyle = grad;
    vctx.fillRect(0, 0, width, height);
  }

  // ─── Resize ───
  function resize() {
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
    createVignette();
  }

  // ─── Cached soft-circle gradient ───
  var glowCanvas, glowSize;
  function createGlowTexture() {
    glowSize = 64;
    glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowSize;
    glowCanvas.height = glowSize;
    var gc = glowCanvas.getContext('2d');
    var half = glowSize / 2;
    var grad = gc.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    gc.fillStyle = grad;
    gc.fillRect(0, 0, glowSize, glowSize);
  }

  // ─── Precomputed camera basis ───
  var camBasis = {};
  function computeCameraBasis() {
    var fx = -CONFIG.camX, fy = -CONFIG.camY, fz = -CONFIG.camZ;
    var fl = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= fl; fy /= fl; fz /= fl;
    // right = normalize(cross(forward, up(0,1,0))) = normalize(-fz, 0, fx)
    var rx = -fz, ry = 0, rz = fx;
    var rl = Math.sqrt(rx * rx + rz * rz);
    rx /= rl; rz /= rl;
    // up = cross(right, forward)
    var ux = ry * fz - rz * fy;
    var uy = rz * fx - rx * fz;
    var uz = rx * fy - ry * fx;
    camBasis = { fx: fx, fy: fy, fz: fz, rx: rx, ry: ry, rz: rz, ux: ux, uy: uy, uz: uz };
    camBasis.pf = 1.0 / Math.tan((CONFIG.fov * Math.PI / 180) * 0.5);
  }

  // ─── Projected data arrays ───
  var projSX, projSY, projDepth, projAlpha, projRadius;

  function ensureProjectionArrays() {
    if (!projSX || projSX.length !== particleCount) {
      projSX = new Float32Array(particleCount);
      projSY = new Float32Array(particleCount);
      projDepth = new Float32Array(particleCount);
      projAlpha = new Float32Array(particleCount);
      projRadius = new Float32Array(particleCount);
    }
  }

  // ─── Main render loop ───
  function draw() {
    var elapsed = (Date.now() - startTime) * 0.001;

    // Reveal animation (cubic ease-out over 3.5s)
    var revealT = Math.min(elapsed / CONFIG.revealDuration, 1.0);
    var revealEase = 1.0 - Math.pow(1.0 - revealT, 3.0);
    var revealRadius = revealEase * CONFIG.planeScale * 1.5;
    var revealOpacity = revealEase;

    // Simulate noise displacement
    simulate(elapsed);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    ensureProjectionArrays();
    computeCameraBasis();

    var cb = camBasis;
    var aspect = width / height;
    var halfW = width * 0.5;
    var halfH = height * 0.5;
    var visCount = 0;

    // Project all particles in one pass
    for (var i = 0; i < particleCount; i++) {
      // Eye-space
      var ex = posX[i] - CONFIG.camX;
      var ey = posY[i] - CONFIG.camY;
      var ez = posZ[i] - CONFIG.camZ;

      var vz = ex * cb.fx + ey * cb.fy + ez * cb.fz;
      if (vz <= 0.1) continue;

      var vx = ex * cb.rx + ey * cb.ry + ez * cb.rz;
      var vy = ex * cb.ux + ey * cb.uy + ez * cb.uz;

      var sx = (vx * cb.pf / (aspect * vz)) * halfW + halfW;
      var sy = (-vy * cb.pf / vz) * halfH + halfH;

      // Frustum cull with generous margin
      if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100) continue;

      // Depth-of-field
      var dofDist = Math.abs(CONFIG.focus - vz);
      var pointRadius = Math.max(dofDist * CONFIG.aperture * CONFIG.pointSize * 0.15, 1.5);
      if (pointRadius > 50) pointRadius = 50;

      // Base alpha from DoF
      var baseAlpha = (1.04 - Math.min(dofDist, 1.0)) * CONFIG.opacity;

      // Y-based fade (smoothstep -0.5 to 0.25)
      var py = posY[i];
      var yFade = py < -0.5 ? 0.0 : py > 0.25 ? 1.0 : (py + 0.5) / 0.75;
      yFade = yFade * yFade * (3.0 - 2.0 * yFade);

      // Reveal mask
      var distCenter = Math.sqrt(initialX[i] * initialX[i] + initialZ[i] * initialZ[i]);
      var revealNoiseVal = periodicNoise(initialX[i] * 4.0, 0, initialZ[i] * 4.0, 0) * 0.3;
      var revealThresh = revealRadius + revealNoiseVal;
      var revealMask;
      if (distCenter > revealThresh + 0.1) revealMask = 0.0;
      else if (distCenter < revealThresh - 0.2) revealMask = 1.0;
      else revealMask = 1.0 - (distCenter - (revealThresh - 0.2)) / 0.3;

      // Sparkle
      var sparkle = sparkleNoise(initialX[i], initialY[i], initialZ[i], elapsed);

      // Final alpha
      var alpha = baseAlpha * yFade * revealMask * revealOpacity * sparkle;
      if (alpha < 0.003) continue;
      if (alpha > 1.0) alpha = 1.0;

      // Store for drawing
      projSX[visCount] = sx;
      projSY[visCount] = sy;
      projRadius[visCount] = pointRadius;
      projAlpha[visCount] = alpha;
      visCount++;
    }

    // Draw with additive blending (order-independent, no sorting needed)
    ctx.globalCompositeOperation = 'lighter';

    for (var d = 0; d < visCount; d++) {
      ctx.globalAlpha = projAlpha[d];
      var r = projRadius[d];
      ctx.drawImage(glowCanvas, projSX[d] - r, projSY[d] - r, r * 2, r * 2);
    }

    // Reset compositing
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    // Vignette overlay
    if (vignetteCanvas) {
      ctx.drawImage(vignetteCanvas, 0, 0);
    }

    animationId = requestAnimationFrame(draw);
  }

  // ─── Init ───
  function init() {
    resize();
    createGlowTexture();
    initParticles();
    draw();
  }

  // Throttled resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
