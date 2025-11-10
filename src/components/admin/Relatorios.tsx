import { useEffect, useState } from "react";
import {
  listarCategorias,
  listarEmprestimos,
  listarObras,
  listarReservas,
  listarUsuarios,
} from "../../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  Clock,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type {
  CategoriaResponse,
  EmprestimoResponse,
  ObraResponse,
  ReservaResponse,
  UsuarioResponse,
} from "../../types/api";

type RelatorioTipo = "Usuários" | "Acervo" | "Empréstimos" | "Reservas";
type CsvRow = Record<string, string | number>;

const RELATORIO_HEADERS: Record<RelatorioTipo, string[]> = {
  Usuários: ["Nome", "CPF", "Email", "Telefone", "Status", "Data Cadastro"],
  Acervo: [
    "Título",
    "Autor",
    "ISBN",
    "Editora",
    "Ano Publicação",
    "Total Exemplares",
    "Exemplares Disponíveis",
  ],
  Empréstimos: [
    "Usuário",
    "Obra",
    "Data Empréstimo",
    "Data Devolução Prevista",
    "Data Devolução",
    "Status",
    "Renovações",
  ],
  Reservas: ["Usuário", "Obra", "Data Reserva", "Data Expiração", "Status"],
};

const RELATORIO_FILENAME: Record<RelatorioTipo, string> = {
  Usuários: "relatorio-usuarios.csv",
  Acervo: "relatorio-acervo.csv",
  Empréstimos: "relatorio-emprestimos.csv",
  Reservas: "relatorio-reservas.csv",
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function formatCsvValue(value: string | number): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizeTelefone(value?: string | null): string {
  return value && value.trim() ? value : "N/A";
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: CsvRow[],
  toastLabel: string,
) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => formatCsvValue(row[header] ?? "")).join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`${toastLabel} exportado com sucesso!`, {
    description: `${rows.length} registros exportados para ${filename}`,
  });
}

