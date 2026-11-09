import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    // 只跑手写单测；tests/ai-generated.test.ts 是 W9 任务 3 的审查样本，故意保留错误断言，不参与流水线
    include: ['tests/todo.test.ts'],
    environment: 'node'
  }
});
