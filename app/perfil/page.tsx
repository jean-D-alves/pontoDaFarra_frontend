"use client";
import Header from "@/src/components/header/Header";
import Loading from "@/src/components/Loading";
import ModelUpdate from "@/src/components/ModelUpdate";
import { useUser } from "@/src/Context/UserContext";
import { Category } from "@/src/types/category";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mockCategories: Category[] = [
  { id: 1, name: "Oferta", slug: "oferta" },
  { id: 2, name: "Cerveja", slug: "cerveja" },
  { id: 3, name: "Tira-gosto", slug: "tira-gosto" },
  { id: 4, name: "Destilado", slug: "destilado" },
];

export default function Perfil() {
  const router = useRouter();
  const { user, logout, refresh, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/");
    }
  }, [user, userLoading, router]);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<boolean>(false);

  function GetInitial(name: string | undefined): string | null {
    if (!name) {
      return null;
    }
    const FirstInitial = name[0].toUpperCase();
    const SecundInitial = name[1].toUpperCase();
    const Initial = FirstInitial + SecundInitial;
    return Initial;
  }

  async function handleLogout() {
    setError(null);
    setLoading(true);
    try {
      const ok = await logout();
      if (!ok) throw new Error("Não foi possivel fazer o logout");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sair");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header categories={mockCategories} cartCount={0} activeSlug="cerveja" />

      <main className="flex flex-1 flex-col w-full h-full bg-line-strong sm:flex-row">
        <section className="flex flex-col w-full justify-center items-center bg-background rounded-2xl m-4 p-12 sm:w-1/3">
          {loading ? (
            <Loading />
          ) : (
            <ul className="relative flex flex-col h-full items-center justify-center gap-8">
              <PencilIcon
                className="absolute top-1 right-1 cursor-pointer"
                size={18}
                onClick={() => {
                  setModel(true);
                }}
              />
              <li>
                <p className=" flex w-30 h-30 text-3xl rounded-full justify-center items-center bg-brand-mid">
                  <strong>{GetInitial(user?.name)}</strong>
                </p>
              </li>
              <li>
                <p>
                  <strong>{user?.name}</strong>
                </p>
              </li>
              <li>
                <p>
                  <strong>{user?.email}</strong>
                </p>
              </li>
              <li>
                <p>
                  <strong>{user?.phoneNumber}</strong>
                </p>
              </li>
              <li>
                <p>
                  <strong>{user?.role}</strong>
                </p>
              </li>
              <li>
                <button
                  className="flex bg-brand-gradient px-20 py-2 items-center gap-2 rounded-2xl cursor-pointer"
                  onClick={() => handleLogout()}
                >
                  sair da conta
                </button>
              </li>
              <li>
                <button className="flex bg-red-600 text-text px-20 py-2 rounded-2xl cursor-pointer">
                  Apagar conta
                </button>
              </li>
            </ul>
          )}
          {model && (
            <ModelUpdate
              user={user}
              onClose={() => setModel(false)}
              refresh={refresh}
            />
          )}
        </section>
        <section className="flex flex-col w-full justify-center items-center bg-background rounded-2xl m-4"></section>
      </main>
    </>
  );
}
