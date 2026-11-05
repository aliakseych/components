'use client';

import { useEffect, useRef } from 'react';

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MATERIAL_OUTSIDE true
#define MATERIAL_REACH 0.3200
uniform sampler2D uField;
uniform sampler2D uSurf;
uniform vec2 uFieldScale;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uMatP[8];
uniform vec4 uMatC[16];
uniform vec4 uSurface;
out vec4 outColor;
#define C_colors(k) uMatC[0 + (k)]
#define N_colors uMatP[0].x
#define C_base uMatC[10]
#define P_innerGlow uMatP[0].y
#define P_outerGlow uMatP[0].z
#define P_contour uMatP[0].w
#define P_angle uMatP[1].x
#define P_noise uMatP[1].y
#define P_speed uMatP[1].z

struct Surface {
  vec2 p;
  vec2 uv;
  vec2 frag;
  vec2 res;
  float unit;
  float px;
  float d;
  float aa;
  float cov;
  vec2 n;
  float slope;
  float time;
};

float shapeAt(vec2 q) {
  return texture(uField, q * uFieldScale + 0.5).r;
}

const float m_box = 1.6;

float m_sst(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float m_lst(float a, float b, float x) {
  return clamp((x - a) / (b - a), 0.0, 1.0);
}

float m_circle(vec2 uv, vec2 c, vec2 r) {
  return 1.0 - m_sst(r.x, r.y, length(uv - c));
}

float m_cdf(float x) {
  float y = x * 0.70710678;
  float y2 = y * y;
  float e = sqrt(1.0 - exp(-y2 * (1.27323954 + 0.147 * y2) / (1.0 + 0.147 * y2)));
  return 0.5 + 0.5 * sign(y) * e;
}

float m_shadow(vec2 uv, float t, float contour) {
  vec2 su = uv;
  float posY = mix(-1.0, 2.0, t);
  su.y -= 0.5;
  float grow = m_sst(0.0, 0.8, posY) * m_lst(1.4, 0.9, posY);
  su *= vec2(1.0, 1.0 + 1.5 * grow);
  su.y += 0.5;
  float outerR = 1.0 - 0.3 * (m_sst(0.1, 0.2, t) * (1.0 - m_sst(0.2, 0.5, t)));
  float s = m_circle(su, vec2(0.5, posY - 0.2), vec2(0.4, outerR));
  s = pow(s, 1.4) * 1.2;
  float pos = posY - uv.y;
  float flat_ = m_lst(-0.4, 0.0, pos) * (1.0 - m_sst(0.0, 1.2, pos));
  flat_ = pow(flat_, 3.0);
  s = mix(flat_, s, 1.0 - m_sst(0.0, 0.3, pos));
  float ang = -2.0 - t * TAU;
  float right = m_circle(uv, vec2(0.95 - 0.2 * cos(ang), 0.4 - 0.1 * sin(ang)), vec2(0.15, 0.3));
  s = mix(s, 0.0, right * m_sst(0.6, 0.7, t) * (1.0 - m_sst(0.8, 0.9, t)));
  float top = m_circle(uv, vec2(0.5, 0.19), vec2(0.05, 0.25));
  top += 2.0 * contour * m_circle(uv, vec2(0.5, 0.19), vec2(0.2, 0.5));
  top *= 0.55 * m_sst(0.2, 0.3, t) * (1.0 - m_sst(0.3, 0.45, t));
  s = mix(s, 0.0, top);
  float leaf = m_circle(uv, vec2(0.53, 0.13), vec2(0.08, 0.19));
  leaf = mix(leaf, 0.0, 1.0 - m_sst(0.4, 0.54, uv.x));
  leaf = mix(0.0, leaf, m_sst(0.0, 0.2, uv.y));
  leaf *= m_sst(0.5, 1.1, posY) * m_sst(1.5, 1.3, posY);
  s += leaf;
  float bottom = m_sst(0.0, 0.4, t) * (1.0 - m_sst(0.6, 0.8, t));
  s = mix(s, 0.0, bottom * m_circle(uv, vec2(0.52, 0.92), vec2(0.09, 0.25)));
  float drift = m_sst(0.0, 0.6, t) * (1.0 - m_sst(0.6, 1.0, t));
  s = mix(s, 0.5, m_circle(uv, vec2(0.0, 1.2 - 0.5 * drift), vec2(0.1, 0.3)));
  s = mix(s, 0.0, m_circle(uv, vec2(1.0, 0.5 + 0.5 * drift), vec2(0.1, 0.3)));
  float rise = m_sst(0.3, 0.4, t);
  s = mix(s, 1.0, m_circle(uv, vec2(0.95, 0.2 + 0.2 * rise * m_sst(0.7, 0.5, t)), vec2(0.07, 0.22)));
  s = mix(s, 1.0, m_circle(uv, vec2(0.95, 0.2 + 0.2 * rise * (1.0 - m_sst(0.5, 0.7, t))), vec2(0.07, 0.22)));
  s /= max(1e-4, m_sst(1.0, 0.85, uv.y));
  return min(s, 1.0);
}

float m_hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec4 material(Surface s) {
  vec2 tex = s.p / (1.75 * m_box) + 0.5;
  float t = 0.1 * s.time * P_speed - 0.3;
  float t1 = fract(t);
  float t2 = fract(t + 1.0 / 3.0);
  float t3 = fract(t + 2.0 / 3.0);
  float a = -P_angle * PI / 180.0;
  vec2 c = tex - 0.5;
  vec2 au = vec2(c.x * cos(a) - c.y * sin(a), c.x * sin(a) + c.y * cos(a)) + 0.5;

  float shape = clamp(0.5 + s.d / (0.011 * m_box), 0.0, 1.0);
  float sigma = 0.15 * m_box;
  float r = sigma * 0.65;
  float soft = sigma * 0.9;
  float big = m_cdf(s.d / soft) * 0.2;
  big += m_cdf(shapeAt(s.p + vec2(r, 0.0)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p - vec2(r, 0.0)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p + vec2(0.0, r)) / soft) * 0.2;
  big += m_cdf(shapeAt(s.p - vec2(0.0, r)) / soft) * 0.2;
  float small = m_cdf(s.d / (0.0185 * m_box));
  float outerBlur = shape * (1.0 - big);
  float innerBlur = (1.0 - shape) * big;
  float contour = (1.0 - shape) * small;

  float inner = 0.8 + 0.8 * innerBlur;
  inner = mix(inner, 0.0, m_shadow(au, t1, innerBlur));
  inner = mix(inner, 0.0, m_shadow(au, t2, innerBlur));
  inner = mix(inner, 0.0, m_shadow(au, t3, innerBlur));
  inner *= 2.0 * P_innerGlow;
  inner += P_contour * 2.0 * contour;
  inner = min(1.0, inner) * (1.0 - shape);

  float band = fract(t1 * 3.0 - 0.1);
  float outer = 0.9 * pow(outerBlur, 0.8);
  float y = fract(au.y - band);
  outer *= 0.5 + m_sst(0.3, 0.65, y) * (1.0 - m_sst(0.65, 1.0, y));
  outer *= 5.0 * P_outerGlow * P_outerGlow;

  inner = pow(inner, 1.2);
  float heat = clamp(inner + outer, 0.0, 1.0);
  heat += (0.005 + 0.35 * P_noise) * (m_hash(s.frag * 0.01) - 0.5);

  float n = N_colors;
  float mixer = heat * n;
  vec4 g = C_colors(0);
  g.rgb *= g.a;
  float fade = clamp(mixer, 0.0, 1.0);
  for (int i = 2; i <= 10; i++) {
    if (float(i) > n) break;
    float m = clamp(mixer - float(i - 1), 0.0, 1.0);
    vec4 k = C_colors(i - 1);
    k.rgb *= k.a;
    g = mix(g, k, m);
  }
  vec3 col = g.rgb * fade;
  float alpha = g.a * fade;
  float back = C_base.a * s.cov;
  col += C_base.rgb * back * (1.0 - alpha);
  alpha += back * (1.0 - alpha);
  col += 0.02 * alpha * (m_hash(s.frag * 0.01 + 1.0) - 0.5);
  if (alpha < 1e-4) return vec4(0.0);
  return vec4(col / alpha, alpha);
}
void main() {
  float unit = min(uResolution.x, uResolution.y) * 0.5;
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 p = (frag - uResolution * 0.5) / unit;
  float px = 1.0 / unit;
  float d = shapeAt(p);
  float aa = clamp(length(vec2(dFdx(d), dFdy(d))), px * 0.5, px * 1.5);
  vec2 g = vec2(0.0);
  Surface s;
  s.p = p;
  s.uv = frag / uResolution;
  s.frag = frag;
  s.res = uResolution;
  s.unit = unit;
  s.px = px;
  s.d = d;
  s.aa = aa;
  s.cov = clamp(0.5 - d / aa, 0.0, 1.0);
  s.slope = length(g);
  s.n = s.slope > 1e-5 ? g / s.slope : vec2(0.0);
  s.time = uTime;

  vec4 m = material(s);
  float reach = 1.0 - smoothstep(MATERIAL_REACH * 0.55, MATERIAL_REACH, d);
  float a = clamp(MATERIAL_OUTSIDE ? m.a * max(reach, s.cov) : m.a * s.cov, 0.0, 1.0);
  outColor = vec4(clamp(m.rgb, 0.0, 1.0) * a, a);
}
`;

const toRgba = value => {
  const hex = String(value || '#ffffff').replace('#', '');
  const full = hex.length <= 4 ? hex.split('').map(char => char + char).join('') : hex;
  const channel = index => parseInt(full.slice(index, index + 2), 16) / 255;
  return [channel(0), channel(2), channel(4), full.length >= 8 ? channel(6) : 1];
};

const solve = (grid, offset, stride, length, f, v, z) => {
  for (let i = 0; i < length; i++) f[i] = grid[offset + i * stride];
  let k = 0;
  v[0] = 0;
  z[0] = -1e20;
  z[1] = 1e20;
  for (let q = 1; q < length; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = 1e20;
  }
  k = 0;
  for (let q = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    grid[offset + q * stride] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
};

const distances = (grid, width, height) => {
  const size = Math.max(width, height);
  const f = new Float64Array(size);
  const v = new Int32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < width; x++) solve(grid, x, width, height, f, v, z);
  for (let y = 0; y < height; y++) solve(grid, y * width, 1, width, f, v, z);
};

const loadField = src =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const long = 640;
      const ratio = image.width / image.height || 1;
      const width = Math.round(ratio >= 1 ? long : long * ratio);
      const height = Math.round(ratio >= 1 ? long / ratio : long);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const outer = new Float64Array(width * height);
      const inner = new Float64Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const a = pixels[i * 4 + 3] / 255;
        const edge = 0.5 - a;
        outer[i] = a >= 1 ? 0 : a <= 0 ? 1e20 : edge > 0 ? edge * edge : 0;
        inner[i] = a <= 0 ? 0 : a >= 1 ? 1e20 : edge < 0 ? edge * edge : 0;
      }
      distances(outer, width, height);
      distances(inner, width, height);
      const unit = Math.min(width, height) / 2;
      const data = new Float32Array(width * height);
      for (let i = 0; i < data.length; i++) data[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / unit;
      resolve({ data, width, height });
    };
    image.onerror = reject;
    image.src = src;
  });

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

// Pack material parameters into the uMatP / uMatC uniform arrays.
const pack = ({ colors, base, innerGlow, outerGlow, contour, angle, noise, speed }) => {
  const floats = new Float32Array(32);
  const colorData = new Float32Array(64);
  const list = (Array.isArray(colors) ? colors : [colors]).slice(0, 10);
  list.forEach((value, index) => colorData.set(toRgba(value), index * 4));
  floats[0] = list.length;
  colorData.set(toRgba(base), 40);
  floats[1] = Number(innerGlow) || 0;
  floats[2] = Number(outerGlow) || 0;
  floats[3] = Number(contour) || 0;
  floats[4] = Number(angle) || 0;
  floats[5] = Number(noise) || 0;
  floats[6] = Number(speed) || 0;
  return { floats, colorData };
};

export default function HalftoneMark({
  src,
  className,
  style,
  label = '',
  colors = ['#11206a', '#1f3ba2', '#2f63e7', '#6bd7ff', '#ffe679', '#ff991e', '#ff4c00'],
  base = '#000000',
  innerGlow = 0.5,
  outerGlow = 0,
  contour = 0.5,
  angle = 0,
  noise = 0,
  speed = 1
}) {
  const canvasRef = useRef(null);
  const settings = useRef({});
  settings.current = { colors, base, innerGlow, outerGlow, contour, angle, noise, speed };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return undefined;
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uniform = name => gl.getUniformLocation(program, name);
    const texture = gl.createTexture();
    let field = null;
    let frame = 0;
    let alive = true;
    const started = performance.now();

    const render = now => {
      frame = requestAnimationFrame(render);
      if (!field) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const { floats, colorData } = pack(settings.current);
      const fieldUnit = Math.min(field.width, field.height) / 2;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniform('uResolution'), width, height);
      gl.uniform2f(uniform('uFieldScale'), fieldUnit / field.width, fieldUnit / field.height);
      gl.uniform1f(uniform('uTime'), (now - started) / 1000);
      gl.uniform4fv(uniform('uMatP'), floats);
      gl.uniform4fv(uniform('uMatC'), colorData);
      gl.uniform4f(uniform('uSurface'), 0.04, 0, 0, 0);
      gl.uniform1i(uniform('uField'), 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    loadField(src)
      .then(result => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, result.width, result.height, 0, gl.RED, gl.FLOAT, result.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        field = result;
      })
      .catch(() => {});
    frame = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={className}
      style={{ display: 'block', width: '100%', aspectRatio: '1 / 1', ...style }}
    />
  );
}

HalftoneMark.credits = 'Material adapted from Paper Shaders, Apache License 2.0, https://github.com/paper-design/shaders';
