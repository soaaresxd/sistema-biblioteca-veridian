import { useState, useEffect } from "react";
import {
  listarReservasPorUsuario,
  listarObras,
  cancelarReserva,
} from "../../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, X, CheckCircle, BookMarked } from "lucide-react";
import { toast } from "sonner";
import type { ObraResponse, ReservaResponse } from "../../types/api";

interface MinhasReservasProps {
  userId: string;
}

export function MinhasReservas({ userId }: MinhasReservasProps) {
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [reservasData, obrasData] = await Promise.all([
        listarReservasPorUsuario(userId),
        listarObras(),
      ]);
      setReservas(reservasData);
      setObras(obrasData);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      toast.error("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  const reservasAtivas = reservas.filter((res) => res.status === "ativa");
  const historicoReservas = reservas.filter((res) => res.status !== "ativa");

  const handleCancelar = async (reserva: ReservaResponse) => {
    try {
      await cancelarReserva(reserva.id);
      toast.success("Reserva cancelada", {
        description: "A reserva foi cancelada com sucesso.",
      });
      carregarDados();
    } catch (error) {
      toast.error("Erro ao cancelar reserva");
    }
  };

  const getObra = (obraId: string) => {
    return obras.find((obra) => obra.id === obraId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getDaysUntilExpiration = (dataExpiracao: string) => {
    const today = new Date();
    const expDate = new Date(dataExpiracao);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando reservas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reservas Ativas */}
      <div>
        <h2 className="text-gray-900 text-2xl mb-4">Reservas Ativas</h2>

        {reservasAtivas.length === 0 ? (
          <Card className="p-8 text-center">
            <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Você não possui reservas ativas</p>
            <p className="text-sm text-gray-500 mt-2">
              Reserve livros indisponíveis no catálogo para ser notificado
              quando estiverem disponíveis
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservasAtivas.map((reserva) => {
              const obra = getObra(reserva.obraId);
              if (!obra) return null;

              const daysUntilExpiration = getDaysUntilExpiration(
                reserva.dataExpiracao,
              );
              const isExpiringSoon = daysUntilExpiration <= 3;

              return (
                <Card key={reserva.id} className="p-6">
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
                            variant={isExpiringSoon ? "secondary" : "default"}
                            className={!isExpiringSoon ? "bg-emerald-600" : ""}
                          >
                            Aguardando
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Reservado em {formatDate(reserva.dataReserva)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Expira em {formatDate(reserva.dataExpiracao)}
                            </span>
                          </div>
                        </div>

                        {isExpiringSoon && (
                          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded mt-2">
                            Esta reserva expira em {daysUntilExpiration} dias
                          </div>
                        )}

                        <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded mt-2">
                          Você será notificado quando um exemplar estiver
                          disponível para empréstimo
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <Button
                          onClick={() => handleCancelar(reserva)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Reserva
                        </Button>
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
      {historicoReservas.length > 0 && (
        <div>
          <h2 className="text-gray-900 text-2xl mb-4">Histórico de Reservas</h2>
          <div className="space-y-4">
            {historicoReservas.map((reserva) => {
              const obra = getObra(reserva.obraId);
              if (!obra) return null;

              const isConcluida = reserva.status === "concluida";

              return (
                <Card key={reserva.id} className="p-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 mb-1">{obra.titulo}</h3>
                      <p className="text-sm text-gray-600">{obra.autor}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>
                          Reservado: {formatDate(reserva.dataReserva)}
                        </span>
                        <span>
                          Expiração: {formatDate(reserva.dataExpiracao)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isConcluida
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100"
                      }
                    >
                      {isConcluida ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Cancelada
                        </>
                      )}
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
