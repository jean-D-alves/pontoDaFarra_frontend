"use client";
import ConfirmMessage from "@/src/components/ConfirmMessage";
import Header from "@/src/components/header/Header";
import Loading from "@/src/components/Loading";
import ModelUpdate from "@/src/components/ModelUpdate";
import OrderHistory from "@/src/components/profile/OrderHistory";
import LocationList from "@/src/components/profile/LocationList";
import { useUser } from "@/src/Context/UserContext";
import { requestDeleteUser } from "@/src/Handle/User";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";

type ProfileTab = "orders" | "locations";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "orders", label: "Meus pedidos" },
  { id: "locations", label: "Meus endereços" },
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = PROFILE_TABS.map((tab) => tab.id);
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab);
    document.getElementById(`profile-tab-${nextTab}`)?.focus();
  }

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
  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      console.log("1. chamando delete");
      const ok = await requestDeleteUser();
      console.log("2. delete retornou:", ok);
      if (!ok) throw new Error("Não foi possivel apagar a conta");

      console.log("3. chamando logout");
      await logout();
      console.log("4. logout terminou");
      router.push("/");
    } catch (err) {
      console.error("handleDelete falhou:", err);
      setError(err instanceof Error ? err.message : "Erro ao apagar a conta");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>

      <main className="flex flex-1 flex-col w-full h-full bg-line-strong p-4 gap-4 lg:flex-row">
        <section className="flex flex-col w-full justify-center items-center bg-ink text-text rounded-2xl p-8 lg:w-[390px] lg:shrink-0">
          {loading ? (
            <Loading />
          ) : (
            <ul className="relative flex flex-col h-full items-center gap-8">
              <PencilIcon
                className="absolute top-1 right-1 cursor-pointer"
                size={18}
                onClick={() => {
                  setModel(true);
                }}
              />
              <p className=" flex w-30 h-30 text-3xl text-ink rounded-full justify-center items-center bg-brand-gradient">
                <strong>{GetInitial(user?.name)}</strong>
              </p>
              <p>
                <strong>{user?.name}</strong>
              </p>
              <p>
                <strong>{user?.email}</strong>
              </p>
              <p>
                <strong>{user?.phoneNumber}</strong>
              </p>
              <p className="flex flex-col text-center p-2">
                <strong>{user?.role}</strong>
                {user?.role === "Admin" && (
                  <Link
                    href="/admin"
                    className="text-sm text-text"
                  >
                    Pagina de Admin
                  </Link>
                )}
              </p>
              <button
                className="flex bg-brand-gradient text-ink px-15 py-1 rounded-xl cursor-pointer md:py-2"
                onClick={() => handleLogout()}
              >
                <strong>sair da conta</strong>
              </button>
              <button
                className="flex bg-red-600 text-text px-15 py-1 rounded-xl cursor-pointer md:py-2"
                onClick={() => setConfirmDelete(true)}
              >
                <strong>Apagar conta</strong>
              </button>
            </ul>
          )}
          {model && (
            <ModelUpdate
              user={user}
              onClose={() => setModel(false)}
              refresh={refresh}
            />
          )}
          {confirmDelete && (
            <ConfirmMessage
              variant="danger"
              title="Apagar conta?"
              message="Essa ação não pode ser desfeita. Deseja mesmo apagar sua conta?"
              confirmLabel="Apagar"
              onConfirm={() => {
                setConfirmDelete(false);
                handleDelete();
              }}
              onCancel={() => setConfirmDelete(false)}
            />
          )}
        </section>
        <section className="flex flex-col w-full min-w-0 justify-start items-center bg-background text-text rounded-2xl py-10 px-8 lg:flex-1">
          <div
            role="tablist"
            aria-label="Seções do perfil"
            onKeyDown={handleTabKeyDown}
            className="flex w-full rounded-xl border gap-1 border-[#E7E5DF] bg-surface p-1"
          >
            {PROFILE_TABS.map((tab) => {
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`profile-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`profile-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] flex-1 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    selected
                      ? "bg-white text-stone-strong shadow-sm"
                      : "text-stone hover:text-stone-strong"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="profile-panel-orders"
            aria-labelledby="profile-tab-orders"
            hidden={activeTab !== "orders"}
            className="mt-6 w-full"
          >
            <OrderHistory />
          </div>

          <div
            role="tabpanel"
            id="profile-panel-locations"
            aria-labelledby="profile-tab-locations"
            hidden={activeTab !== "locations"}
            className="mt-6 w-full"
          >
            <LocationList />
          </div>
        </section>
      </main>
    </>
  );
}
