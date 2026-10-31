# Todo 列表 V2.0 · TypeScript

W8 的 `temp.html` 保留为 JavaScript 版本；W9 在 `index.html` 中加载编译后的 TypeScript 版本。

## 运行

```bash
npm run build
npm test
```

本机用 pnpm 时把 `npm` 换成 `pnpm` 即可。项目没有第三方运行时依赖，构建脚本使用 Node 24 的 `stripTypeScriptTypes`，测试使用 `node:test`。

## 目录

- `src/todo.ts`：`Todo` 类型、脏数据解析、增删改查纯函数
- `src/app.ts`：DOM 渲染、事件委托、编辑态
- `tests/todo.test.ts`：手写单测（7 个）
- `tests/ai-generated.test.ts`：任务 3 中 AI 生成的测试，保留原样供审查
- `scripts/build.mjs`：把 `src/*.ts` 转成 `dist/*.js`
- `dist/`：构建产物，`index.html` 直接引用
