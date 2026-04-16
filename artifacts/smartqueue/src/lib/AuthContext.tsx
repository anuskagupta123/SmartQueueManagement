import React, { createContext, useContext, useState } from "react";
import { User, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("smartqueue_token")
  );

  const { data: user, isLoading: isLoadingUser } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  const login = (newToken: string) => {
    localStorage.setItem("smartqueue_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("smartqueue_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        token,
        isLoading: !!token && isLoadingUser,
        login,
        logout,
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
