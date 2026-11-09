import type { Todo } from './todo';
import { createTodoItem } from './todoItemView';
import type { TodoItemHandlers } from './todoItemView';

const EMPTY_MESSAGE = '暂无待办事项 ✨';

function createEmptyMessage(): HTMLLIElement {
  const empty = document.createElement('li');
  empty.className = 'empty-message';
  empty.textContent = EMPTY_MESSAGE;
  return empty;
}

/** 只负责列表区域的渲染：清空 -> 空态或逐条创建。 */
export function renderTodoList(
  list: HTMLUListElement,
  visible: readonly Todo[],
  handlers: TodoItemHandlers
): void {
  list.replaceChildren();

  if (visible.length === 0) {
    list.appendChild(createEmptyMessage());
    return;
  }

  for (const todo of visible) {
    list.appendChild(createTodoItem(todo, handlers));
  }
}

/** 只负责底部计数文案。 */
export function renderCounter(
  counter: HTMLElement,
  todos: readonly Todo[]
): void {
  const remaining = todos.filter(todo => !todo.completed).length;
  counter.textContent = `${remaining} 项未完成 / 共 ${todos.length} 项`;
}

/** 只负责把焦点交给正在编辑的输入框。 */
export function focusEditInput(
  list: HTMLUListElement,
  editingId: number
): void {
  const editInput = list.querySelector<HTMLInputElement>(
    `li[data-id="${editingId}"] .todo-edit`
  );

  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}