export function Relatorios() {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);

  useEffect(() => {
    void carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [
        obrasData,
        usuariosData,
        emprestimosData,
        reservasData,
        categoriasData,
      ] = await Promise.all([
        listarObras(),
        listarUsuarios(),
        listarEmprestimos(),
        listarReservas(),
        listarCategorias(),
      ]);
      setObras(obrasData);
      setUsuarios(usuariosData);
      setEmprestimos(emprestimosData);
      setReservas(reservasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const usuariosPorId = new Map(
    usuarios.map((usuario) => [usuario.id, usuario]),
  );
  const obrasPorId = new Map(obras.map((obra) => [obra.id, obra]));

  const handleExportRelatorio = (tipo: RelatorioTipo) => {
    const headers = RELATORIO_HEADERS[tipo];
    const filename = RELATORIO_FILENAME[tipo];
    let dados: CsvRow[] = [];

    if (tipo === "Usuários") {
      dados = usuarios
        .filter((usuario) => usuario.role === "user")
        .map((usuario) => ({
          Nome: usuario.nome,
          CPF: usuario.cpf,
          Email: usuario.email,
          Telefone: normalizeTelefone(usuario.telefone),
          Status: usuario.status,
          "Data Cadastro": usuario.dataCadastro,
        }));
    }

    if (tipo === "Acervo") {
      dados = obras.map((obra) => ({
        Título: obra.titulo,
        Autor: obra.autor,
        ISBN: obra.isbn,
        Editora: obra.editora ?? "N/A",
        "Ano Publicação": obra.anoPublicacao ?? "N/A",
        "Total Exemplares": obra.totalExemplares,
        "Exemplares Disponíveis": obra.exemplaresDisponiveis,
      }));
    }

    if (tipo === "Empréstimos") {
      dados = emprestimos.map((emprestimo) => {
        const usuario = usuariosPorId.get(emprestimo.usuarioId);
        const obra = obrasPorId.get(emprestimo.obraId);
        return {
          Usuário: usuario?.nome ?? "N/A",
          Obra: obra?.titulo ?? "N/A",
          "Data Empréstimo": emprestimo.dataEmprestimo,
          "Data Devolução Prevista": emprestimo.dataPrevistaDevolucao,
          "Data Devolução": emprestimo.dataDevolucao ?? "Não devolvido",
          Status: emprestimo.status,
          Renovações: emprestimo.renovacoes,
        };
      });
    }

    if (tipo === "Reservas") {
      dados = reservas.map((reserva) => {
        const usuario = usuariosPorId.get(reserva.usuarioId);
        const obra = obrasPorId.get(reserva.obraId);
        return {
          Usuário: usuario?.nome ?? "N/A",
          Obra: obra?.titulo ?? "N/A",
          "Data Reserva": reserva.dataReserva,
          "Data Expiração": reserva.dataExpiracao,
          Status: reserva.status,
        };
      });
    }

    downloadCsv(filename, headers, dados, `Relatório de ${tipo}`);
  };

  const totalUsuarios = usuarios.filter(
    (usuario) => usuario.role === "user",
  ).length;
  const usuariosAtivos = usuarios.filter(
    (usuario) => usuario.role === "user" && usuario.status === "ativo",
  ).length;

  const totalExemplares = obras.reduce(
    (soma, obra) => soma + obra.totalExemplares,
    0,
  );
  const emprestimosAtivos = emprestimos.filter(
    (emprestimo) =>
      emprestimo.status === "ativo" || emprestimo.status === "atrasado",
  ).length;
  const emprestimosAtrasados = emprestimos.filter(
    (emprestimo) => emprestimo.status === "atrasado",
  ).length;
  const reservasAtivas = reservas.filter(
    (reserva) => reserva.status === "ativa",
  ).length;

  const obraEmprestimosCount = emprestimos.reduce<Record<string, number>>(
    (acc, emprestimo) => {
      acc[emprestimo.obraId] = (acc[emprestimo.obraId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const obrasMaisEmprestadas = Object.entries(obraEmprestimosCount)
    .map(([obraId, count]) => {
      const obra = obrasPorId.get(obraId);
      return obra ? { obra, count } : null;
    })
    .filter(
      (item): item is { obra: ObraResponse; count: number } => item !== null,
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const usuarioEmprestimosCount = emprestimos.reduce<Record<string, number>>(
    (acc, emprestimo) => {
      acc[emprestimo.usuarioId] = (acc[emprestimo.usuarioId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const usuariosMaisAtivos = Object.entries(usuarioEmprestimosCount)
    .map(([usuarioId, count]) => {
      const usuario = usuariosPorId.get(usuarioId);
      return usuario ? { usuario, count } : null;
    })
    .filter(
      (item): item is { usuario: UsuarioResponse; count: number } =>
        item !== null,
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const categoriaObrasCount = categorias.map((categoria) => ({
    categoria,
    count: obras.filter((obra) => obra.categoriaId === categoria.id).length,
  }));

  const exemplaresEmprestados =
    totalExemplares -
    obras.reduce((soma, obra) => soma + obra.exemplaresDisponiveis, 0);
  const taxaCirculacao =
    totalExemplares > 0
      ? ((exemplaresEmprestados / totalExemplares) * 100).toFixed(1)
      : "0.0";

  const emprestimosFinalizados = emprestimos.filter(
    (emprestimo) =>
      emprestimo.status === "devolvido" && emprestimo.dataDevolucao,
  );

  const tempoMedioEmprestimo =
    emprestimosFinalizados.length > 0
      ? emprestimosFinalizados.reduce((soma, emprestimo) => {
          const dataEmprestimo = new Date(emprestimo.dataEmprestimo);
          const dataDevolucao = new Date(
            emprestimo.dataDevolucao ?? emprestimo.dataPrevistaDevolucao,
          );
          if (
            Number.isNaN(dataEmprestimo.getTime()) ||
            Number.isNaN(dataDevolucao.getTime())
          ) {
            return soma;
          }
          const dias = Math.max(
            0,
            Math.round(
              (dataDevolucao.getTime() - dataEmprestimo.getTime()) / MS_PER_DAY,
            ),
          );
          return soma + dias;
        }, 0) / emprestimosFinalizados.length
      : 0;

  const emprestimosRenovados = emprestimos.filter(
    (emprestimo) => emprestimo.renovacoes > 0,
  ).length;
  const taxaRenovacao =
    emprestimos.length > 0
      ? ((emprestimosRenovados / emprestimos.length) * 100).toFixed(0)
      : "0";

  const taxaAtraso =
    emprestimos.length > 0
      ? ((emprestimosAtrasados / emprestimos.length) * 100).toFixed(0)
      : "0";

  const handleExportObrasMaisEmprestadas = () => {
    if (obrasMaisEmprestadas.length === 0) {
      toast.info("Nenhuma obra com empréstimos para exportar");
      return;
    }

    const headers = ["Posição", "Título", "Autor", "Empréstimos"];
    const rows: CsvRow[] = obrasMaisEmprestadas.map((item, index) => ({
      Posição: index + 1,
      Título: item.obra.titulo,
      Autor: item.obra.autor,
      Empréstimos: item.count,
    }));

    downloadCsv(
      "obras-mais-emprestadas.csv",
      headers,
      rows,
      "Ranking de obras",
    );
  };

  const handleExportUsuariosMaisAtivos = () => {
    if (usuariosMaisAtivos.length === 0) {
      toast.info("Nenhum usuário ativo em empréstimos para exportar");
      return;
    }

    const headers = ["Posição", "Nome", "Email", "Empréstimos"];
    const rows: CsvRow[] = usuariosMaisAtivos.map((item, index) => ({
      Posição: index + 1,
      Nome: item.usuario.nome,
      Email: item.usuario.email,
      Empréstimos: item.count,
    }));

    downloadCsv(
      "usuarios-mais-ativos.csv",
      headers,
      rows,
      "Ranking de usuários",
    );
  };

  const handleExportDistribuicaoCategorias = () => {
    if (categoriaObrasCount.length === 0) {
      toast.info("Nenhuma categoria cadastrada para exportar");
      return;
    }

    const headers = ["Categoria", "Total de Obras"];
    const rows: CsvRow[] = categoriaObrasCount
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        Categoria: item.categoria.nome,
        "Total de Obras": item.count,
      }));

    downloadCsv(
      "distribuicao-categorias.csv",
      headers,
      rows,
      "Distribuição por categoria",
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gray-900 text-2xl mb-1">
          Relatórios e Estatísticas
        </h2>
        <p className="text-gray-600">
          Análise detalhada das operações da biblioteca
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Usuários Ativos</p>
          <p className="text-gray-900 text-3xl mb-1">{usuariosAtivos}</p>
          <p className="text-xs text-gray-500">
            de {totalUsuarios} cadastrados
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Taxa de Circulação</p>
          <p className="text-gray-900 text-3xl mb-1">{taxaCirculacao}%</p>
          <p className="text-xs text-gray-500">
            {totalExemplares} exemplares no acervo
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            {emprestimosAtrasados > 0 && (
              <TrendingUp className="h-4 w-4 text-red-600" />
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Empréstimos Ativos</p>
          <p className="text-gray-900 text-3xl mb-1">{emprestimosAtivos}</p>
          <p className="text-xs text-gray-500">
            {emprestimosAtrasados} atrasados
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <BookMarked className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Reservas Ativas</p>
          <p className="text-gray-900 text-3xl mb-1">{reservasAtivas}</p>
          <p className="text-xs text-gray-500">aguardando disponibilidade</p>
        </Card>
      </div>

      {/* Exportar Relatórios */}
      <Card className="p-6">
        <h3 className="text-gray-900 text-lg mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-600" />
          Exportar Relatórios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => handleExportRelatorio("Usuários")}
            className="h-auto flex-col py-4 gap-2"
          >
            <Users className="h-6 w-6" />
            <span>Usuários</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportRelatorio("Acervo")}
            className="h-auto flex-col py-4 gap-2"
          >
            <BookOpen className="h-6 w-6" />
            <span>Acervo</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportRelatorio("Empréstimos")}
            className="h-auto flex-col py-4 gap-2"
          >
            <Clock className="h-6 w-6" />
            <span>Empréstimos</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportRelatorio("Reservas")}
            className="h-auto flex-col py-4 gap-2"
          >
            <BookMarked className="h-6 w-6" />
            <span>Reservas</span>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Obras mais emprestadas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Obras Mais Emprestadas
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportObrasMaisEmprestadas}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {obrasMaisEmprestadas.length > 0 ? (
              obrasMaisEmprestadas.map((item, index) => {
                if (!item.obra) return null;
                const maxCount = obrasMaisEmprestadas[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={item.obra.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-emerald-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900 truncate">
                            {item.obra.titulo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.obra.autor}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {item.count}
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum empréstimo registrado ainda
              </p>
            )}
          </div>
        </Card>

        {/* Usuários mais ativos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Usuários Mais Ativos
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportUsuariosMaisAtivos}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {usuariosMaisAtivos.length > 0 ? (
              usuariosMaisAtivos.map((item, index) => {
                if (!item.usuario) return null;
                const maxCount = usuariosMaisAtivos[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={item.usuario.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-blue-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900 truncate">
                            {item.usuario.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.usuario.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {item.count}
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum empréstimo registrado ainda
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Distribuição por categorias */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Distribuição do Acervo por Categoria
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportDistribuicaoCategorias}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriaObrasCount
            .sort((a, b) => b.count - a.count)
            .map((item) => (
              <Card key={item.categoria.id} className="p-4 text-center">
                <div className="text-3xl text-emerald-600 mb-2">
                  {item.count}
                </div>
                <div className="text-sm text-gray-900 mb-1">
                  {item.categoria.nome}
                </div>
                <div className="text-xs text-gray-500">obras</div>
              </Card>
            ))}
        </div>
      </Card>

      {/* Métricas de Performance */}
      <Card className="p-6">
        <h3 className="text-gray-900 text-lg mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Métricas de Performance
        </h3>
        {emprestimos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Tempo Médio de Empréstimo</p>
              <p className="text-2xl text-gray-900">
                {tempoMedioEmprestimo > 0
                  ? Math.round(tempoMedioEmprestimo)
                  : 0}{" "}
                dias
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Taxa de Renovação</p>
              <p className="text-2xl text-gray-900">{taxaRenovacao}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Taxa de Atraso</p>
              <p className="text-2xl text-gray-900">{taxaAtraso}%</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhum empréstimo registrado para calcular métricas
          </p>
        )}
      </Card>
    </div>
  );
}
