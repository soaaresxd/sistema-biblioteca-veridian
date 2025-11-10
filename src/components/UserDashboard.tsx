import { useState } from "react";
import { User } from "../App";
import {
  BookOpen,
  Search,
  Clock,
  BookMarked,
  User as UserIcon,
  LogOut,
  Home,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CatalogoObras } from "./user/CatalogoObras";
import { MeusEmprestimos } from "./user/MeusEmprestimos";
import { MinhasReservas } from "./user/MinhasReservas";
import { MeuPerfil } from "./user/MeuPerfil";

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = "home" | "emprestimos" | "reservas" | "perfil";

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { id: "home", label: "Catálogo", icon: Home },
    { id: "emprestimos", label: "Meus Empréstimos", icon: Clock },
    { id: "reservas", label: "Minhas Reservas", icon: BookMarked },
    { id: "perfil", label: "Meu Perfil", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-emerald-600 text-xl">Veridian</h1>
                <p className="text-xs text-gray-500">Sistema de Biblioteca</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm text-gray-900">{user.nome}</p>
                  <p className="text-xs text-gray-500">Usuário</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700">
                    {user.nome.charAt(0)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex gap-2 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === "home" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar obras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          {activeTab === "home" && (
            <CatalogoObras searchQuery={searchQuery} userId={user.id} />
          )}
          {activeTab === "emprestimos" && <MeusEmprestimos userId={user.id} />}
          {activeTab === "reservas" && <MinhasReservas userId={user.id} />}
          {activeTab === "perfil" && <MeuPerfil user={user} />}
        </div>
      </div>
    </div>
  );
}
