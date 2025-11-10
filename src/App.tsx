import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import type { UsuarioResponse, UsuarioRole } from "./types/api";

export type UserRole = UsuarioRole | null;

export type User = Pick<
  UsuarioResponse,
  "id" | "nome" | "cpf" | "email" | "role"
>;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <>
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <UserDashboard user={currentUser} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}

export default App;
