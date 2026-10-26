import { useEffect, useState } from "react";
import { User } from "../types/User";
import { formatPhone, isValidPhone } from "@/src/Handle/phone";
import { X } from "lucide-react";
import { RequestMe, requestUpdateUser } from "../Handle/User";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  inputMode,
}: FieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-xl border bg-white px-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
            : "border-slate-200 focus:border-violet-500 focus:ring-violet-100"
        }`}
        required
      />
      {error && (
        <p id={`${id}-error`} className="text-sm font-normal text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

type ModelUpdateProps = {
  user: User | null;
  onClose: () => void;
  refresh: () => void;
};

export default function ModelUpdate({
  user,
  onClose,
  refresh,
}: ModelUpdateProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneError =
    phoneNumber && !isValidPhone(phoneNumber)
      ? "Use +99(99)9999-9999 ou +99(99)99999-9999"
      : undefined;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phoneError) return;
    setError(null);
    setLoading(true);
    try {
      const update = await requestUpdateUser(name, email, phoneNumber);
      if (!update) {
        return null;
      }

      const refreshed = await refresh();
      window.location.reload();
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-update-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-brand-gradient px-6 py-5">
          <h2 id="model-update-title" className="text-xl font-bold text-white">
            Editar perfil
          </h2>
          <p className="text-sm text-white/80">Atualize seus dados</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/90 transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <Field
            id="update-name"
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChange={setName}
          />
          <Field
            id="update-email"
            label="Email"
            type="email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChange={setEmail}
          />
          <Field
            id="update-phonenumber"
            label="Telefone"
            placeholder="+55(84)99999-9999"
            value={phoneNumber}
            onChange={(v) => setPhoneNumber(formatPhone(v))}
            inputMode="tel"
            error={phoneError}
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!phoneError}
              className="h-11 flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
