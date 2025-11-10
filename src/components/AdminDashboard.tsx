import { useState } from "react";
import { User } from "../App";
import {
  BookOpen,
  Users,
  BookMarked,
  BarChart3,
  LogOut,
  Home,
  Library,
} from "lucide-react";
import { Button } from "./ui/button";
import { AdminHome } from "./admin/AdminHome";
import { GerenciarUsuarios } from "./admin/GerenciarUsuarios";
import { GerenciarObras } from "./admin/GerenciarObras";
import { GerenciarEmprestimos } from "./admin/GerenciarEmprestimos";
import { Relatorios } from "./admin/Relatorios";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type TabType = "home" | "usuarios" | "obras" | "emprestimos" | "relatorios";

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const navigation = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "obras", label: "Obras", icon: Library },
    { id: "emprestimos", label: "Empréstimos", icon: BookMarked },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
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
                <p className="text-xs text-gray-500">Painel Administrativo</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm text-gray-900">{user.nome}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
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
        {/* Navigation Tabs */}
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

        {/* Content */}
        <div>
          {activeTab === "home" && <AdminHome />}
          {activeTab === "usuarios" && <GerenciarUsuarios />}
          {activeTab === "obras" && <GerenciarObras />}
          {activeTab === "emprestimos" && <GerenciarEmprestimos />}
          {activeTab === "relatorios" && <Relatorios />}
        </div>
      </div>
    </div>
  );
}
