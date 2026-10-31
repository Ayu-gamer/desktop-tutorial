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
                                              

function required                   (selector        )    {
  const element = document.querySelector   (selector);
  if (!element) throw new Error(`缺少 DOM 元素: ${selector}`);
  return element;
}

const inputEl = required                  ('#todoInput');
const addBtn = required                   ('#addBtn');
const todoList = required                  ('#todoList');
const counterEl = required                 ('#counter');
const clearBtn = required                   ('#clearCompleted');
const filterBtns = document.querySelectorAll                   ('.filters button');

let todos                  = [];
let filter         = 'all';
let editingId                = null;

function save()       {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 隐私模式或配额不足时，页面仍然可用，只是不能持久化
  }
}

function load()       {
  try {
    todos = parseTodos(localStorage.getItem(STORAGE_KEY));
  } catch {
    todos = [];
  }
}

function setFilter(next        )       {
  filter = next;
  editingId = null;
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === next);
  });
  render();
}

function startEdit(id        )       {
  if (!todos.some(todo => todo.id === id)) return;
  editingId = id;
  render();
}

function deleteTodoById(id        )       {
  if (editingId === id) editingId = null;
  todos = deleteTodo(todos, id);
  save();
  render();
}

function toggleById(id        )       {
  todos = toggleTodo(todos, id);
  save();
  render();
}

function render()       {
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

      let textEl                                    ;

      if (editingId === todo.id) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'todo-edit';
        editInput.value = todo.text;

        editInput.addEventListener('keydown', (event               ) => {
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
    const editInput = todoList.querySelector                  (
      `li[data-id="${editingId}"] .todo-edit`
    );
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }
}

function handleAdd()       {
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

inputEl.addEventListener('keydown', (event               ) => {
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

todoList.addEventListener('click', (event            ) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const item = target.closest               ('li.todo-item');
  if (!item || !todoList.contains(item)) return;

  const id = parseTodoId(item.dataset.id);
  if (id === null) return;

  if (target.closest('.todo-edit')) return;

  const editBtn = target.closest                   ('[data-action="edit"]');
  if (editBtn && item.contains(editBtn)) {
    startEdit(id);
    return;
  }

  const delBtn = target.closest                   ('[data-action="delete"]');
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
