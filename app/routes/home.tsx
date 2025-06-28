import { useEffect, useState } from "react";
import { redirect } from "react-router";
import { toast } from "react-toastify";
import Board, { type Todo } from "../components/Board";
import Trash from "../components/Trash";
import type { Route } from "./+types/home";

const API_URL = import.meta.env.VITE_API_URL;

const COLUMN_MAP = {
  [0]: "todo",
  [1]: "doing",
  [2]: "done",
} as const;

const COLUMN_REVERSE = {
  todo: 0,
  doing: 1,
  done: 2,
} as const;

const COLUMN_NAME = {
  todo: "A Fazer",
  doing: "Fazendo",
  done: "Feito",
};

type BoardKey = keyof typeof COLUMN_REVERSE;

function getToken(): string | null {
  return window.localStorage.getItem("user_token");
}

export async function clientLoader() {
  const token = window.localStorage.getItem("user_token");
  if (!token) {
    throw redirect("/login");
  }

  const user = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(user);
  if (user.status === 401 || user.status === 403) {
    toast.error("Seu login expirou");
    window.localStorage.removeItem("user_token");
    throw redirect("/login");
  }
  if (user.status === 429) {
    toast.error("Muitas requisições, tente novamente mais tarde");
    return;
  }
  const data = await user.json();
  if (!data) {
    window.localStorage.removeItem("user_token");
    throw redirect("/login");
  }

  return {
    username: data.username as string,
  };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tarefas" }];
}

type Boards = {
  [key in "todo" | "doing" | "done"]: Todo[];
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const [boards, setBoards] = useState<Boards>({
    todo: [],
    doing: [],
    done: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/todo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erro ao buscar tarefas");
        const todos: Todo[] = await res.json();
        const grouped: Boards = { todo: [], doing: [], done: [] };
        for (const t of todos) {
          const columnKey = COLUMN_MAP[
            t.column as keyof typeof COLUMN_MAP
          ] as BoardKey;
          grouped[columnKey].push(t);
        }
        setBoards(grouped);
      } catch (err) {
        toast.error("Erro ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    }
    fetchTodos();
  }, []);

  // Adicionar tarefa
  const addTask = async (boardKey: BoardKey, content: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/todo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, column: COLUMN_REVERSE[boardKey] }),
      });
      if (!res.ok) throw new Error("Erro ao criar tarefa");
      const { id } = await res.json();
      const todoRes = await fetch(`${API_URL}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const todo: Todo = await todoRes.json();
      setBoards((prev) => ({
        ...prev,
        [boardKey]: [...prev[boardKey], todo],
      }));
    } catch (err) {
      toast.error("Erro ao adicionar tarefa");
    }
  };

  // Editar conteúdo da tarefa
  const editTask = async (taskId: number, newContent: string) => {
    const { board: fromBoard } = findTaskAndBoard(boards, taskId);
    if (!fromBoard) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/todo/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error();
      setBoards((prev) => {
        const newBoards = { ...prev };
        newBoards[fromBoard!] = newBoards[fromBoard!].map((t) =>
          t.id === taskId ? { ...t, content: newContent } : t
        );
        return newBoards;
      });
    } catch {
      toast.error("Erro ao editar tarefa");
    }
  };

  // Função utilitária para encontrar a tarefa e o quadro
  function findTaskAndBoard(
    boards: Boards,
    taskId: number
  ): { task: Todo | null; board: BoardKey | null } {
    for (const boardKey of Object.keys(boards) as BoardKey[]) {
      const idx = boards[boardKey].findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        return { task: boards[boardKey][idx], board: boardKey };
      }
    }
    return { task: null, board: null };
  }

  // Mover tarefa entre colunas ou deletar
  const moveTask = async (taskId: number, targetBoard: BoardKey) => {
    const { task, board: fromBoard } = findTaskAndBoard(boards, taskId);
    if (!task || !fromBoard) return;

    // Mover para outra coluna
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/todo/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ column: COLUMN_REVERSE[targetBoard] }),
      });
      if (!res.ok) throw new Error();
      setBoards((prev) => {
        const newBoards = { ...prev };
        // Remover da coluna antiga
        newBoards[fromBoard!] = newBoards[fromBoard!].filter(
          (t) => t.id !== taskId
        );
        // Adicionar na nova coluna
        newBoards[targetBoard] = [
          ...newBoards[targetBoard],
          { ...task!, column: COLUMN_REVERSE[targetBoard] },
        ];
        return newBoards;
      });
    } catch {
      toast.error("Erro ao mover tarefa");
    }
  };

  // Função para remover tarefa
  const removeTask = async (taskId: number) => {
    const { board: fromBoard } = findTaskAndBoard(boards, taskId);
    if (!fromBoard) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/todo/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setBoards((prev) => {
        const newBoards = { ...prev };
        newBoards[fromBoard!] = newBoards[fromBoard!].filter(
          (t) => t.id !== taskId
        );
        return newBoards;
      });
    } catch {
      toast.error("Erro ao deletar tarefa");
    }
  };

  if (!loaderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-200 mb-6">
          Houve um erro ao carregar os dados do usuário.
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold text-center py-6 text-gray-100">
        Olá, {loaderData.username}
        <button
          className="ml-4 px-3 py-1 rounded bg-red-700 text-white text-sm hover:bg-red-800 cursor-pointer"
          onClick={() => {
            window.localStorage.removeItem("user_token");
            window.location.href = "/login";
          }}
        >
          Sair
        </button>
      </h1>
      <div className="max-w-2xl mx-auto mb-6 px-4">
        <div className="bg-gray-800 text-gray-300 rounded-lg p-4 text-sm shadow">
          <p>
            <b>Como usar:</b> Adicione tarefas nos quadros, arraste-as entre colunas para mudar de status, edite o conteúdo dando dois clicks no card, e arraste para a lixeira para excluir.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-8">
        {Object.entries(boards).map(([key, tasks]) => (
          <Board
            key={key}
            title={COLUMN_NAME[key as BoardKey]}
            tasks={tasks}
            onAdd={(title) => addTask(key as BoardKey, title)}
            onDrop={(taskId: number) => moveTask(taskId, key as BoardKey)}
            onEdit={editTask}
          />
        ))}
        <Trash onDropTask={removeTask} />
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-800 px-6 py-4 rounded shadow text-gray-100">
            Carregando...
          </div>
        </div>
      )}
    </div>
  );
}
