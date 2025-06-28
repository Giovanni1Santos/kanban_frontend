import type React from "react";

export const Input = ({
  label, type, value, onChange, name,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}) => (
  <div className="mb-4">
    <label className="block text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={type === "password" ? "current-password" : "on"} />
  </div>
);
