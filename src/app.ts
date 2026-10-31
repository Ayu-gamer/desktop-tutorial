import {
  addTodo,
  clearCompleted as clearCompletedTodos,
  deleteTodo,
  getVisibleTodos,
  nextTodoId,
  parseTodoId,
  parseTodos,
  STORAGE_KEY,
  toggleTodo,
  updateTodo
} from './todo.js';
import type { Filter, Todo } from './todo.js';

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

function render(): void {
  todoList.replaceChildren();

  const visible = getVisibleTodos(todos, filter);

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-message';
    empty.textContent = '暂无待办事项 ✨';
    todoList.appendChild(empty);
  } else {
    visible.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.dataset.id = String(todo.id);

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = todo.completed;
      cb.dataset.action = 'toggle';

      let textEl: HTMLInputElement | HTMLSpanElement;

      if (editingId === todo.id) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'todo-edit';
        editInput.value = todo.text;

        editInput.addEventListener('keydown', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            editInput.blur();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            editingId = null;
            render();
          }
        });

        editInput.addEventListener('blur', () => {
          if (editingId !== todo.id) return;

          const next = editInput.value.trim();
          editingId = null;

          if (next && next !== todo.text) {
            todos = updateTodo(todos, todo.id, next);
            save();
          }

          render();
        });

        textEl = editInput;
      } else {
        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;
        textEl = span;
      }

      const edit = document.createElement('button');
      edit.className = 'edit-btn';
      edit.dataset.action = 'edit';
      edit.textContent = '✎';
      edit.title = '编辑';

      const del = document.createElement('button');
      del.className = 'remove-btn';
      del.dataset.action = 'delete';
      del.textContent = '×';

      li.append(cb, textEl, edit, del);
      todoList.appendChild(li);
    });
  }

  const remaining = todos.filter(todo => !todo.completed).length;
  counterEl.textContent = `${remaining} 项未完成 / 共 ${todos.length} 项`;

  if (editingId !== null) {
    const editInput = todoList.querySelector<HTMLInputElement>(
      `li[data-id="${editingId}"] .todo-edit`
    );
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }
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

todoList.addEventListener('click', (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const item = target.closest<HTMLLIElement>('li.todo-item');
  if (!item || !todoList.contains(item)) return;

  const id = parseTodoId(item.dataset.id);
  if (id === null) return;

  if (target.closest('.todo-edit')) return;

  const editBtn = target.closest<HTMLButtonElement>('[data-action="edit"]');
  if (editBtn && item.contains(editBtn)) {
    startEdit(id);
    return;
  }

  const delBtn = target.closest<HTMLButtonElement>('[data-action="delete"]');
  if (delBtn && item.contains(delBtn)) {
    deleteTodoById(id);
    return;
  }

  toggleById(id);
});

clearBtn.addEventListener('click', () => {
  editingId = null;
  todos = clearCompletedTodos(todos);
  save();
  render();
});

load();
render();
