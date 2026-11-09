import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  addTodo,
  parseTodoId,
  parseTodos,
  toggleTodo
} from '../src/todo';
import type { Todo } from '../src/todo';

const base: readonly Todo[] = [
  { id: 2, text: '买牛奶', completed: false },
  { id: 3, text: '写周报', completed: true }
];

test('addTodo：正常新增，文本 trim 且不改原数组', () => {
  const result = addTodo(base, '  整理桌面  ', 4);

  assert.notStrictEqual(result, base);
  assert.equal(result.length, 3);
  assert.deepEqual(result[2], { id: 4, text: '整理桌面', completed: false });
  assert.equal(base.length, 2);
  assert.equal(base[0]?.text, '买牛奶');
});

test('addTodo：空字符串、纯空格、换行都原样返回', () => {
  for (const text of ['', '   ', '\n\t']) {
    assert.strictEqual(addTodo(base, text, 9), base);
  }
});

test('addTodo：重复 id 属于脏数据，拒绝写入', () => {
  assert.strictEqual(addTodo(base, '另一条', 2), base);
});

test('toggleTodo：只切换目标项，原数组不变', () => {
  const result = toggleTodo(base, 2);

  assert.equal(result[0]?.completed, true);
  assert.equal(result[1]?.completed, true);
  assert.equal(base[0]?.completed, false);
  assert.notStrictEqual(result, base);
});

test('toggleTodo：不存在的 id 返回原数组，不抛错', () => {
  assert.strictEqual(toggleTodo(base, 999), base);
});

test('parseTodoId：dataset 字符串只接受正安全整数', () => {
  assert.equal(parseTodoId('42'), 42);
  assert.equal(parseTodoId(' 7 '), 7);

  const invalid: Array<string | null | undefined> = [
    null,
    undefined,
    '',
    '   ',
    '0',
    '-1',
    '1.5',
    '12abc',
    '1e3'
  ];

  for (const raw of invalid) {
    assert.equal(parseTodoId(raw), null);
  }
});

test('parseTodos：过滤坏 JSON、空文本、字符串 id 与重复 id', () => {
  const raw = JSON.stringify([
    { id: 1, text: ' 买牛奶 ', completed: false },
    { id: 1, text: '重复 id', completed: true },
    { id: '5', text: '字符串 id', completed: false },
    { id: 4, text: '', completed: false },
    null,
    { id: 6, text: '整理桌面', completed: true }
  ]);

  const parsed = parseTodos(raw);

  assert.deepEqual(parsed.map(todo => todo.id), [1, 6]);
  assert.equal(parsed[0]?.text, '买牛奶');
  assert.deepEqual(parseTodos(null), []);
  assert.deepEqual(parseTodos('not-json'), []);
  assert.deepEqual(parseTodos('{"id":1}'), []);
});
