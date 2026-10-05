(() => {
  const config = window.SUPERDOLLOP_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- CTA target ----------
  const cta = document.getElementById("cta");
  cta.href = config.apiUrl || "#";

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Pointer state ----------
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const cursor = document.querySelector(".cursor");
  const coords = document.getElementById("coords");

  window.addEventListener("pointermove", (e) => {
    pointer.tx = e.clientX / window.innerWidth;
    pointer.ty = e.clientY / window.innerHeight;
    if (cursor) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    if (coords) {
      const ra = pointer.tx * 24;
      const dec = (0.5 - pointer.ty) * 180;
      const h = Math.floor(ra);
      const m = Math.floor((ra - h) * 60);
      const d = Math.trunc(dec);
      const dm = Math.floor(Math.abs(dec - d) * 60);
      coords.textContent =
        `RA ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m · ` +
        `DEC ${dec >= 0 ? "+" : "−"}${String(Math.abs(d)).padStart(2, "0")}° ${String(dm).padStart(2, "0")}′`;
    }
  });

  // ---------- Magnetic CTA ----------
  cta.addEventListener("pointermove", (e) => {
    const r = cta.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    cta.style.setProperty("--mx", `${x}px`);
    cta.style.setProperty("--my", `${y}px`);
    if (!reduceMotion) {
      cta.style.transform = `translate(${(x - r.width / 2) * 0.25}px, ${(y - r.height / 2) * 0.35}px)`;
    }
  });
  cta.addEventListener("pointerleave", () => {
    cta.style.transform = "";
  });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ---------- WebGL cosmos ----------
  const canvas = document.getElementById("cosmos");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return; // CSS gradient fallback stays visible

  const vert = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }
  `;

  const frag = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScroll;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
                 mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p = r * p * 2.02 + 3.1;
        a *= 0.5;
      }
      return v;
    }

    vec3 palette(float t) {
      // gold -> magenta -> violet -> cyan
      vec3 a = vec3(0.55, 0.35, 0.65);
      vec3 b = vec3(0.45, 0.40, 0.40);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.00, 0.25, 0.55);
      return a + b * cos(6.28318 * (c * t + d));
    }

    float stars(vec2 uv, float scale, float t) {
      vec2 g = uv * scale;
      vec2 id = floor(g);
      vec2 f = fract(g) - 0.5;
      float h = hash(id);
      if (h < 0.92) return 0.0;
      vec2 o = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
      float d = length(f - o * 0.7);
      float tw = 0.6 + 0.4 * sin(t * (1.0 + h * 4.0) + h * 40.0);
      return smoothstep(0.06, 0.0, d) * tw * (h - 0.92) * 14.0;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, -1.0);
      float t = uTime * 0.04;

      vec2 p = uv * 1.6 + m * 0.25 + vec2(0.0, uScroll * 0.6);

      // domain-warped nebula
      vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.5),
                    fbm(p + 3.5 * q + vec2(8.3, 2.8) - t));
      float n = fbm(p + 3.0 * r);

      vec3 col = palette(n * 1.2 + length(q) * 0.6 + t * 2.0 + uScroll * 0.15);
      float density = smoothstep(0.42, 1.15, n * n * 2.2 + length(r) * 0.35);
      col *= density * 1.25;

      // luminous core near cursor
      float glow = exp(-length(uv - m) * 2.6);
      col += vec3(1.0, 0.35, 0.85) * glow * 0.35 * density;

      // vignette into the void
      float vig = smoothstep(1.6, 0.2, length(uv * vec2(0.85, 1.1)));
      vec3 void_ = vec3(0.027, 0.008, 0.10);
      col = mix(void_, col + void_, vig);

      // star layers with parallax
      float s = 0.0;
      s += stars(uv + m * 0.02 + vec2(0.0, uScroll * 0.2), 60.0, uTime);
      s += stars(uv + m * 0.05 + vec2(0.0, uScroll * 0.4), 30.0, uTime * 1.3) * 1.2;
      s += stars(uv + m * 0.09 + vec2(0.0, uScroll * 0.7), 14.0, uTime * 0.8) * 1.6;
      col += vec3(0.9, 0.95, 1.0) * s;

      // filmic tone
      col = 1.0 - exp(-col * 1.4);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMouse = gl.getUniformLocation(prog, "uMouse");
  const uScroll = gl.getUniformLocation(prog, "uScroll");

  // Render below native resolution — the nebula is soft, and this keeps it cheap.
  const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;

  function resize() {
    canvas.width = Math.floor(window.innerWidth * scale);
    canvas.height = Math.floor(window.innerHeight * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  const start = performance.now();
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  function frame(now) {
    if (!running) return;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    const t = reduceMotion ? 20 : (now - start) / 1000;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, pointer.x, pointer.y);
    gl.uniform1f(uScroll, window.scrollY / window.innerHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduceMotion) window.addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
})();
