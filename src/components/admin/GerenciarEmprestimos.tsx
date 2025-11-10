import { useState, useEffect } from "react";
import {
  listarEmprestimos,
  listarObras,
  listarUsuarios,
  listarReservas,
  listarExemplares,
  criarEmprestimo,
  atualizarReserva,
} from "../../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Calendar,
  Plus,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  resolverValor,
  formatarData,
  calcularDiasRestantes,
} from "../../lib/formatadores";
import type {
  EmprestimoResponse,
  ExemplarResponse,
  ObraResponse,
  ReservaResponse,
  UsuarioResponse,
} from "../../types/api";

export function GerenciarEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [exemplares, setExemplares] = useState<ExemplarResponse[]>([]);
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEmprestimoDialogOpen, setIsNewEmprestimoDialogOpen] =
    useState(false);
  const [newEmprestimo, setNewEmprestimo] = useState({
    usuarioId: "",
    obraId: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [
        emprestimosData,
        reservasData,
        exemplaresData,
        obrasData,
        usuariosData,
      ] = await Promise.all([
        listarEmprestimos(),
        listarReservas(),
        listarExemplares(),
        listarObras(),
        listarUsuarios(),
      ]);
      setEmprestimos(emprestimosData);
      setReservas(reservasData);
      setExemplares(exemplaresData);
      setObras(obrasData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const emprestimosAtivos = emprestimos.filter((e) => {
    const status = resolverValor(e.status);
    return status === "ativo" || status === "atrasado";
  });
  const emprestimosAtrasados = emprestimos.filter(
    (e) => resolverValor(e.status) === "atrasado",
  );
  const historicoEmprestimos = emprestimos.filter(
    (e) => resolverValor(e.status) === "devolvido",
  );
  const reservasPendentes = reservas.filter(
    (r) => resolverValor(r.status) === "ativa",
  );

  const filteredEmprestimosAtivos = emprestimosAtivos.filter((emp) => {
    const usuario = usuarios.find((u) => u.id === emp.usuarioId);
    const obra = obras.find((o) => o.id === emp.obraId);
    return (
      usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra?.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.exemplarId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredHistorico = historicoEmprestimos.filter((emp) => {
    const usuario = usuarios.find((u) => u.id === emp.usuarioId);
    const obra = obras.find((o) => o.id === emp.obraId);
    return (
      usuario?.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra?.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleRegistrarEmprestimo = async () => {
    if (!newEmprestimo.usuarioId || !newEmprestimo.obraId) {
      toast.error("Selecione o usuário e a obra");
      return;
    }

    try {
      // Buscar obra
      const obra = obras.find((o) => o.id === newEmprestimo.obraId);
      if (!obra || obra.exemplaresDisponiveis <= 0) {
        toast.error("Não há exemplares disponíveis desta obra");
        return;
      }

      // Buscar primeiro exemplar disponível da obra
      const exemplarDisponivel = exemplares.find(
        (ex) =>
          ex.obraId === newEmprestimo.obraId && ex.status === "disponivel",
      );

      if (!exemplarDisponivel) {
        toast.error("Nenhum exemplar disponível encontrado");
        return;
      }

      const hoje = new Date();
      const dataEmprestimo = hoje.toISOString().split("T")[0];

      // Prazo de 14 dias
      const dataDevolucao = new Date(hoje);
      dataDevolucao.setDate(dataDevolucao.getDate() + 14);
      const dataPrevistaDevolucao = dataDevolucao.toISOString().split("T")[0];

      await criarEmprestimo({
        usuarioId: newEmprestimo.usuarioId,
        obraId: newEmprestimo.obraId,
        exemplarId: exemplarDisponivel.id,
        dataEmprestimo,
        dataPrevistaDevolucao,
        renovacoes: 0,
        status: "ativo",
      });

      toast.success("Empréstimo registrado com sucesso!", {
        description: `Devolução prevista para ${dataDevolucao.toLocaleDateString("pt-BR")}`,
      });
      setIsNewEmprestimoDialogOpen(false);
      setNewEmprestimo({ usuarioId: "", obraId: "" });
      carregarDados();
    } catch (error) {
      console.error("Erro ao registrar empréstimo:", error);
      toast.error("Erro ao registrar empréstimo");
    }
  };

  const handleAprovarReserva = async (reserva: ReservaResponse) => {
    try {
      const obra = obras.find((o) => o.id === reserva.obraId);
      if (!obra || obra.exemplaresDisponiveis <= 0) {
        toast.error("Não há exemplares disponíveis desta obra");
        return;
      }

      // Buscar primeiro exemplar disponível da obra
      const exemplarDisponivel = exemplares.find(
        (ex) => ex.obraId === reserva.obraId && ex.status === "disponivel",
      );

      if (!exemplarDisponivel) {
        toast.error("Nenhum exemplar disponível encontrado");
        return;
      }

      const hoje = new Date();
      const dataEmprestimo = hoje.toISOString().split("T")[0];

      const dataDevolucao = new Date(hoje);
      dataDevolucao.setDate(dataDevolucao.getDate() + 14);
      const dataPrevistaDevolucao = dataDevolucao.toISOString().split("T")[0];

      // Criar empréstimo com ID do exemplar real
      await criarEmprestimo({
        usuarioId: reserva.usuarioId,
        obraId: reserva.obraId,
        exemplarId: exemplarDisponivel.id,
        dataEmprestimo,
        dataPrevistaDevolucao,
        renovacoes: 0,
        status: "ativo",
      });

      // Atualizar reserva para concluída
      await atualizarReserva(reserva.id, {
        status: "concluida",
      });

      toast.success("Empréstimo criado a partir da reserva!", {
        description: `Devolução prevista: ${dataDevolucao.toLocaleDateString("pt-BR")}`,
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao aprovar reserva:", error);
      toast.error("Erro ao aprovar reserva");
    }
  };

  const handleRejeitarReserva = async (reserva: ReservaResponse) => {
    try {
      await atualizarReserva(reserva.id, {
        status: "cancelada",
      });
      toast.success("Reserva cancelada");
      carregarDados();
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast.error("Erro ao cancelar reserva");
    }
  };

  const obterNomeUsuario = (usuarioId: string) => {
    return usuarios.find((u) => u.id === usuarioId)?.nome || "Desconhecido";
  };

  const obterTituloObra = (obraId: string) => {
    return obras.find((o) => o.id === obraId)?.titulo || "Desconhecida";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl mb-1">
            Gerenciar Empréstimos e Reservas
          </h2>
          <p className="text-gray-600">
            {reservasPendentes.length} reservas pendentes,{" "}
            {emprestimosAtivos.length} ativos, {emprestimosAtrasados.length}{" "}
            atrasados
          </p>
        </div>
        <Button
          onClick={() => setIsNewEmprestimoDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Empréstimo
        </Button>
      </div>

      {/* Alertas */}
      {reservasPendentes.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Você tem {reservasPendentes.length} reserva(s) aguardando
                aprovação
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Clique na aba "Reservas Pendentes" para aprovar ou rejeitar
              </p>
            </div>
          </div>
        </Card>
      )}

      {emprestimosAtrasados.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-900">
                Há {emprestimosAtrasados.length} empréstimos atrasados que
                necessitam de atenção
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por usuário, obra ou código do exemplar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs defaultValue="reservas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reservas">
            Reservas Pendentes ({reservasPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="ativos">
            Ativos ({emprestimosAtivos.length})
          </TabsTrigger>
          <TabsTrigger value="historico">
            Histórico ({historicoEmprestimos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservas">
          <Card>
            {reservasPendentes.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma reserva pendente</p>
                <p className="text-sm text-gray-500 mt-2">
                  Quando usuários reservarem livros, elas aparecerão aqui para
                  aprovação
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead>Data da Reserva</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasPendentes.map((reserva) => {
                      const obra = obras.find((o) => o.id === reserva.obraId);
                      const exemplaresDisponiveis =
                        obra?.exemplaresDisponiveis ?? 0;
                      const disponivel = exemplaresDisponiveis > 0;
                      const diasExpiracao = calcularDiasRestantes(
                        reserva.dataExpiracao,
                      );

                      return (
                        <TableRow key={reserva.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">
                                {obterNomeUsuario(reserva.usuarioId)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">
                                {obterTituloObra(reserva.obraId)}
                              </p>
                              {disponivel ? (
                                <p className="text-xs text-emerald-600">
                                  {exemplaresDisponiveis} disponível(is)
                                </p>
                              ) : (
                                <p className="text-xs text-red-600">
                                  Sem exemplares disponíveis
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatarData(reserva.dataReserva)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">
                                {formatarData(reserva.dataExpiracao)}
                              </p>
                              {diasExpiracao <= 3 && diasExpiracao > 0 && (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {diasExpiracao} dias restantes
                                </p>
                              )}
                              {diasExpiracao <= 0 && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Expirada
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Aguardando
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAprovarReserva(reserva)}
                                disabled={!disponivel}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejeitarReserva(reserva)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="ativos">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Exemplar</TableHead>
                    <TableHead>Empréstimo</TableHead>
                    <TableHead>Devolução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renovações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmprestimosAtivos.map((emprestimo) => {
                    const daysRemaining = calcularDiasRestantes(
                      emprestimo.dataPrevistaDevolucao,
                    );
                    const isAtrasado =
                      emprestimo.status === "atrasado" || daysRemaining < 0;
                    const isProximoVencimento =
                      daysRemaining <= 3 && daysRemaining >= 0;

                    return (
                      <TableRow key={emprestimo.id}>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {obterNomeUsuario(emprestimo.usuarioId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {obterTituloObra(emprestimo.obraId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {emprestimo.exemplarId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatarData(emprestimo.dataEmprestimo)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">
                              {formatarData(emprestimo.dataPrevistaDevolucao)}
                            </p>
                            {!isAtrasado && daysRemaining >= 0 && (
                              <p className="text-xs text-gray-500">
                                {daysRemaining} dias restantes
                              </p>
                            )}
                            {isAtrasado && (
                              <p className="text-xs text-red-600">
                                {Math.abs(daysRemaining)} dias de atraso
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isAtrasado
                                ? "destructive"
                                : isProximoVencimento
                                  ? "secondary"
                                  : "default"
                            }
                            className={
                              !isAtrasado && !isProximoVencimento
                                ? "bg-emerald-600"
                                : ""
                            }
                          >
                            {isAtrasado ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Atrasado
                              </>
                            ) : isProximoVencimento ? (
                              <>
                                <Calendar className="h-3 w-3 mr-1" />
                                Vence em breve
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Em dia
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {emprestimo.renovacoes}/2 renovações
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Exemplar</TableHead>
                    <TableHead>Empréstimo</TableHead>
                    <TableHead>Devolução</TableHead>
                    <TableHead>Renovações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorico.map((emprestimo) => (
                    <TableRow key={emprestimo.id}>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {obterNomeUsuario(emprestimo.usuarioId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {obterTituloObra(emprestimo.obraId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {emprestimo.exemplarId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatarData(emprestimo.dataEmprestimo)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {emprestimo.dataDevolucao
                            ? formatarData(emprestimo.dataDevolucao)
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {emprestimo.renovacoes}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Emprestimo Dialog */}
      <Dialog
        open={isNewEmprestimoDialogOpen}
        onOpenChange={setIsNewEmprestimoDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Novo Empréstimo</DialogTitle>
            <DialogDescription>
              Selecione o usuário e a obra para criar um novo empréstimo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário *</Label>
              <Select
                value={newEmprestimo.usuarioId}
                onValueChange={(value: string) =>
                  setNewEmprestimo({
                    ...newEmprestimo,
                    usuarioId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios
                    .filter((u) => u.role === "user" && u.status === "ativo")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.nome} - {user.cpf}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obra">Obra *</Label>
              <Select
                value={newEmprestimo.obraId}
                onValueChange={(value: string) =>
                  setNewEmprestimo({
                    ...newEmprestimo,
                    obraId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras
                    .filter((o) => o.exemplaresDisponiveis > 0)
                    .map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.titulo} - {obra.autor} (
                        {obra.exemplaresDisponiveis} disponíveis)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <BookOpen className="inline h-4 w-4 mr-1" />O prazo de devolução
                será de 14 dias a partir da data de empréstimo.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewEmprestimoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarEmprestimo}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Registrar Empréstimo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
