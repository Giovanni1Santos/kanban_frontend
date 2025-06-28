import React from "react";
import { Link, useOutletContext } from "react-router";
import { Input } from "~/components/Input";
import type { Route } from "./+types/login";
import AuthMessage from "../../AuthMessage";
import type { AuthContext } from "./layout";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }];
}

export default function LoginForm() {
  const { form, setForm, message, setMessage } =
    useOutletContext<AuthContext>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login falhou");
        return;
      }

      if (data.token) {
        window.localStorage.setItem("user_token", data.token);
        setMessage("Login ok", "success");
        window.location.href = "/";
      } else {
        setMessage("Login falhou");
      }
    } catch {
      setMessage("Erro de conexão");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Login</h2>
      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
      />
      <Input
        label="Senha"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
      />
      <AuthMessage message={message} />
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
      >
        Login
      </button>
      <p className="mt-4 text-gray-400 text-sm text-center">
        Ainda não tem uma conta?{" "}
        <Link
          className="text-blue-400 hover:underline"
          to="/register"
          onClick={() => {
            setMessage(null);
          }}
        >
          Registre-se
        </Link>
      </p>
    </form>
  );
}
