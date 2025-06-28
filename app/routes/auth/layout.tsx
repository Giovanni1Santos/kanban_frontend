import { useState } from "react";
import { Outlet, redirect } from "react-router";

export interface AuthFormData {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export interface AuthMessage {
  content: string;
  type: "error" | "success";
}

export interface AuthContext {
  form: AuthFormData;
  setForm: (form: AuthFormData) => void;
  message: AuthMessage | null;
  setMessage: (message: string | null, type?: AuthMessage["type"]) => void;
}

export function clientLoader() {
  const token = window.localStorage.getItem("user_token");
  if (token) {
    throw redirect("/");
  }
}

export default function AuthLayout() {
  const [form, setForm] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [message, _setMessage] = useState<AuthMessage | null>(null);

  function setMessage(
    content: string | null,
    type: AuthMessage["type"] = "error"
  ) {
    _setMessage(content ? { content, type } : null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Outlet
        context={
          {
            form,
            setForm,
            message,
            setMessage,
          } satisfies AuthContext
        }
      />
    </div>
  );
}
