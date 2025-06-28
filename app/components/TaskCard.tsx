import React, { useState, useRef, useEffect } from "react";
import type { Todo } from "./Board";

type TaskCardProps = {
  task: Todo;
  onEdit: (taskId: number, newContent: string) => void;
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", task.id.toString());
    e.currentTarget.classList.add("opacity-50");
  };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (value.trim() && value !== task.content) {
      onEdit(task.id, value.trim());
    } else {
      setValue(task.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditing(false);
      setValue(task.content);
    }
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div
      className="bg-gray-900 px-3 py-2 mb-3 rounded-lg border-l-4 border-blue-600 break-words cursor-move text-gray-100"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="w-full bg-gray-800 text-gray-100 border border-blue-400 rounded px-2 py-1 outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={255}
        />
      ) : (
        value
      )}
    </div>
  );
}
