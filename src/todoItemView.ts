import type { Todo } from './todo';

/**
 * 单条待办视图需要的回调。视图只负责「建 DOM + 挂事件」，
 * 编辑态的读写与提交都交回 app.ts，避免两处各自维护 editingId。
 */
export interface TodoItemHandlers {
  readonly isEditing: (id: number) => boolean;
  readonly commitEdit: (todo: Todo, rawValue: string) => void;
  readonly cancelEdit: () => void;
}

function createToggleCheckbox(todo: Todo): HTMLInputElement {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.dataset.action = 'toggle';
  return checkbox;
}

function createTextSpan(todo: Todo): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;
  return span;
}

function handleEditKeydown(
  event: KeyboardEvent,
  editInput: HTMLInputElement,
  handlers: TodoItemHandlers
): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    editInput.blur();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    handlers.cancelEdit();
  }
}

function handleEditBlur(
  editInput: HTMLInputElement,
  todo: Todo,
  handlers: TodoItemHandlers
): void {
  // 回车 / Esc / 重新渲染都会让输入框失焦；只有仍是本条在编辑时才提交。
  if (!handlers.isEditing(todo.id)) return;
  handlers.commitEdit(todo, editInput.value);
}

function createEditInput(
  todo: Todo,
  handlers: TodoItemHandlers
): HTMLInputElement {
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit';
  editInput.value = todo.text;

  editInput.addEventListener('keydown', (event: KeyboardEvent) => {
    handleEditKeydown(event, editInput, handlers);
  });

  editInput.addEventListener('blur', () => {
    handleEditBlur(editInput, todo, handlers);
  });

  return editInput;
}

interface ActionButtonSpec {
  readonly className: string;
  readonly action: string;
  readonly text: string;
  readonly title?: string;
}

function createActionButton(spec: ActionButtonSpec): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = spec.className;
  button.dataset.action = spec.action;
  button.textContent = spec.text;
  if (spec.title !== undefined) button.title = spec.title;
  return button;
}

function createEditButton(): HTMLButtonElement {
  return createActionButton({
    className: 'edit-btn',
    action: 'edit',
    text: '✎',
    title: '编辑'
  });
}

function createDeleteButton(): HTMLButtonElement {
  return createActionButton({
    className: 'remove-btn',
    action: 'delete',
    text: '×'
  });
}

export function createTodoItem(
  todo: Todo,
  handlers: TodoItemHandlers
): HTMLLIElement {
  const li = document.createElement('li');
  li.className = todo.completed ? 'todo-item completed' : 'todo-item';
  li.dataset.id = String(todo.id);

  const textEl = handlers.isEditing(todo.id)
    ? createEditInput(todo, handlers)
    : createTextSpan(todo);

  li.append(
    createToggleCheckbox(todo),
    textEl,
    createEditButton(),
    createDeleteButton()
  );

  return li;
}
