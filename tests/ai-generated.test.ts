import { test } from 'vitest';
import assert from 'node:assert/strict';
import { addTodo, toggleTodo } from '../src/todo';
import type { Todo } from '../src/todo';

// 这段是任务 3 中 AI 生成的测试，保留原样用于审查。
// 其中「空白文本也应新增」和「不存在的 id 应抛错」与当前 API 契约不符。

test('AI：addTodo 会新增一条任务', () => {
  const result = addTodo([], '买牛奶', 1);
  assert.equal(result.length, 1);
});

test('AI：空白文本也应该新增', () => {
  const result = addTodo([], '   ', 2);
  assert.equal(result.length, 1);
});

test('AI：toggleTodo 会切换完成状态', () => {
  const list: readonly Todo[] = [
    { id: 1, text: '买牛奶', completed: false }
  ];
  const result = toggleTodo(list, 1);
  assert.equal(result[0]?.completed, true);
});

test('AI：toggleTodo 对不存在的 id 应该抛错', () => {
  assert.throws(() => toggleTodo([], 999));
});
