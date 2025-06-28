import React, { useEffect, useRef, useState } from "react";

type Todo = { id: number; content: string; done: boolean };

const API_URL = `${import.meta.env.VITE_API_URL}/todo`;

export function TodoApp() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch(() => setTodos([]));
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user_token")}`,
      },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id: number };
      const newTodo = { id: data.id, content, done: false };
      setTodos((prev) => [...prev, newTodo]);
      setInput("");
      inputRef.current?.focus();
    }
  }

  async function toggleTodo(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user_token")}`,
      },
      body: JSON.stringify({ content: todo.content, done: !todo.done }),
    });
    if (res.ok) {
      // const data = await res.json();
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                done: !t.done,
              }
            : t
        )
      );
    }
  }

  async function removeTodo(id: number) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("user_token")}`,
      },
    });
    if (res.ok) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded shadow-md max-w-lg w-full">
      <form onSubmit={addTodo} className="flex mb-4 flex-wrap justify-end">
        <input
          ref={inputRef}
          className="flex-1 px-3 py-2 rounded-l bg-gray-700 text-gray-100 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nome da tarefa"
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded-r text-white font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Adicionar
        </button>
      </form>
      <ul>
        {loading && (
          <li className="text-gray-400 text-center">
            <span className="loader"></span>
          </li>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between py-2 border-b border-gray-700"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
              className="mr-4 cursor-pointer"
            />
            <input
              type="text"
              value={todo.content}
              onChange={async (e) => {
                const newContent = e.target.value;
                setTodos((prev) =>
                  prev.map((t) =>
                    t.id === todo.id ? { ...t, content: newContent } : t
                  )
                );
              }}
              onBlur={async (e) => {
                const newContent = e.target.value.trim();
                //TODO: checar se houve alteração
                await fetch(`${API_URL}/${todo.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "user_token"
                    )}`,
                  },
                  body: JSON.stringify({
                    content: newContent,
                    done: todo.done,
                  }),
                });
              }}
              className={`flex-1 bg-transparent border-none outline-none cursor-text ${
                todo.done ? "line-through text-gray-400" : "text-gray-100"
              }`}
              disabled={todo.done}
            />
            <button
              onClick={() => removeTodo(todo.id)}
              className="ml-4 text-red-400 hover:text-red-600 cursor-pointer"
              aria-label="Remover"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {!loading && todos.length === 0 && (
        <p className="text-gray-400 text-center mt-4">Nenhuma tarefa ainda.</p>
      )}
    </div>
  );
}
