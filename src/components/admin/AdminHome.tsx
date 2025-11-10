import { useState, useEffect } from "react";
import {
  listarObras,
  listarUsuarios,
  listarEmprestimos,
  listarReservas,
} from "../../lib/api";
import { Card } from "../ui/card";
import {
  Users,
  BookOpen,
  Clock,
  BookMarked,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { resolverValor } from "../../lib/formatadores";
import type {
  EmprestimoResponse,
  ObraResponse,
  ReservaResponse,
  UsuarioResponse,
} from "../../types/api";

interface ActivityItem {
  type: "emprestimo" | "devolucao" | "reserva" | "cadastro";
  user: string;
  action: string;
  item?: string | null;
  time: string;
}

type PopularObra = ObraResponse & { emprestados: number };

export function AdminHome() {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [obrasData, usuariosData, emprestimosData, reservasData] =
        await Promise.all([
          listarObras(),
          listarUsuarios(),
          listarEmprestimos(),
          listarReservas(),
        ]);
      setObras(obrasData);
      setUsuarios(usuariosData);
      setEmprestimos(emprestimosData);
      setReservas(reservasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  const totalObras = obras.length;
  const totalExemplares = obras.reduce(
    (sum, obra) => sum + (obra.totalExemplares ?? 0),
    0,
  );
  const exemplaresDisponiveis = obras.reduce(
    (sum, obra) => sum + (obra.exemplaresDisponiveis ?? 0),
    0,
  );

  const totalUsuarios = usuarios.filter(
    (usuario) => usuario.role === "user",
  ).length;

  const usuariosAtivos = usuarios.filter(
    (usuario) =>
      usuario.role === "user" && resolverValor(usuario.status) === "ativo",
  ).length;

  const emprestimosAtivos = emprestimos.filter((emprestimo) => {
    const status = resolverValor(emprestimo.status);
    return status === "ativo" || status === "atrasado";
  }).length;

  const emprestimosAtrasados = emprestimos.filter(
    (emprestimo) => resolverValor(emprestimo.status) === "atrasado",
  ).length;

  const reservasAtivas = reservas.filter(
    (reserva) => resolverValor(reserva.status) === "ativa",
  ).length;

  // Calcular retornos de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const retornamHoje = emprestimos.filter((emprestimo) => {
    const status = resolverValor(emprestimo.status);
    if (status !== "ativo") return false;

    const dataDevolucao = new Date(emprestimo.dataPrevistaDevolucao);
    return dataDevolucao >= hoje && dataDevolucao < amanha;
  }).length;

  const reservasPendentes = reservas.filter((reserva) => {
    const status = resolverValor(reserva.status);
    return status === "pendente";
  }).length;

  const stats = [
    {
      title: "Total de Usuários",
      value: totalUsuarios,
      subtitle: `${usuariosAtivos} ativos`,
      icon: Users,
      color: "bg-blue-500",
      trend: null,
    },
    {
      title: "Total de Obras",
      value: totalObras,
      subtitle: `${totalExemplares} exemplares`,
      icon: BookOpen,
      color: "bg-emerald-500",
      trend: null,
    },
    {
      title: "Empréstimos Ativos",
      value: emprestimosAtivos,
      subtitle: `${emprestimosAtrasados} atrasados`,
      icon: Clock,
      color: emprestimosAtrasados > 0 ? "bg-red-500" : "bg-purple-500",
      trend:
        retornamHoje > 0
          ? `${retornamHoje} retorna${retornamHoje > 1 ? "m" : ""} hoje`
          : null,
    },
    {
      title: "Reservas Ativas",
      value: reservasAtivas,
      subtitle: "Aguardando disponibilidade",
      icon: BookMarked,
      color: "bg-amber-500",
      trend:
        reservasPendentes > 0
          ? `${reservasPendentes} pendente${reservasPendentes > 1 ? "s" : ""}`
          : null,
    },
  ];

  // Atividades recentes vazias (será implementado depois se necessário)
  const recentActivity: ActivityItem[] = [];

  const obrasPopulares: PopularObra[] = obras
    .map((obra) => ({
      ...obra,
      emprestados:
        (obra.totalExemplares ?? 0) - (obra.exemplaresDisponiveis ?? 0),
    }))
    .sort((a, b) => b.emprestados - a.emprestados)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-900 text-2xl mb-1">Visão Geral do Sistema</h2>
        <p className="text-gray-600">
          Acompanhe as principais métricas da biblioteca
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-gray-900 text-3xl mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.subtitle}</p>
              </div>
              {stat.trend && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        {recentActivity.length > 0 ? (
          <Card className="p-6">
            <h3 className="text-gray-900 text-lg mb-4">Atividades Recentes</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {activity.type === "emprestimo" && (
                      <Clock className="h-4 w-4 text-emerald-600" />
                    )}
                    {activity.type === "devolucao" && (
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                    )}
                    {activity.type === "reserva" && (
                      <BookMarked className="h-4 w-4 text-emerald-600" />
                    )}
                    {activity.type === "cadastro" && (
                      <Users className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span>{activity.user}</span>{" "}
                      {activity.action.toLowerCase()}{" "}
                      {activity.item && <span>"{activity.item}"</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* Obras Mais Populares */}
        <Card className="p-6">
          <h3 className="text-gray-900 text-lg mb-4">Obras Mais Populares</h3>
          {obrasPopulares.length > 0 ? (
            <div className="space-y-4">
              {obrasPopulares.map((obra, index) => {
                const emprestados = obra.emprestados;
                const total = obra.totalExemplares || 1;
                const taxa = Math.round((emprestados / total) * 100);

                return (
                  <div
                    key={obra.id}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-gray-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {obra.titulo}
                      </p>
                      <p className="text-xs text-gray-500">{obra.autor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${taxa}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{taxa}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhuma obra emprestada ainda
            </p>
          )}
        </Card>
      </div>

      {/* Alertas */}
      {emprestimosAtrasados > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-900 mb-1">Empréstimos Atrasados</h3>
              <p className="text-sm text-red-700">
                Há {emprestimosAtrasados} empréstimos atrasados que requerem
                atenção. Acesse a seção de Empréstimos para mais detalhes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Taxa de Utilização */}
      <Card className="p-6">
        <h3 className="text-gray-900 text-lg mb-4">
          Taxa de Utilização do Acervo
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Exemplares em circulação
              </span>
              <span className="text-sm text-gray-900">
                {totalExemplares - exemplaresDisponiveis} / {totalExemplares}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{
                  width: `${((totalExemplares - exemplaresDisponiveis) / totalExemplares) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-2xl text-emerald-600">
                {totalExemplares - exemplaresDisponiveis}
              </p>
              <p className="text-xs text-gray-600">Emprestados</p>
            </div>
            <div>
              <p className="text-2xl text-gray-600">{exemplaresDisponiveis}</p>
              <p className="text-xs text-gray-600">Disponíveis</p>
            </div>
            <div>
              <p className="text-2xl text-amber-600">{reservasAtivas}</p>
              <p className="text-xs text-gray-600">Reservados</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
