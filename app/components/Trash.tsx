import React, { useState } from "react";

type TrashProps = {
  onDropTask: (taskId: number) => void;
};

export default function Trash({ onDropTask }: TrashProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = Number(e.dataTransfer.getData("text/plain"));
    onDropTask(taskId);
  };
  return (
    <div
      className={`flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 mx-auto my-4 text-2xl md:text-3xl rounded-full border-4 transition-all duration-200
        ${isOver
          ? "bg-red-700 border-red-400 text-white scale-110 shadow-lg"
          : "bg-gray-900 border-red-700 text-red-200 hover:bg-red-800"
        } cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      title="Arraste aqui para excluir"
    >
      <span className="text-3xl md:text-4xl mb-1">🗑️</span>
      <span className="text-xs md:text-sm font-semibold tracking-wide">Lixeira</span>
    </div>
  );
}
