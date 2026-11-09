import {
  addTodo,
  clearCompleted as clearCompletedTodos,
  deleteTodo,
  getVisibleTodos,
  nextTodoId,
  parseTodos,
  STORAGE_KEY,
  toggleTodo,
  updateTodo
} from './todo';
import type { Filter, Todo } from './todo';
import {
  focusEditInput,
  renderCounter,
  renderTodoList
} from './todoListView';
import type { TodoItemHandlers } from './todoItemView';
import { resolveTodoClick } from './todoListActions';
import type { TodoListAction } from './todoListActions';

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`缺少 DOM 元素: ${selector}`);
  return element;
}

const inputEl = required<HTMLInputElement>('#todoInput');
const addBtn = required<HTMLButtonElement>('#addBtn');
const todoList = required<HTMLUListElement>('#todoList');
const counterEl = required<HTMLSpanElement>('#counter');
const clearBtn = required<HTMLButtonElement>('#clearCompleted');
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filters button');

let todos: readonly Todo[] = [];
let filter: Filter = 'all';
let editingId: number | null = null;

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 隐私模式或配额不足时，页面仍然可用，只是不能持久化
  }
}

function load(): void {
  try {
    todos = parseTodos(localStorage.getItem(STORAGE_KEY));
  } catch {
    todos = [];
  }
}

function render(): void {
  renderTodoList(todoList, getVisibleTodos(todos, filter), itemHandlers);
  renderCounter(counterEl, todos);

  if (editingId !== null) {
    focusEditInput(todoList, editingId);
  }
}

function isEditing(id: number): boolean {
  return editingId === id;
}

/** 失焦提交：空文本或未改动都不写入，其余情况更新文本并重绘。 */
function commitEdit(todo: Todo, rawValue: string): void {
  const next = rawValue.trim();
  editingId = null;

  if (next && next !== todo.text) {
    todos = updateTodo(todos, todo.id, next);
    save();
  }

  render();
}

function cancelEdit(): void {
  editingId = null;
  render();
}

const itemHandlers: TodoItemHandlers = {
  isEditing,
  commitEdit,
  cancelEdit
};

function setFilter(next: Filter): void {
  filter = next;
  editingId = null;
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === next);
  });
  render();
}

function startEdit(id: number): void {
  if (!todos.some(todo => todo.id === id)) return;
  editingId = id;
  render();
}

function deleteTodoById(id: number): void {
  if (editingId === id) editingId = null;
  todos = deleteTodo(todos, id);
  save();
  render();
}

function toggleById(id: number): void {
  todos = toggleTodo(todos, id);
  save();
  render();
}

const listActions: Readonly<Record<TodoListAction, (id: number) => void>> = {
  edit: startEdit,
  delete: deleteTodoById,
  toggle: toggleById
};

function handleTodoListClick(event: MouseEvent): void {
  const resolved = resolveTodoClick(event, todoList);
  if (!resolved) return;
  listActions[resolved.action](resolved.id);
}

function handleAdd(): void {
  const next = addTodo(todos, inputEl.value, nextTodoId(todos));
  if (next !== todos) {
    todos = next;
    save();
  }

  inputEl.value = '';
  render();
  inputEl.focus();
}

addBtn.addEventListener('click', handleAdd);

inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') handleAdd();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.filter;
    if (value === 'all' || value === 'active' || value === 'completed') {
      setFilter(value);
    }
  });
});

todoList.addEventListener('click', handleTodoListClick);

clearBtn.addEventListener('click', () => {
  editingId = null;
  todos = clearCompletedTodos(todos);
  save();
  render();
});

load();
render();
