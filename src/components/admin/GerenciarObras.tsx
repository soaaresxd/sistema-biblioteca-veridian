import { useEffect, useMemo, useState } from "react";
import {
  listarObras,
  listarCategorias,
  criarObra,
  atualizarObra,
  deletarObra,
  criarCategoria,
} from "../../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, BookPlus, Edit, Trash2, Tag, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type {
  CategoriaResponse,
  ObraCreate,
  ObraResponse,
  ObraUpdate,
} from "../../types/api";

interface FormularioObra {
  titulo: string;
  autor: string;
  isbn: string;
  categoriaId: string;
  editora: string;
  anoPublicacao: string;
  descricao: string;
  totalExemplares: string;
  exemplaresDisponiveis: string;
  capa: string;
}

interface FormularioCategoria {
  nome: string;
  descricao: string;
}

function obterMensagemErroApi(erro: unknown): string | undefined {
  if (typeof erro === "object" && erro !== null && "response" in erro) {
    const resposta = (erro as { response?: { data?: { detail?: string } } })
      .response;
    return resposta?.data?.detail;
  }
  return undefined;
}

function criarFormularioObraPadrao(): FormularioObra {
  return {
    titulo: "",
    autor: "",
    isbn: "",
    categoriaId: "",
    editora: "",
    anoPublicacao: String(new Date().getFullYear()),
    descricao: "",
    totalExemplares: "1",
    exemplaresDisponiveis: "1",
    capa: "",
  };
}

function converterObraParaFormulario(obra: ObraResponse): FormularioObra {
  return {
    titulo: obra.titulo,
    autor: obra.autor,
    isbn: obra.isbn,
    categoriaId: obra.categoriaId,
    editora: obra.editora ?? "",
    anoPublicacao: obra.anoPublicacao ? String(obra.anoPublicacao) : "",
    descricao: obra.descricao ?? "",
    totalExemplares: String(obra.totalExemplares),
    exemplaresDisponiveis: String(obra.exemplaresDisponiveis),
    capa: obra.capa ?? "",
  };
}

