import { useState, useEffect } from "react";
import { User } from "../../App";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import {
  buscarUsuario,
  listarEmprestimosPorUsuario,
  listarReservasPorUsuario,
} from "../../lib/api";
import { resolverValor } from "../../lib/formatadores";
import type {
  EmprestimoResponse,
  ReservaResponse,
  UsuarioResponse,
  UsuarioStatus,
} from "../../types/api";

function normalizarStatusUsuario(
  valor: string | { value?: string } | undefined,
): UsuarioStatus | null {
  const normalizado = resolverValor(valor).trim().toLowerCase();
  if (
    normalizado === "ativo" ||
    normalizado === "inativo" ||
    normalizado === "suspenso"
  ) {
    return normalizado as UsuarioStatus;
  }
  return null;
}

interface MeuPerfilProps {
  user: User;
}

export function MeuPerfil({ user }: MeuPerfilProps) {
  const [usuarioDetalhes, setUsuarioDetalhes] =
    useState<UsuarioResponse | null>(null);
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);

  useEffect(() => {
    carregarDados();
  }, [user.id]);

  const carregarDados = async () => {
    try {
      const [usuarioData, emprestimosData, reservasData] = await Promise.all([
        buscarUsuario(user.id),
        listarEmprestimosPorUsuario(user.id),
        listarReservasPorUsuario(user.id),
      ]);
      setUsuarioDetalhes(usuarioData);
      setEmprestimos(emprestimosData);
      setReservas(reservasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const meusEmprestimosAtivos = emprestimos.filter((emprestimo) => {
    const status = resolverValor(emprestimo.status);
    return status === "ativo" || status === "atrasado";
  }).length;

  const minhasReservasAtivas = reservas.filter((reserva) => {
    const status = resolverValor(reserva.status);
    return status === "ativa";
  }).length;

  const livrosDevolvidos = emprestimos.filter((emprestimo) => {
    const status = resolverValor(emprestimo.status);
    return status === "devolvido";
  }).length;

  const formatCPF = (cpf: string) => {
    if (!cpf) {
      return "";
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarData = (dataISO: string) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const usuarioStatus =
    normalizarStatusUsuario(usuarioDetalhes?.status) ?? "ativo";
  const statusLabels: Record<UsuarioStatus, string> = {
    ativo: "Conta ativa",
    inativo: "Conta inativa",
    suspenso: "Conta suspensa",
  };
  const statusClasses: Record<UsuarioStatus, string> = {
    ativo: "bg-emerald-600",
    inativo: "bg-gray-500",
    suspenso: "bg-amber-600",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-gray-900 text-2xl mb-1">Meu Perfil</h2>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 text-xl mb-1">{user.nome}</h3>
            <div className="flex items-center gap-2">
              <Badge className={statusClasses[usuarioStatus]}>
                {statusLabels[usuarioStatus]}
              </Badge>
              <span className="text-sm text-gray-600">
                Membro desde {formatarData(usuarioDetalhes?.dataCadastro ?? "")}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h3 className="text-gray-900 text-lg mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Informações Pessoais
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={user.nome}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formatCPF(user.cpf)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone
            </Label>
            <Input
              id="telefone"
              value={usuarioDetalhes?.telefone ?? "Não informado"}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="endereco"
              value={usuarioDetalhes?.endereco ?? "Não informado"}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataCadastro" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Cadastro
            </Label>
            <Input
              id="dataCadastro"
              value={formatarData(usuarioDetalhes?.dataCadastro ?? "")}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button className="bg-emerald-600 hover:bg-emerald-700" disabled>
            Editar Informações
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Para alterar suas informações, entre em contato com a administração
            da biblioteca
          </p>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="text-3xl text-emerald-600 mb-2">
            {meusEmprestimosAtivos}
          </div>
          <div className="text-sm text-gray-600">Empréstimos Ativos</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl text-emerald-600 mb-2">
            {minhasReservasAtivas}
          </div>
          <div className="text-sm text-gray-600">Reservas Ativas</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl text-emerald-600 mb-2">
            {livrosDevolvidos}
          </div>
          <div className="text-sm text-gray-600">Livros Devolvidos</div>
        </Card>
      </div>
    </div>
  );
}
