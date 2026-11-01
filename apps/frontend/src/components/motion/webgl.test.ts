import { expect, test, vi } from 'vitest';
import { linkProgram } from './webgl';

function stubGl({ compiles = true, uniforms = [] as string[] } = {}) {
  const program = {};
  const gl = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ACTIVE_UNIFORMS: 5,
    createShader: vi.fn((type: number) => ({ type })),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn((shader: { type: number }) => compiles || shader.type === 1),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => program),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn((_: unknown, param: number) =>
      param === 5 ? uniforms.length : true,
    ),
    deleteProgram: vi.fn(),
    getActiveUniform: vi.fn((_: unknown, index: number) => ({ name: uniforms[index] })),
    getUniformLocation: vi.fn((_: unknown, name: string) => ({ name })),
  };
  return { gl, program };
}

test('linkProgram keys array uniforms by their stripped name (GradientASCII uRamp/uTrail/uClicks)', () => {
  const { gl, program } = stubGl({ uniforms: ['uRamp[0]', 'uTrail[0]', 'uClicks[0]', 'uTime'] });
  const result = linkProgram(gl as unknown as WebGL2RenderingContext, 'v', 'f');

  expect(result?.program).toBe(program);
  expect(result?.uniforms).toEqual({
    uRamp: { name: 'uRamp[0]' },
    uTrail: { name: 'uTrail[0]' },
    uClicks: { name: 'uClicks[0]' },
    uTime: { name: 'uTime' },
  });
});

test('linkProgram returns null and deletes the compiled shader when the fragment fails', () => {
  const { gl } = stubGl({ compiles: false });
  const result = linkProgram(gl as unknown as WebGL2RenderingContext, 'v', 'f');

  expect(result).toBeNull();
  expect(gl.createProgram).not.toHaveBeenCalled();
  // Fragment deleted inside compileShader, vertex deleted by linkProgram.
  expect(gl.deleteShader).toHaveBeenCalledTimes(2);
  expect(gl.deleteShader).toHaveBeenCalledWith({ type: 1 });
});
