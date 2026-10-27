"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type User } from "../types/User";
import {
  requestLogout,
  RequestMe,
  requestRefresh,
  requestSignIn,
  requestSignUp,
} from "../Handle/Auth";
import { isNullOrUndefined } from "util";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
  ) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  logout: () => Promise<boolean>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await requestRefresh();
      return data !== null;
    } catch {
      return false;
    }
  }, []);
  const logout = useCallback(async () => {
    try {
      const data = await requestLogout();
      setUser(null)
      return data !== null;
    } catch {
      return false;
    }
  }, []);

  const loadUser = useCallback(async () => {
    const me = await RequestMe();
    if (me) return me;

    const refreshed = await refresh();
    if (!refreshed) return null;

    return RequestMe();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    loadUser()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await requestSignIn(email, password);
      if (!data) return false;

      try {
        const me = await loadUser();
        setUser(me);
        return me !== null;
      } catch {
        setUser(null);
        return false;
      }
    },
    [loadUser],
  );
  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phoneNumber: string,
    ) => {
      const data = await requestSignUp(name, email, password, phoneNumber);
      if (!data) return false;

      try {
        const me = await loadUser();
        setUser(me);
        return me !== null;
      } catch {
        setUser(null);
        return false;
      }
    },
    [loadUser],
  );

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, signIn, signUp, refresh, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser precisa estar dentro de um UserProvider");
  }
  return context;
}
