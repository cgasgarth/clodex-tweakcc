import { describe, expect, it } from 'vitest';
import { isClaudeModule } from './nativeInstallation';

describe('isClaudeModule', () => {
  it.each([
    '/$bunfs/root/cli',
    'cli',
    '/$bunfs/root/src/entrypoints/cli.js',
    'src/entrypoints/cli.js',
    '/usr/local/bin/claude',
    'claude',
    'claude.exe',
  ])('recognizes the Claude entry module %s', moduleName => {
    expect(isClaudeModule(moduleName)).toBe(true);
  });

  it.each([
    '/$bunfs/root/image-processor.js',
    '/$bunfs/root/audio-capture.js',
    '/usr/local/bin/not-claude',
    'cli-helper',
  ])('rejects a non-entry module %s', moduleName => {
    expect(isClaudeModule(moduleName)).toBe(false);
  });
});
