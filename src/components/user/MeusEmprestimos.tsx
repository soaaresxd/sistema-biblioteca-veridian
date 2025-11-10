import { useState, useEffect } from "react";
import {
  listarEmprestimosPorUsuario,
  listarObras,
  renovarEmprestimo,
  atualizarEmprestimo,
} from "../../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, RotateCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { EmprestimoResponse, ObraResponse } from "../../types/api";

interface MeusEmprestimosProps {
  userId: string;
}

export function MeusEmprestimos({ userId }: MeusEmprestimosProps) {
  const [emprestimos, setEmprestimos] = useState<EmprestimoResponse[]>([]);
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [emprestimosData, obrasData] = await Promise.all([
        listarEmprestimosPorUsuario(userId),
        listarObras(),
      ]);
      setEmprestimos(emprestimosData);
      setObras(obrasData);
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
      toast.error("Erro ao carregar empréstimos");
    } finally {
      setLoading(false);
    }
  };

  const emprestimosAtivos = emprestimos.filter(
    (emp) => emp.status === "ativo" || emp.status === "atrasado"
  );
  const historico = emprestimos.filter((emp) => emp.status === "devolvido");

  const handleRenovar = async (emprestimo: EmprestimoResponse) => {
    if (emprestimo.renovacoes >= 2) {
      toast.error("Limite de renovações atingido", {
        description: "Este empréstimo já foi renovado 2 vezes.",
      });
      return;
    }

    try {
      await renovarEmprestimo(emprestimo.id);
      toast.success("Empréstimo renovado!", {
        description: "Prazo estendido por mais 14 dias.",
      });
      carregarDados();
    } catch (error) {
      toast.error("Erro ao renovar empréstimo");
    }
  };

  const handleDevolver = async (emprestimo: EmprestimoResponse) => {
    try {
      const hoje = new Date();
      const dataDevolucao = hoje.toISOString().split("T")[0];

      await atualizarEmprestimo(emprestimo.id, {
        dataDevolucao,
        status: "devolvido",
      });

      toast.success("Devolução registrada com sucesso!", {
        description: "Obrigado por devolver o livro.",
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);
      toast.error("Erro ao registrar devolução");
    }
  };

  const getObra = (obraId: string) => {
    return obras.find((obra) => obra.id === obraId);
  };

  const getDaysRemaining = (dataPrevista: string) => {
    const today = new Date();
    const dueDate = new Date(dataPrevista);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando empréstimos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Empréstimos Ativos */}
      <div>
        <h2 className="text-gray-900 text-2xl mb-4">Empréstimos Ativos</h2>

        {emprestimosAtivos.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Você não possui empréstimos ativos</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {emprestimosAtivos.map((emprestimo) => {
              const obra = getObra(emprestimo.obraId);
              if (!obra) return null;

              const daysRemaining = getDaysRemaining(
                emprestimo.dataPrevistaDevolucao
              );
              const isAtrasado =
                emprestimo.status === "atrasado" || daysRemaining < 0;
              const isProximoVencimento =
                daysRemaining <= 3 && daysRemaining >= 0;

              return (
                <Card key={emprestimo.id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0"></div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-gray-900 mb-1">
                              {obra.titulo}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {obra.autor}
                            </p>
                          </div>
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
                            {isAtrasado
                              ? "Atrasado"
                              : isProximoVencimento
                              ? "Vence em breve"
                              : "Em dia"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Emprestado em{" "}
                              {formatDate(emprestimo.dataEmprestimo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Devolução:{" "}
                              {formatDate(emprestimo.dataPrevistaDevolucao)}
                            </span>
                          </div>
                        </div>

                        {isAtrasado && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded mt-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Este empréstimo está atrasado há{" "}
                              {Math.abs(daysRemaining)} dias. Por favor, devolva
                              o mais rápido possível.
                            </span>
                          </div>
                        )}

                        {isProximoVencimento && !isAtrasado && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded mt-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Faltam {daysRemaining} dias para a devolução
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <span>Renovações: {emprestimo.renovacoes}/2</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDevolver(emprestimo)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Devolver
                          </Button>
                          <Button
                            onClick={() => handleRenovar(emprestimo)}
                            disabled={emprestimo.renovacoes >= 2 || isAtrasado}
                            variant="outline"
                            size="sm"
                          >
                            <RotateCw className="h-4 w-4 mr-2" />
                            Renovar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div>
          <h2 className="text-gray-900 text-2xl mb-4">
            Histórico de Empréstimos
          </h2>
          <div className="space-y-4">
            {historico.map((emprestimo) => {
              const obra = getObra(emprestimo.obraId);
              if (!obra) return null;

              return (
                <Card key={emprestimo.id} className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 mb-1">{obra.titulo}</h3>
                      <p className="text-sm text-gray-600">{obra.autor}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>
                          Emprestado: {formatDate(emprestimo.dataEmprestimo)}
                        </span>
                        <span>
                          Devolvido:{" "}
                          {emprestimo.dataDevolucao
                            ? formatDate(emprestimo.dataDevolucao)
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Devolvido
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
