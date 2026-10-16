// A Study in Teak — v3: the liquid field behind the hero (after monopo saigon's iridescent backdrop).
// One full-screen fragment shader: domain-warped noise, coloured sage → amber with oxblood in the folds, on black;
// a glass sphere set top-right magnifies and bends the field inside it, with a lit rim. Grain is a CSS overlay at
// full resolution; the canvas itself renders at reduced resolution (the field is soft, so nothing is lost).
// window.FIELD = { light(v, dur), freeze() } — app.js drives the brightness (dim under the loader, full after).
(() => {
const cv = document.querySelector(".field-c");
if (!cv) return;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "high-performance" });
const api = { level: 0.0, target: 0.0, rate: 0, scroll: 0 };
window.FIELD = {
  light(v, dur = 1.6) { api.target = v; api.rate = Math.abs(v - api.level) / Math.max(dur, 0.01); },
  setScroll(s) { api.scroll = s; },
};
if (!gl) { document.documentElement.classList.add("no-gl"); return; }

const VS = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;
const FS = `precision highp float;
uniform vec2 R; uniform float T; uniform float L; uniform vec3 S; uniform float K; uniform vec4 Q; uniform vec4 Q2;
float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * n(p); p = m * p; a *= .5; } return v / .875; }
// a lit silk surface: the warped noise is treated as a height field and lit from the upper left, so every fold has a
// bright side, a dark side and a crease where they meet (the reference reads as silk or molten metal, not blobs)
float hgt(vec2 p, float t){
  vec2 q = vec2(fbm(p * .48 + vec2(0., t)), fbm(p * .48 + vec2(5.2, 1.3) - t * .8));
  vec2 r = vec2(fbm(p * .48 + 3.0 * q + vec2(1.7, 9.2) + t * .9), fbm(p * .48 + 3.0 * q + vec2(8.3, 2.8) - t * .7));
  return fbm(p * .42 + 2.3 * r);
}
vec3 field(vec2 p){
  p += vec2(13.7, 27.1);                       // away from the lattice origin, where the hash is flat
  float t = T * .045, e = .06;
  float h0 = hgt(p, t);
  float hx = hgt(p + vec2(e, 0.), t) - hgt(p - vec2(e, 0.), t);
  float hy = hgt(p + vec2(0., e), t) - hgt(p - vec2(0., e), t);
  vec3 nrm = normalize(vec3(-hx * Q2.z, -hy * Q2.z, 1.));
  vec3 lig = normalize(vec3(-.55, .65, .5));
  float dif = max(dot(nrm, lig), 0.);
  float spec = pow(max(dot(reflect(-lig, nrm), vec3(0., 0., 1.)), 0.), 5.);
  float g = fbm(p * .95 + vec2(3.1, 7.7) + t * .3 + h0 * 1.6);
  vec3 sage = vec3(.43, .55, .40), amber = vec3(.80, .61, .32), ox = vec3(.34, .11, .07);
  vec3 c = mix(sage, amber, smoothstep(Q.z, Q.w, g));          // sage holds about half the field
  float lum = min(1., Q2.y + (1. - Q2.y) * pow(dif, 1.5) + spec * .1);    // lit folds, shadow between; highlights capped
  c = mix(ox * .6, c, smoothstep(.05, Q2.w, lum));
  float cover = smoothstep(Q.x, Q.y, h0);      // about two-thirds of the frame lit, the rest falls to black
  return c * lum * cover * Q2.x;
}
void main(){
  vec2 uv = gl_FragCoord.xy / R.y;                 // height-normalised, y up
  vec2 p = uv * 1.25 + vec2(0., K * .6);
  vec3 col = field(p);
  float on = smoothstep(.45, .95, L);              // the sphere and the full frame arrive with the light
  // the glass sphere: the field seen through it, bent; a thick lit rim, and bright caustics along its lower-left edge
  vec2 d = uv - S.xy; float r = length(d) / S.z; vec2 nd = normalize(d + 1e-4);
  if (r < 1.) {
    vec2 bent = S.xy + d * (.78 + .22 * r * r) + d * .08 * (1. - r);
    vec3 inner = field(bent * 1.25 + vec2(.18, K * .6 - .1)) * 1.08;
    col = mix(col, mix(inner, col, smoothstep(.97, 1., r) * .5), on);
    float lit = .5 + .5 * dot(nd, normalize(vec2(-.5, -.85)));
    float rim = smoothstep(.78, .99, r) * (1. - smoothstep(.99, 1., r));
    col += rim * rim * mix(vec3(.30, .36, .27), vec3(.80, .64, .40), lit) * (.08 + .2 * lit) * on;
    float caus = smoothstep(.93, .985, r) * (1. - smoothstep(.985, 1., r)) * pow(max(dot(nd, normalize(vec2(-.75, -.66))), 0.), 5.);
    col += caus * vec3(1., .86, .62) * .35 * on;
  }
  // under the loader a lit band through the middle; the edges stay black
  vec2 c0 = gl_FragCoord.xy / R - .5; float mid = exp(-dot(c0 * vec2(.95, 2.3), c0 * vec2(.95, 2.3)) * 6.);
  col *= mix(mid * 2.4, 1., on);
  // a quiet darkening behind the fixed chrome along the top, so its small grey labels always read
  float v = gl_FragCoord.y / R.y;
  col *= 1. - .62 * smoothstep(.78, .95, v);
  // the hero's foot: the field ends in a short, clean fall to black (the page below is #000)
  col *= smoothstep(.02, .10, v) * L;
  gl_FragColor = vec4(col, 1.);
}`;
const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
let pr;
try {
  pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
} catch (e) { console.error("field:", e); document.documentElement.classList.add("no-gl"); return; }
gl.useProgram(pr);
const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const al = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
const U = Object.fromEntries(["R", "T", "L", "S", "K", "Q", "Q2"].map((k) => [k, gl.getUniformLocation(pr, k)]));
// tuned against the reference's measured frames (coverage ≈ .6 lit, about half of it sage, peaks ≈ rgb(154,130,81));
// ?tune=covLo,covHi,sageLo,sageHi,gain,ambient,normal,oxblood overrides them for a sweep
let TUNE = [.22, .40, .62, .74, .70, .36, 14, .2];
try { const t = new URLSearchParams(location.search).get("tune"); if (t) TUNE = t.split(",").map(Number); } catch {}

