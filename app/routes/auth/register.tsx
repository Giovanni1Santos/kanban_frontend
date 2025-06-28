import { Link, useNavigate, useOutletContext } from "react-router";
import { Input } from "~/components/Input";
import type { Route } from "./+types/register";
import AuthMessage from "../../AuthMessage";
import type { AuthContext } from "./layout";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registro" }];
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { form, setForm, message, setMessage } =
    useOutletContext<AuthContext>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.password !== form.confirm) {
      setMessage("As senhas não coincidem");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "Registro falhou");
        return;
      }
      setMessage("Registro concluído! Você pode fazer login agora.", "success");
      navigate("/login");
    } catch {
      setMessage("Erro de conexão");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Registro</h2>
      <Input
        label="Nome"
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
      />
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
      <Input
        label="Confirmar Senha"
        type="password"
        name="confirm"
        value={form.confirm}
        onChange={handleChange}
      />
      <AuthMessage message={message} />
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
      >
        Registrar
      </button>
      <p className="mt-4 text-gray-400 text-sm text-center">
        Já tem uma conta?{" "}
        <Link
          className="text-blue-400 hover:underline"
          to="/login"
          onClick={() => {
            setMessage(null);
          }}
        >
          Faça Login
        </Link>
      </p>
    </form>
  );
}
