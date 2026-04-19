import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const AuthContext = createContext(undefined);

const STORAGE_KEY = "qualitrack.auth.user";

const demoAccounts = [
  { role: "Admin", email: "admin@qualitrack.local", password: "Admin123!" },
  { role: "QC Inspector", email: "inspector@qualitrack.local", password: "Inspect123!" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const normalized = email.trim().toLowerCase();
      const match = demoAccounts.find(
        (a) => a.email.toLowerCase() === normalized && a.password === password,
      );
      if (!match) {
        throw new Error("Invalid email or password");
      }
      const next = { email: match.email, role: match.role };
      setUser(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      toast.success(`Welcome back, ${match.role}!`);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