let W = 0, H = 0, scale = 0.5;
function size() {
  const phone = innerWidth < 760;
  scale = phone ? 0.42 : 0.5;
  W = Math.max(2, Math.round(innerWidth * scale)); H = Math.max(2, Math.round(innerHeight * scale));
  cv.width = W; cv.height = H; gl.viewport(0, 0, W, H);
}
size(); addEventListener("resize", size);

// the sphere: top-right, partly off the frame (as the reference sets it); on a phone it sits higher and smaller
// …and it drifts slowly, as the reference's does
const sphere = (t) => { const a = W / H, dx = Math.sin(t * .11) * .035, dy = Math.cos(t * .085) * .025; return innerWidth < 760 ? [a * .82 + dx, 1.0 + dy, .58] : [a * .80 + dx, .91 + dy, .72]; };
let last = performance.now(), t0 = last, visible = true;
document.addEventListener("visibilitychange", () => (visible = !document.hidden));
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (api.level !== api.target) { const s = Math.sign(api.target - api.level); api.level += s * api.rate * dt; if ((api.target - api.level) * s < 0) api.level = api.target; }
  const heroGone = api.scroll > 1.05;
  if (visible && !heroGone) {
    const [sx, sy, sr] = sphere(reduced ? 0 : (now - t0) / 1000);
    gl.uniform2f(U.R, W, H); gl.uniform1f(U.T, reduced ? 12 : (now - t0) / 1000 + 12); gl.uniform1f(U.L, api.level);
    gl.uniform3f(U.S, sx, sy, sr); gl.uniform1f(U.K, api.scroll); gl.uniform4f(U.Q, TUNE[0], TUNE[1], TUNE[2], TUNE[3]); gl.uniform4f(U.Q2, TUNE[4], TUNE[5], TUNE[6], TUNE[7]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  if (!reduced || api.level !== api.target) requestAnimationFrame(frame);
  else setTimeout(() => requestAnimationFrame(frame), 250);
}
requestAnimationFrame(frame);
})();
