import { describe, expect, it } from 'vitest';
import {
  isClaudeModule,
  joinNativeModuleSources,
  splitNativeModuleSources,
} from './nativeInstallation';

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

describe('native module source aggregation', () => {
  it('round-trips UTF-8 module bytes by stable module index', () => {
    const modules = [
      { index: 3, content: Buffer.from('export const text = "caf\u00e9";') },
      { index: 19, content: Buffer.from('export const value = 42;\0') },
    ];

    const aggregate = joinNativeModuleSources(modules);
    const split = splitNativeModuleSources(aggregate);

    expect(split).not.toBeNull();
    expect([...split!.keys()]).toEqual([3, 19]);
    expect(split!.get(3)).toEqual(modules[0].content);
    expect(split!.get(19)).toEqual(modules[1].content);
  });

  it('returns null for a legacy single-module source', () => {
    expect(
      splitNativeModuleSources(Buffer.from('console.log("claude")'))
    ).toBeNull();
  });

  it('rejects duplicate indices and boundary text inside a module', () => {
    expect(() =>
      splitNativeModuleSources(
        Buffer.from('\0/*tweakcc-module:1*/\0a\0/*tweakcc-module:1*/\0b')
      )
    ).toThrow(/Duplicate/);
    expect(() =>
      joinNativeModuleSources([
        {
          index: 1,
          content: Buffer.from('\0/*tweakcc-module:2*/\0'),
        },
      ])
    ).toThrow(/boundary marker/);
  });
});
