import { useState, useEffect } from "react";
import {
  listarUsuarios,
  listarEmprestimos,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
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
  Search,
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { resolverValor, formatarCPF, limparCPF } from "../../lib/formatadores";
import type {
  EmprestimoResponse,
  UsuarioCreate,
  UsuarioResponse,
  UsuarioStatus,
  UsuarioUpdate,
} from "../../types/api";

type FormularioNovoUsuario = Omit<UsuarioCreate, "dataCadastro">;

function obterMensagemErroApi(erro: unknown): string | undefined {
  if (typeof erro === "object" && erro !== null && "response" in erro) {
    const resposta = (erro as { response?: { data?: { detail?: string } } })
      .response;
    return resposta?.data?.detail;
  }
  return undefined;
}

export function GerenciarUsuarios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioResponse | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState<FormularioNovoUsuario>({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: "",
    senha: "",
    role: "user",
    status: "ativo",
  });

  const [editUser, setEditUser] = useState<UsuarioUpdate>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [usuariosData, emprestimosData] = await Promise.all([
        listarUsuarios(),
        listarEmprestimos(),
      ]);
      setUsuarios(usuariosData);
      setEmprestimos(emprestimosData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios
    .filter((u) => {
      const role = resolverValor(u.role);
      return role === "user";
    })
    .filter(
      (u) =>
        u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.cpf.includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleAddUser = async () => {
    if (!newUser.nome || !newUser.cpf || !newUser.email || !newUser.senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const hoje = new Date();
      const dataCadastro = hoje.toISOString().split("T")[0];
      const cpfLimpo = limparCPF(newUser.cpf);

      await criarUsuario({
        ...newUser,
        cpf: cpfLimpo,
        dataCadastro,
      });
      toast.success("Usuário cadastrado com sucesso!");
      setIsAddDialogOpen(false);
      setNewUser({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        endereco: "",
        senha: "",
        role: "user",
        status: "ativo",
      });
      carregarDados();
    } catch (error) {
      toast.error(obterMensagemErroApi(error) || "Erro ao cadastrar usuário");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await atualizarUsuario(selectedUser.id, editUser);
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      carregarDados();
    } catch (error) {
      toast.error(obterMensagemErroApi(error) || "Erro ao atualizar usuário");
    }
  };

  const handleSuspendUser = async (user: UsuarioResponse) => {
    const status = resolverValor(user.status) as UsuarioStatus;
    const novoStatus: UsuarioStatus =
      status === "suspenso" ? "ativo" : "suspenso";

    try {
      await atualizarUsuario(user.id, { status: novoStatus });
      if (novoStatus === "ativo") {
        toast.success(`Usuário ${user.nome} reativado!`);
      } else {
        toast.warning(`Usuário ${user.nome} foi suspenso.`);
      }
      carregarDados();
    } catch (error) {
      toast.error(obterMensagemErroApi(error) || "Erro ao alterar status");
    }
  };

  const handleDeleteUser = async (user: UsuarioResponse) => {
    if (!confirm(`Tem certeza que deseja remover ${user.nome} do sistema?`)) {
      return;
    }

    try {
      await deletarUsuario(user.id);
      toast.success(`Usuário ${user.nome} foi removido do sistema.`);
      carregarDados();
    } catch (error) {
      toast.error(obterMensagemErroApi(error) || "Erro ao remover usuário");
    }
  };

  const getUserEmprestimos = (userId: string) => {
    return emprestimos.filter((e) => {
      const status = resolverValor(e.status);
      return (
        e.usuarioId === userId && (status === "ativo" || status === "atrasado")
      );
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl mb-1">Gerenciar Usuários</h2>
          <p className="text-gray-600">
            {filteredUsuarios.length} usuários cadastrados
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Carregando usuários...
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchQuery
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado ainda"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Empréstimos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((user) => {
                  const emprestimosAtivos = getUserEmprestimos(user.id);

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{user.nome}</p>
                          <p className="text-xs text-gray-500">
                            Desde {user.dataCadastro}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatarCPF(user.cpf)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.telefone}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const status = resolverValor(user.status);
                          return (
                            <Badge
                              variant={
                                status === "ativo"
                                  ? "default"
                                  : status === "suspenso"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className={
                                status === "ativo" ? "bg-emerald-600" : ""
                              }
                            >
                              {status === "ativo" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativo
                                </>
                              ) : status === "suspenso" ? (
                                <>
                                  <Ban className="h-3 w-3 mr-1" />
                                  Suspenso
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inativo
                                </>
                              )}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {emprestimosAtivos}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendUser(user)}
                            className={
                              resolverValor(user.status) === "suspenso"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={newUser.nome}
                onChange={(e) =>
                  setNewUser({ ...newUser, nome: e.target.value })
                }
                placeholder="Nome do usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={newUser.cpf}
                onChange={(e) =>
                  setNewUser({ ...newUser, cpf: e.target.value })
                }
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={newUser.telefone ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={newUser.senha}
                onChange={(e) =>
                  setNewUser({ ...newUser, senha: e.target.value })
                }
                placeholder="Senha inicial"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={newUser.endereco ?? ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, endereco: e.target.value })
                }
                placeholder="Rua, número, bairro, cidade/estado"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Cadastrar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsEditDialogOpen(open);
            if (open) {
              setEditUser({
                nome: selectedUser.nome,
                email: selectedUser.email,
                telefone: selectedUser.telefone ?? "",
                endereco: selectedUser.endereco ?? "",
              });
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize os dados do usuário
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editUser.nome ?? ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={formatarCPF(selectedUser.cpf)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={editUser.email ?? ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editUser.telefone ?? ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, telefone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={editUser.endereco ?? ""}
                  onChange={(e) =>
                    setEditUser({ ...editUser, endereco: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditUser}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