export function GerenciarObras() {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [busca, setBusca] = useState("");
  const [dialogoObraAberto, setDialogoObraAberto] = useState(false);
  const [modoDialogoObra, setModoDialogoObra] = useState<"criar" | "editar">(
    "criar",
  );
  const [obraEmEdicaoId, setObraEmEdicaoId] = useState<string | null>(null);
  const [dialogoCategoriaAberto, setDialogoCategoriaAberto] = useState(false);
  const [formularioObra, setFormularioObra] = useState<FormularioObra>(
    criarFormularioObraPadrao(),
  );
  const [formularioCategoria, setFormularioCategoria] =
    useState<FormularioCategoria>({ nome: "", descricao: "" });

  useEffect(() => {
    void carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [obrasApi, categoriasApi] = await Promise.all([
        listarObras(),
        listarCategorias(),
      ]);
      setObras(obrasApi);
      setCategorias(categoriasApi);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      toast.error("Não foi possível carregar os dados do acervo");
    }
  };

  const obrasFiltradas = useMemo(() => {
    const filtro = busca.trim().toLowerCase();
    if (!filtro) {
      return obras;
    }
    return obras.filter(
      (obra) =>
        obra.titulo.toLowerCase().includes(filtro) ||
        obra.autor.toLowerCase().includes(filtro) ||
        obra.isbn.includes(busca),
    );
  }, [busca, obras]);

  const abrirDialogoNovaObra = () => {
    setModoDialogoObra("criar");
    setObraEmEdicaoId(null);
    setFormularioObra(criarFormularioObraPadrao());
    setDialogoObraAberto(true);
  };

  const editarObra = (obra: ObraResponse) => {
    setModoDialogoObra("editar");
    setObraEmEdicaoId(obra.id);
    setFormularioObra(converterObraParaFormulario(obra));
    setDialogoObraAberto(true);
  };

  const salvarObra = async () => {
    if (
      !formularioObra.titulo ||
      !formularioObra.autor ||
      !formularioObra.isbn ||
      !formularioObra.categoriaId
    ) {
      toast.error("Preencha os campos obrigatórios antes de continuar");
      return;
    }

    try {
      const totalExemplares = Math.max(
        1,
        Number.parseInt(formularioObra.totalExemplares, 10) || 1,
      );
      const exemplaresDisponiveisInformados = Number.parseInt(
        formularioObra.exemplaresDisponiveis,
        10,
      );
      const anoPublicacaoNumero = Number.parseInt(
        formularioObra.anoPublicacao,
        10,
      );
      const exemplaresDisponiveis = Number.isNaN(
        exemplaresDisponiveisInformados,
      )
        ? totalExemplares
        : Math.min(
            Math.max(exemplaresDisponiveisInformados, 0),
            totalExemplares,
          );

      const dadosBase = {
        titulo: formularioObra.titulo,
        autor: formularioObra.autor,
        isbn: formularioObra.isbn,
        categoriaId: formularioObra.categoriaId,
        editora: formularioObra.editora ? formularioObra.editora : null,
        anoPublicacao: Number.isNaN(anoPublicacaoNumero)
          ? null
          : anoPublicacaoNumero,
        descricao: formularioObra.descricao ? formularioObra.descricao : null,
        totalExemplares,
        exemplaresDisponiveis,
        capa: formularioObra.capa ? formularioObra.capa : null,
      };

      if (modoDialogoObra === "criar") {
        const payload: ObraCreate = { ...dadosBase };
        await criarObra(payload);
        toast.success("Obra cadastrada com sucesso");
      } else if (modoDialogoObra === "editar" && obraEmEdicaoId) {
        const payload: ObraUpdate = { ...dadosBase };
        await atualizarObra(obraEmEdicaoId, payload);
        toast.success("Obra atualizada com sucesso");
      }

      setDialogoObraAberto(false);
      setFormularioObra(criarFormularioObraPadrao());
      setObraEmEdicaoId(null);
      setModoDialogoObra("criar");
      carregarDados();
    } catch (erro) {
      const mensagemPadrao =
        modoDialogoObra === "criar"
          ? "Erro ao cadastrar obra"
          : "Erro ao atualizar obra";
      toast.error(obterMensagemErroApi(erro) || mensagemPadrao);
    }
  };

  const alterarDialogoObra = (aberto: boolean) => {
    setDialogoObraAberto(aberto);
    if (!aberto) {
      setFormularioObra(criarFormularioObraPadrao());
      setObraEmEdicaoId(null);
      setModoDialogoObra("criar");
    }
  };

  const criarNovaCategoria = async () => {
    if (!formularioCategoria.nome) {
      toast.error("Informe o nome da categoria");
      return;
    }

    try {
      await criarCategoria(formularioCategoria);
      toast.success("Categoria cadastrada com sucesso");
      setDialogoCategoriaAberto(false);
      setFormularioCategoria({ nome: "", descricao: "" });
      carregarDados();
    } catch (erro) {
      toast.error(obterMensagemErroApi(erro) || "Erro ao cadastrar categoria");
    }
  };

  const excluirObra = async (obra: ObraResponse) => {
    try {
      await deletarObra(obra.id);
      toast.success(`Obra "${obra.titulo}" removida do acervo`);
      carregarDados();
    } catch (erro) {
      toast.error(obterMensagemErroApi(erro) || "Erro ao remover obra");
    }
  };

  const excluirCategoria = (categoria: CategoriaResponse) => {
    toast.success(`Categoria "${categoria.nome}" removida`);
  };

  const nomeCategoria = (categoriaId: string) => {
    return (
      categorias.find((categoria) => categoria.id === categoriaId)?.nome ||
      "Sem categoria"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl mb-1">Gerenciar Acervo</h2>
          <p className="text-gray-600">Obras e categorias cadastradas</p>
        </div>
      </div>

      <Tabs defaultValue="obras" className="space-y-6">
        <TabsList>
          <TabsTrigger value="obras" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Obras ({obras.length})
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias ({categorias.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obras" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar obras por título, autor ou ISBN"
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>
            <Button
              onClick={abrirDialogoNovaObra}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <BookPlus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {obrasFiltradas.map((obra) => {
              const total = obra.totalExemplares || 1;
              const disponibilidade = Math.round(
                ((obra.exemplaresDisponiveis || 0) / total) * 100,
              );

              return (
                <Card key={obra.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {obra.capa ? (
                        <img
                          src={obra.capa}
                          alt={obra.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 truncate">
                            {obra.titulo}
                          </h3>
                          <p className="text-sm text-gray-600">{obra.autor}</p>
                        </div>
                        <Badge className="ml-2 bg-emerald-600">
                          {nomeCategoria(obra.categoriaId)}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-gray-500">
                        <p>ISBN: {obra.isbn}</p>
                        <p>
                          {obra.editora ?? "Editora não informada"},{" "}
                          {obra.anoPublicacao ?? "Ano desconhecido"}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Disponibilidade</span>
                          <span className="text-gray-900">
                            {obra.exemplaresDisponiveis}/{obra.totalExemplares}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${disponibilidade}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editarObra(obra)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirObra(obra)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setDialogoCategoriaAberto(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Tag className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((categoria) => {
              const obrasDaCategoria = obras.filter(
                (obra) => obra.categoriaId === categoria.id,
              ).length;

              return (
                <Card key={categoria.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{categoria.nome}</h3>
                      <p className="text-sm text-gray-600">
                        {categoria.descricao}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => excluirCategoria(categoria)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {obrasDaCategoria} obras nesta categoria
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogoObraAberto} onOpenChange={alterarDialogoObra}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoDialogoObra === "criar"
                ? "Cadastrar Nova Obra"
                : "Editar Obra"}
            </DialogTitle>
            <DialogDescription>
              {modoDialogoObra === "criar"
                ? "Informe os dados da obra"
                : "Atualize os dados necessários"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formularioObra.titulo}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      titulo: evento.target.value,
                    })
                  }
                  placeholder="Título da obra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="autor">Autor *</Label>
                <Input
                  id="autor"
                  value={formularioObra.autor}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      autor: evento.target.value,
                    })
                  }
                  placeholder="Nome do autor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  value={formularioObra.isbn}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      isbn: evento.target.value,
                    })
                  }
                  placeholder="000-0000000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formularioObra.categoriaId}
                  onValueChange={(valor: string) =>
                    setFormularioObra({ ...formularioObra, categoriaId: valor })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editora">Editora</Label>
                <Input
                  id="editora"
                  value={formularioObra.editora}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      editora: evento.target.value,
                    })
                  }
                  placeholder="Nome da editora"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano de Publicação</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formularioObra.anoPublicacao}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      anoPublicacao: evento.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Número de Exemplares</Label>
                <Input
                  id="total"
                  type="number"
                  min="1"
                  value={formularioObra.totalExemplares}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      totalExemplares: evento.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disponiveis">Exemplares Disponíveis</Label>
                <Input
                  id="disponiveis"
                  type="number"
                  min="0"
                  value={formularioObra.exemplaresDisponiveis}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      exemplaresDisponiveis: evento.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="capa">URL da Capa</Label>
                <Input
                  id="capa"
                  value={formularioObra.capa}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      capa: evento.target.value,
                    })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formularioObra.descricao}
                  onChange={(evento) =>
                    setFormularioObra({
                      ...formularioObra,
                      descricao: evento.target.value,
                    })
                  }
                  placeholder="Breve descrição da obra"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => alterarDialogoObra(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvarObra}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {modoDialogoObra === "criar"
                ? "Cadastrar Obra"
                : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogoCategoriaAberto}
        onOpenChange={setDialogoCategoriaAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Cadastre uma nova categoria para o acervo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCategoria">Nome da Categoria *</Label>
              <Input
                id="nomeCategoria"
                value={formularioCategoria.nome}
                onChange={(evento) =>
                  setFormularioCategoria({
                    ...formularioCategoria,
                    nome: evento.target.value,
                  })
                }
                placeholder="Ex: Romance, Suspense, Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricaoCategoria">Descrição</Label>
              <Textarea
                id="descricaoCategoria"
                value={formularioCategoria.descricao}
                onChange={(evento) =>
                  setFormularioCategoria({
                    ...formularioCategoria,
                    descricao: evento.target.value,
                  })
                }
                placeholder="Breve descrição da categoria"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogoCategoriaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={criarNovaCategoria}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
