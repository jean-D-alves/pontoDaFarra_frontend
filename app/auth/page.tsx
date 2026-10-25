"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/src/Context/UserContext";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full rounded-xl border border-cardline bg-white px-3 ${
            isPassword ? "pr-12" : ""
          }`}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-black/50 transition hover:text-black"
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </>
  );
}

export default function Auth() {
  const router = useRouter();
  const { signIn } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInSenha, setSignInSenha] = useState("");
  const [signUpNome, setSignUpNome] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpSenha, setSignUpSenha] = useState("");

  function toggleScreen() {
    setError(null);
    setIsLogin((prev) => !prev);
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await signIn(signInEmail, signInSenha);
      if (!ok) throw new Error("Email ou senha inválidos");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log({ signUpNome, signUpEmail, signUpSenha });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
      <header className="fixed left-0 top-0 z-20 p-5">
        <Link
          href="/"
          className={`shrink-0 font-display text-lg leading-none tracking-wide transition hover:text-gold sm:text-2xl ${
            isLogin ? "text-black" : "text-black md:text-white"
          }`}
        >
          PONTO DA FARRA
        </Link>
      </header>

      <div
        className={`min-h-screen w-full flex-1 items-center justify-center px-6 py-24 md:flex md:w-1/2 md:py-0 ${
          isLogin ? "flex" : "hidden"
        }`}
      >
        <form
          onSubmit={handleSignIn}
          className="flex w-full max-w-sm flex-col gap-4 font-bold"
        >
          <Field
            id="signin-email"
            label="Digite seu email"
            type="email"
            placeholder="exemplo@exemplo.com"
            value={signInEmail}
            onChange={setSignInEmail}
          />
          <Field
            id="signin-senha"
            label="Digite sua senha"
            type="password"
            placeholder="Senha"
            value={signInSenha}
            onChange={setSignInSenha}
          />
          <button
            disabled={loading}
            className="h-10 bg-brand-gradient rounded-xl disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button
            type="button"
            onClick={toggleScreen}
            className="text-sm opacity-50 hover:opacity-70"
          >
            Não tenho uma conta
          </button>
        </form>
      </div>

      <div
        className={`absolute inset-y-0 left-0 z-10 hidden w-1/2 overflow-hidden bg-black transition-transform duration-500 ease-in-out md:block ${
          isLogin ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <Image
          src="/image/CervejaBackGround.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0" />
      </div>

      <div
        className={`min-h-screen w-full flex-1 items-center justify-center px-6 py-24 md:flex md:w-1/2 md:py-0 ${
          isLogin ? "hidden" : "flex"
        }`}
      >
        <form
          onSubmit={handleSignUp}
          className="flex w-full max-w-sm flex-col gap-4 font-bold"
        >
          <Field
            id="signup-name"
            label="Digite seu nome"
            placeholder="Nome"
            value={signUpNome}
            onChange={setSignUpNome}
          />
          <Field
            id="signup-email"
            label="Digite seu email"
            type="email"
            placeholder="exemplo@exemplo.com"
            value={signUpEmail}
            onChange={setSignUpEmail}
          />
          <Field
            id="signup-senha"
            label="Digite sua senha"
            type="password"
            placeholder="Senha"
            value={signUpSenha}
            onChange={setSignUpSenha}
          />
          <button
            disabled={loading}
            className="h-10 bg-brand-gradient rounded-xl disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar"}
          </button>
          <button
            type="button"
            onClick={toggleScreen}
            className="text-sm opacity-50 hover:opacity-70"
          >
            Já tenho uma conta
          </button>
        </form>
      </div>

      {error && (
        <p className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-xl bg-red-500 px-4 py-2 font-bold text-white">
          {error}
        </p>
      )}
    </main>
  );
}