import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BookOpen, BookMarked } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { listarObras, listarCategorias, criarReserva } from "../../lib/api";
import type { CategoriaResponse, ObraResponse } from "../../types/api";

interface CatalogoObrasProps {
  searchQuery: string;
  userId: string;
}

const imagemCapaPadrao = "/assets/capa-placeholder.svg";

export function CatalogoObras({ searchQuery, userId }: CatalogoObrasProps) {
  const [obras, setObras] = useState<ObraResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [selectedObra, setSelectedObra] = useState<ObraResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Carregar obras e categorias da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [obrasData, categoriasData] = await Promise.all([
          listarObras(),
          listarCategorias(),
        ]);
        setObras(obrasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar catálogo");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredObras = obras.filter((obra) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      obra.titulo.toLowerCase().includes(normalizedQuery) ||
      obra.autor.toLowerCase().includes(normalizedQuery) ||
      obra.isbn.includes(searchQuery);

    const matchesCategory =
      categoriaFilter === "all" || obra.categoriaId === categoriaFilter;

    return matchesSearch && matchesCategory;
  });

  const handleReservar = (obra: ObraResponse) => {
    setSelectedObra(obra);
    setIsDialogOpen(true);
  };

  const confirmReserva = async () => {
    if (!selectedObra) return;

    try {
      const dataAtual = new Date().toISOString().split("T")[0];
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 14);

      await criarReserva({
        usuarioId: userId,
        obraId: selectedObra.id,
        dataReserva: dataAtual,
        dataExpiracao: dataExpiracao.toISOString().split("T")[0],
      });

      toast.success(`Reserva realizada com sucesso!`, {
        description: `"${selectedObra.titulo}" foi reservado.`,
      });
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      toast.error("Erro ao realizar reserva");
    } finally {
      setIsDialogOpen(false);
      setSelectedObra(null);
    }
  };

  const getCategoriaName = (categoriaId: string) => {
    return (
      categorias.find((categoria) => categoria.id === categoriaId)?.nome ||
      "Sem categoria"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando catálogo...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 text-2xl mb-1">Catálogo de Obras</h2>
          <p className="text-gray-600">
            {filteredObras.length}{" "}
            {filteredObras.length === 1
              ? "obra encontrada"
              : "obras encontradas"}
          </p>
        </div>

        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredObras.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma obra encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredObras.map((obra) => {
            const isDisponivel = obra.exemplaresDisponiveis > 0;

            return (
              <Card
                key={obra.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <ImageWithFallback
                    src={obra.capa || imagemCapaPadrao}
                    alt={obra.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={isDisponivel ? "default" : "secondary"}
                      className={
                        isDisponivel ? "bg-emerald-600" : "bg-gray-500"
                      }
                    >
                      {isDisponivel ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-gray-900 line-clamp-2 mb-1">
                      {obra.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">{obra.autor}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getCategoriaName(obra.categoriaId)}</span>
                    <span>{obra.anoPublicacao ?? "—"}</span>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-600 mb-3">
                      {obra.exemplaresDisponiveis} de {obra.totalExemplares}{" "}
                      exemplares disponíveis
                    </p>

                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleReservar(obra)}
                      disabled={!isDisponivel}
                    >
                      <BookMarked className="h-4 w-4 mr-2" />
                      {isDisponivel ? "Reservar" : "Indisponível"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de confirmação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="bg-white"
          style={{ backgroundColor: "white", color: "black" }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ color: "black", fontWeight: "bold", fontSize: "20px" }}
            >
              Confirmar Reserva
            </DialogTitle>
            <DialogDescription style={{ color: "black", fontWeight: "500" }}>
              Deseja reservar a seguinte obra?
            </DialogDescription>
          </DialogHeader>

          {selectedObra && (
            <div className="py-4">
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src={selectedObra.capa || imagemCapaPadrao}
                    alt={selectedObra.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3
                    style={{
                      color: "black",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedObra.titulo}
                  </h3>
                  <p
                    style={{
                      color: "black",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedObra.autor}
                  </p>
                  <p style={{ color: "black", fontSize: "12px" }}>
                    {selectedObra.editora || "Editora não informada"},{" "}
                    {selectedObra.anoPublicacao ?? "—"}
                  </p>
                  <p style={{ color: "black", fontSize: "12px" }}>
                    ISBN: {selectedObra.isbn}
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
              >
                <p
                  style={{
                    color: "#1e3a8a",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Você será notificado assim que um exemplar estiver disponível.
                  A reserva expira em 14 dias.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmReserva}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
