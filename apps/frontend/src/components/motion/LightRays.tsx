'use client';

/*
 * LightRays, ported from React Bits (https://reactbits.dev), trimmed for Sova: only the props
 * sub-page heroes use remain (raysColor, className), the rest are fixed at the React Bits defaults.
 *
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of an application,
 * website, or product, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * Commons Clause Restriction: You may use this Software, including for any commercial purpose,
 * so long as you do not sell, sublicense, or redistribute the components themselves-whether
 * alone, in a bundle, or as a ported version.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useEffect, useRef, useState } from 'react';
import './LightRays.css';

export interface LightRaysProps {
  raysColor?: string;
  className?: string;
}

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

const DEFAULT_COLOR_HEX = '#0065df';
const DEFAULT_COLOR: [number, number, number] = [0, 101 / 255, 223 / 255];
const SPEED = 1;
const SPREAD = 0.5;
const LENGTH = 3;
const DENSITY = 1;
const SHARPNESS = 0.35;
const GLOW = 0.6;
const HAZE = 0.25;
const ATMOSPHERE = 1;
const INTENSITY = 1;
const FADE = 1;
const SATURATION = 1;
const INFLUENCE = 0.1;
const OPACITY = 1;
const PIXEL_BUDGET = 2.4e6;

const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform float uTime;
uniform vec2 uSource;
uniform vec2 uAim;
uniform float uReach;
uniform vec3 uColor;
uniform float uSpread;
uniform float uLength;
uniform float uFade;
uniform float uSaturation;
uniform float uDensity;
uniform float uSharpness;
uniform float uGlow;
uniform float uHaze;
uniform float uAtmosphere;
uniform float uIntensity;
uniform vec2 uIntro;
uniform float uOpacity;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float shape(float strength, float width) {
  float edge = max(mix(0.5, 0.08, uSharpness), width);
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;
  vec2 delta = coord - uSource;
  float distance = length(delta);
  vec2 dir = delta / max(distance, 1e-4);
  float cosAngle = dot(dir, uAim);
  float angle = cosAngle;
  float slope = fwidth(angle);
  float depth = distance / uReach;

  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);
  float envelope = spread * lengthFalloff * fadeFalloff;
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {
    fragColor = vec4(0.0);
    return;
  }

  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) + 0.4 * shape(strengthB, widthB));

  if (uHaze > 0.0) {
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);
  }

  float light = (rayLight + glowLight) * reveal;

  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);
}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseColor = (value: string): [number, number, number] | null => {
  const text = String(value || '').trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (digit) => digit + digit) : hex[1];
    return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255) as [
      number,
      number,
      number,
    ];
  }
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(text);
  if (rgb) {
    return [rgb[1], rgb[2], rgb[3]].map((channel) => clamp(parseFloat(channel) / 255, 0, 1)) as [
      number,
      number,
      number,
    ];
  }
  return null;
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const link = (gl: WebGL2RenderingContext): Program | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: Program['uniforms'] = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; index++) {
    const info = gl.getActiveUniform(program, index);
    if (info) uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};

const smoother = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export function LightRays({ raysColor = DEFAULT_COLOR_HEX, className = '' }: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const [generation, setGeneration] = useState(0);

  const color = parseColor(raysColor) || DEFAULT_COLOR;
  const settingsRef = useRef({ color });

  useEffect(() => {
    settingsRef.current = { color };
    wakeRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const canvas = document.createElement('canvas');
    canvas.className = 'light-rays-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.classList.remove('light-rays--lost');
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    const loseExtension = gl?.getExtension('WEBGL_lose_context');
    const release = () => {
      loseExtension?.loseContext();
      canvas.remove();
    };

    const shader = gl ? link(gl) : null;
    if (!gl || !shader) {
      container.classList.add('light-rays--lost');
      release();
      return undefined;
    }

    const vao = gl.createVertexArray();
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = motionQuery.matches;

    const size = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0.5, y: 0.5, seen: false };
    const aim = { x: 0.5, y: 0.5 };
    let time = 0;
    let opening = !reduce && generation === 0 ? 0 : 1;
    let raf = 0;
    let last = 0;
    let visible = true;
    let disposed = false;
    let lost = false;

    const draw = () => {
      if (disposed || lost || !visible || document.hidden) return;
      const width = size.width;
      const height = size.height;
      const sourceX = 0.5 * width;
      const sourceY = -0.2 * height;
      let dirX = 0;
      let dirY = 1;
      if (INFLUENCE > 0) {
        const mx = aim.x * width - sourceX;
        const my = aim.y * height - sourceY;
        const ml = Math.hypot(mx, my) || 1;
        const bx = dirX + (mx / ml - dirX) * INFLUENCE;
        const by = dirY + (my / ml - dirY) * INFLUENCE;
        const bl = Math.hypot(bx, by) || 1;
        dirX = bx / bl;
        dirY = by / bl;
      }
      const eased = 1 - Math.pow(1 - opening, 3);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shader.program);
      gl.bindVertexArray(vao);
      const u = shader.uniforms;
      const col = settingsRef.current.color;
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uScale, size.ratio);
      gl.uniform1f(u.uTime, time);
      gl.uniform2f(u.uSource, sourceX, sourceY);
      gl.uniform2f(u.uAim, dirX, dirY);
      gl.uniform1f(u.uReach, Math.max(width, height));
      gl.uniform3f(u.uColor, col[0], col[1], col[2]);
      gl.uniform1f(u.uSpread, SPREAD);
      gl.uniform1f(u.uLength, LENGTH);
      gl.uniform1f(u.uFade, FADE);
      gl.uniform1f(u.uSaturation, SATURATION);
      gl.uniform1f(u.uDensity, DENSITY);
      gl.uniform1f(u.uSharpness, SHARPNESS);
      gl.uniform1f(u.uGlow, GLOW);
      gl.uniform1f(u.uHaze, HAZE);
      gl.uniform1f(u.uAtmosphere, ATMOSPHERE);
      gl.uniform1f(u.uIntensity, INTENSITY);
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));
      gl.uniform1f(u.uOpacity, OPACITY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      if (disposed || lost) return;
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const detail = DENSITY * (0.35 + 0.65 * SHARPNESS);
      const sampling = clamp(0.35 + 0.3 * detail, 0.5, 2);
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2,
        sampling,
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight)),
      );
      const width = Math.max(1, Math.round(cssWidth * ratio));
      const height = Math.max(1, Math.round(cssHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      size.width = cssWidth;
      size.height = cssHeight;
      size.ratio = width / cssWidth;

      if (visible && !document.hidden) {
        draw();
        wake();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || lost || !visible || document.hidden) return;
      const dt = last ? clamp((now - last) / 1000, 0, 0.05) : 0;
      last = now;
      if (!reduce) {
        time += dt * SPEED;
      }
      if (opening < 1) {
        opening = reduce ? 1 : Math.min(1, opening + dt / 1.8);
      }

      const steer = 1 - Math.exp(-dt / 0.2);
      const aimX = pointer.seen ? pointer.x : 0.5;
      const aimY = pointer.seen ? pointer.y : 0.5;
      aim.x += (aimX - aim.x) * steer;
      aim.y += (aimY - aim.y) * steer;

      draw();

      const settling = !reduce && (Math.abs(aim.x - aimX) > 1e-4 || Math.abs(aim.y - aimY) > 1e-4);
      const busy = (!reduce && SPEED > 0) || opening < 1 || settling;
      if (busy && visible && !document.hidden) {
        raf = requestAnimationFrame(frame);
      } else {
        last = 0;
      }
    };

    function wake() {
      if (!raf && !disposed && !lost && visible && !document.hidden) {
        raf = requestAnimationFrame(frame);
      }
    }
    wakeRef.current = wake;

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / Math.max(1, rect.width),
        y: (event.clientY - rect.top) / Math.max(1, rect.height),
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const spot = locate(event);
      pointer.x = spot.x;
      pointer.y = spot.y;
      pointer.seen = true;
      if (!reduce) wake();
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      container.classList.add('light-rays--lost');
    };

    const onRestored = () => setGeneration((value) => value + 1);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        last = 0;
        wake();
      }
    };

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let listeningPointer = false;
    const startPointer = () => {
      if (listeningPointer || !finePointer || reduce) return;
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      listeningPointer = true;
    };
    const stopPointer = () => {
      if (!listeningPointer) return;
      window.removeEventListener('pointermove', onPointerMove);
      listeningPointer = false;
    };

    const onMotionChange = () => {
      reduce = motionQuery.matches;
      if (reduce) {
        stopPointer();
        opening = 1;
        aim.x = pointer.seen ? pointer.x : 0.5;
        aim.y = pointer.seen ? pointer.y : 0.5;
      } else {
        startPointer();
      }
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    intersection.observe(container);

    if (finePointer && !reduce) {
      startPointer();
    }
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    resize();
    wake();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      stopPointer();
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (vao) gl.deleteVertexArray(vao);
      if (shader) gl.deleteProgram(shader.program);
      release();
    };
  }, [generation]);

  return (
    <div
      ref={containerRef}
      className={`light-rays${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}

export default LightRays;
