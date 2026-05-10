import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, logoutRequest, type User } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
  isAdmin: boolean;
  isPartner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: meData, error, isFetched } = useGetMe({
    query: {
      retry: false,
      queryKey: getGetMeQueryKey() as any,
    },
  });

  useEffect(() => {
    if (meData) setUser(meData);
  }, [meData]);

  useEffect(() => {
    const status = (error as any)?.response?.status ?? (error as any)?.status;
    if (error && (status === 401 || status === 403 || status === 404)) {
      setUser(null);
    }
  }, [error]);

  const login = (_token: string, newUser: User) => {
    setUser(newUser);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() as any });
  };

  const logout = () => {
    logoutRequest();
    setUser(null);
    queryClient.clear();
  };

  const isAuthResolved = isFetched;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner" || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        login,
        logout,
        isAuthenticated,
        isAuthResolved,
        isAdmin,
        isPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
