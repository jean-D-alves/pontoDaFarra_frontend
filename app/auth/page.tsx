"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useUser } from "@/src/Context/UserContext";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { formatPhone, isValidPhone, phoneToDigits } from "@/src/Handle/phone";
import { getActive } from "@/src/Handle/Legal";
import type { LegalDocument } from "@/src/types/legal";
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
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="relative w-full">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-3 ${
            error ? "border-red-500" : "border-cardline"
          } ${isPassword ? "pr-12" : ""}`}
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
      {error && (
        <p id={`${id}-error`} className="text-sm font-normal text-red-500">
          {error}
        </p>
      )}
    </>
  );
}

export default function Auth() {
  const router = useRouter();
  const { signIn, signUp } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInSenha, setSignInSenha] = useState("");
  const [signUpNome, setSignUpNome] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpSenha, setSignUpSenha] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");

  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[] | null>(
    null,
  );
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  const loadLegalDocuments = useCallback(async () => {
    setLegalLoading(true);
    setLegalError(null);

    try {
      const [privacyPolicy, termsOfService] = await Promise.all([
        getActive("PrivacyPolicy"),
        getActive("TermsOfService"),
      ]);

      const documents = [privacyPolicy, termsOfService].filter(
        (document): document is LegalDocument => document !== null,
      );

      setLegalDocuments(documents);

      if (documents.length === 0) {
        setLegalError(
          "Nenhum documento legal está disponível no momento. Tente novamente mais tarde.",
        );
      }
    } catch {
      setLegalDocuments(null);
      setLegalError(
        "Não foi possível carregar os documentos legais. Tente novamente.",
      );
    } finally {
      setLegalLoading(false);
    }
  }, []);

  const privacyDocument =
    legalDocuments?.find((document) => document.type === "PrivacyPolicy") ??
    null;
  const termsDocument =
    legalDocuments?.find((document) => document.type === "TermsOfService") ??
    null;

  function toggleScreen() {
    setError(null);
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);

    if (!nextIsLogin) {
      setAcceptedLegal(false);
      void loadLegalDocuments();
    }
  }
  const phoneError =
    signUpPhoneNumber && !isValidPhone(signUpPhoneNumber)
      ? "Use +99(99)9999-9999 ou +99(99)99999-9999"
      : undefined;

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

    if (!isValidPhone(signUpPhoneNumber)) {
      setError("Telefone inválido");
      return;
    }

    if (!legalDocuments || legalDocuments.length === 0) {
      setError(
        "Os documentos legais ainda não foram carregados. Tente novamente.",
      );
      return;
    }

    if (!acceptedLegal) {
      setError("Você precisa aceitar os documentos legais para criar a conta.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(
        signUpNome,
        signUpEmail,
        signUpSenha,
        phoneToDigits(signUpPhoneNumber),
        legalDocuments.map((document) => document.legalDocumentId),
      );

      if (!result.ok) {
        // 400 pode indicar que os documentos ativos mudaram desde o carregamento.
        if (result.status === 400) {
          setAcceptedLegal(false);
          void loadLegalDocuments();
        }

        throw new Error(result.message);
      }

      router.push("/");
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
          src="/Image/CervejaBackGround.jpg"
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
          <Field
            id="signup-phonenumber"
            label="Digite seu telefone"
            placeholder="+55(84)99999-9999"
            value={signUpPhoneNumber}
            onChange={(v) => setSignUpPhoneNumber(formatPhone(v))}
            inputMode="tel"
            error={phoneError}
          />

          <div className="flex flex-col gap-2 text-sm font-normal">
            {legalLoading && (
              <p className="text-muted">Carregando documentos legais…</p>
            )}

            {!legalLoading && legalError && (
              <div className="rounded-xl bg-unavailable-bg px-3 py-2 text-sm font-medium text-unavailable-text">
                <p role="alert">{legalError}</p>
                <button
                  type="button"
                  onClick={() => void loadLegalDocuments()}
                  className="mt-2 font-semibold underline underline-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!legalLoading && !legalError && (
              <div className="flex items-start gap-2">
                <input
                  id="signup-legal"
                  type="checkbox"
                  checked={acceptedLegal}
                  onChange={(event) =>
                    setAcceptedLegal(event.target.checked)
                  }
                  aria-required="true"
                  className="mt-1 h-4 w-4 shrink-0 accent-black"
                />
                <label
                  htmlFor="signup-legal"
                  className="leading-relaxed text-body"
                >
                  Li e aceito a{" "}
                  {privacyDocument ? (
                    <Link
                      href="/politica-de-privacidade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-deep underline underline-offset-2 transition hover:text-black"
                    >
                      Política de Privacidade
                    </Link>
                  ) : null}
                  {privacyDocument && termsDocument ? " e os " : null}
                  {termsDocument ? (
                    <Link
                      href="/termos-de-uso"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-deep underline underline-offset-2 transition hover:text-black"
                    >
                      Termos de Uso
                    </Link>
                  ) : null}
                  .
                </label>
              </div>
            )}
          </div>

          <button
            disabled={
              loading ||
              legalLoading ||
              !legalDocuments ||
              legalDocuments.length === 0
            }
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
