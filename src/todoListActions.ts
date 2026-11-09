import { parseTodoId } from './todo';

export type TodoListAction = 'edit' | 'delete' | 'toggle';

export interface ResolvedTodoClick {
  readonly id: number;
  readonly action: TodoListAction;
}

const ACTION_SELECTORS = {
  edit: '[data-action="edit"]',
  delete: '[data-action="delete"]'
} as const;

type ButtonAction = keyof typeof ACTION_SELECTORS;

interface ListTarget {
  readonly item: HTMLLIElement;
  readonly id: number;
}

/** 取 target -> 找所属 li -> 校验归属 -> 解析 id；任何一步不成立都返回 null。 */
function findListTarget(target: Element, list: HTMLUListElement): ListTarget | null {
  const item = target.closest<HTMLLIElement>('li.todo-item');
  if (!item || !list.contains(item)) return null;

  const id = parseTodoId(item.dataset.id);
  if (id === null) return null;

  return { item, id };
}

/** 点击编辑框内部不参与任何委托动作（否则会误切换完成状态）。 */
function isInsideEditField(target: Element): boolean {
  return target.closest('.todo-edit') !== null;
}

function matchActionButton(target: Element, item: HTMLLIElement, action: ButtonAction): boolean {
  const button = target.closest<HTMLButtonElement>(ACTION_SELECTORS[action]);
  return button !== null && item.contains(button);
}

/**
 * 把一次列表点击解析成「对哪条、做什么」，不产生副作用。
 * 判定顺序与原实现一致：编辑框内部忽略 -> 编辑 -> 删除 -> 其余都算切换。
 */
export function resolveTodoClick(
  event: MouseEvent,
  list: HTMLUListElement
): ResolvedTodoClick | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  const found = findListTarget(target, list);
  if (!found) return null;

  if (isInsideEditField(target)) return null;

  if (matchActionButton(target, found.item, 'edit')) {
    return { id: found.id, action: 'edit' };
  }

  if (matchActionButton(target, found.item, 'delete')) {
    return { id: found.id, action: 'delete' };
  }

  return { id: found.id, action: 'toggle' };
}
