import React, { useState } from "react";
import TaskCard from "./TaskCard";

export type Todo = {
  id: number;
  content: string;
  done: boolean;
  column: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardProps = {
  title: string;
  tasks: Todo[];
  onAdd: (title: string) => void;
  onDrop: (taskId: number) => void;
  onEdit: (taskId: number, newContent: string) => void;
};

export default function Board({ title, tasks, onAdd, onDrop, onEdit }: BoardProps) {
  const [taskTitle, setTaskTitle] = useState<string>("");

  const handleAdd = () => {
    if (taskTitle.trim()) {
      onAdd(taskTitle);
      setTaskTitle("");
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-blue-400");
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("ring-2", "ring-blue-400");
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400");
    const taskId = Number(e.dataTransfer.getData("text/plain"));
    onDrop(taskId);
  };
  return (
    <div
      className="bg-gray-800 rounded-xl p-4 shadow min-h-[200px] flex flex-col border border-gray-700"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700 text-gray-100">
        {title}
      </h2>
      <div className="flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} />
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-4 sm:flex-row">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Nova tarefa"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-grow px-2 py-1 border border-gray-600 rounded-md bg-gray-900 text-gray-100 placeholder-gray-400 min-w-0"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
