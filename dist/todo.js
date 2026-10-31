                       
             
               
                     
 

                                                    

export const STORAGE_KEY = 'todos-v2';

function isRecord(value         )                                   {
  return typeof value === 'object' && value !== null;
}

export function isTodo(value         )                {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.text === 'string' &&
    value.text.trim().length > 0 &&
    typeof value.completed === 'boolean'
  );
}

/**
 * dataset.id 永远是字符串；这里只接受正的安全整数。
 * '12' -> 12，'12abc' / '0' / '-1' / '1.5' -> null。
 */
export function parseTodoId(raw                           )                {
  if (raw === null || raw === undefined) return null;

  const trimmed = raw.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) return null;

  const id = Number(trimmed);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * localStorage 里可能是旧数据、手改数据或坏 JSON。
 * 只保留结构正确的 Todo，并丢弃重复 id。
 */
export function parseTodos(raw               )         {
  if (!raw) return [];

  try {
    const data          = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    const list                     = data;
    const seen = new Set        ();
    const todos         = [];

    for (const item of list) {
      if (!isTodo(item) || seen.has(item.id)) continue;
      seen.add(item.id);
      todos.push({
        id: item.id,
        text: item.text.trim(),
        completed: item.completed
      });
    }

    return todos;
  } catch {
    return [];
  }
}

export function nextTodoId(todos                 )         {
  const maxId = todos.reduce((max, todo) => Math.max(max, todo.id), 0);
  return Math.max(Date.now(), maxId + 1);
}

export function addTodo(
  todos                 ,
  text        ,
  id        
)                  {
  if (!Number.isSafeInteger(id) || id <= 0) return todos;
  if (todos.some(todo => todo.id === id)) return todos;

  const trimmed = text.trim();
  if (!trimmed) return todos;

  return [...todos, { id, text: trimmed, completed: false }];
}

export function toggleTodo(
  todos                 ,
  id        
)                  {
  if (!todos.some(todo => todo.id === id)) return todos;

  return todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

export function deleteTodo(
  todos                 ,
  id        
)                  {
  if (!todos.some(todo => todo.id === id)) return todos;
  return todos.filter(todo => todo.id !== id);
}

export function updateTodo(
  todos                 ,
  id        ,
  text        
)                  {
  const trimmed = text.trim();
  if (!trimmed) return todos;

  const target = todos.find(todo => todo.id === id);
  if (!target || target.text === trimmed) return todos;

  return todos.map(todo =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
}

export function clearCompleted(
  todos                 
)                  {
  if (!todos.some(todo => todo.completed)) return todos;
  return todos.filter(todo => !todo.completed);
}

export function getVisibleTodos(
  todos                 ,
  filter        
)                  {
  if (filter === 'active') return todos.filter(todo => !todo.completed);
  if (filter === 'completed') return todos.filter(todo => todo.completed);
  return todos;
}
