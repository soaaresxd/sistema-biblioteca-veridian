import { httpRequest } from "../api/client";
import type {
  AdministradorCreate,
  AdministradorResponse,
  CategoriaCreate,
  CategoriaResponse,
  EmprestimoCreate,
  EmprestimoResponse,
  EmprestimoUpdate,
  ExemplarCreate,
  ExemplarResponse,
  ExemplarUpdate,
  ObraCreate,
  ObraResponse,
  ObraUpdate,
  ReservaCreate,
  ReservaResponse,
  ReservaUpdate,
  UsuarioCreate,
  UsuarioLogin,
  UsuarioResponse,
  UsuarioUpdate,
} from "../types/api";

export async function login(
  cpf: string,
  senha: string
): Promise<UsuarioResponse> {
  const payload: UsuarioLogin = { cpf, senha };
  return httpRequest<UsuarioResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<void> {
  await httpRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export async function listarUsuarios(): Promise<UsuarioResponse[]> {
  return httpRequest<UsuarioResponse[]>("/usuarios");
}

export async function buscarUsuario(id: string): Promise<UsuarioResponse> {
  return httpRequest<UsuarioResponse>(`/usuarios/${id}`);
}

export async function criarUsuario(
  dados: UsuarioCreate
): Promise<UsuarioResponse> {
  return httpRequest<UsuarioResponse>("/usuarios", {
    method: "POST",
    body: dados,
  });
}

export async function atualizarUsuario(
  id: string,
  dados: UsuarioUpdate
): Promise<UsuarioResponse> {
  return httpRequest<UsuarioResponse>(`/usuarios/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export async function deletarUsuario(id: string): Promise<void> {
  await httpRequest<void>(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

export async function listarAdministradores(): Promise<
  AdministradorResponse[]
> {
  return httpRequest<AdministradorResponse[]>("/administradores");
}

export async function criarAdministrador(
  dados: AdministradorCreate
): Promise<AdministradorResponse> {
  return httpRequest<AdministradorResponse>("/administradores", {
    method: "POST",
    body: dados,
  });
}

export async function listarCategorias(): Promise<CategoriaResponse[]> {
  return httpRequest<CategoriaResponse[]>("/categorias");
}

export async function criarCategoria(
  dados: CategoriaCreate
): Promise<CategoriaResponse> {
  return httpRequest<CategoriaResponse>("/categorias", {
    method: "POST",
    body: dados,
  });
}

export async function listarObras(): Promise<ObraResponse[]> {
  return httpRequest<ObraResponse[]>("/obras");
}

export async function buscarObra(id: string): Promise<ObraResponse> {
  return httpRequest<ObraResponse>(`/obras/${id}`);
}

export async function criarObra(dados: ObraCreate): Promise<ObraResponse> {
  return httpRequest<ObraResponse>("/obras", {
    method: "POST",
    body: dados,
  });
}

export async function atualizarObra(
  id: string,
  dados: ObraUpdate
): Promise<ObraResponse> {
  return httpRequest<ObraResponse>(`/obras/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export async function deletarObra(id: string): Promise<void> {
  await httpRequest<void>(`/obras/${id}`, {
    method: "DELETE",
  });
}

export async function uploadCapaObra(id: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await httpRequest<void>(`/obras/${id}/upload-capa`, {
    method: "POST",
    body: formData,
  });
}

export async function listarExemplares(): Promise<ExemplarResponse[]> {
  return httpRequest<ExemplarResponse[]>("/exemplares");
}

export async function criarExemplar(
  dados: ExemplarCreate
): Promise<ExemplarResponse> {
  return httpRequest<ExemplarResponse>("/exemplares", {
    method: "POST",
    body: dados,
  });
}

export async function atualizarExemplar(
  id: string,
  dados: ExemplarUpdate
): Promise<ExemplarResponse> {
  return httpRequest<ExemplarResponse>(`/exemplares/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export async function listarEmprestimos(): Promise<EmprestimoResponse[]> {
  return httpRequest<EmprestimoResponse[]>("/emprestimos");
}

export async function buscarEmprestimo(
  id: string
): Promise<EmprestimoResponse> {
  return httpRequest<EmprestimoResponse>(`/emprestimos/${id}`);
}

export async function criarEmprestimo(
  dados: EmprestimoCreate
): Promise<EmprestimoResponse> {
  return httpRequest<EmprestimoResponse>("/emprestimos", {
    method: "POST",
    body: dados,
  });
}

export async function atualizarEmprestimo(
  id: string,
  dados: EmprestimoUpdate
): Promise<EmprestimoResponse> {
  return httpRequest<EmprestimoResponse>(`/emprestimos/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export async function deletarEmprestimo(id: string): Promise<void> {
  await httpRequest<void>(`/emprestimos/${id}`, {
    method: "DELETE",
  });
}

export async function listarReservas(): Promise<ReservaResponse[]> {
  return httpRequest<ReservaResponse[]>("/reservas");
}

export async function buscarReserva(id: string): Promise<ReservaResponse> {
  return httpRequest<ReservaResponse>(`/reservas/${id}`);
}

export async function criarReserva(
  dados: ReservaCreate
): Promise<ReservaResponse> {
  return httpRequest<ReservaResponse>("/reservas", {
    method: "POST",
    body: dados,
  });
}

export async function atualizarReserva(
  id: string,
  dados: ReservaUpdate
): Promise<ReservaResponse> {
  return httpRequest<ReservaResponse>(`/reservas/${id}`, {
    method: "PUT",
    body: dados,
  });
}

export async function deletarReserva(id: string): Promise<void> {
  await httpRequest<void>(`/reservas/${id}`, {
    method: "DELETE",
  });
}

export async function renovarEmprestimo(
  id: string
): Promise<EmprestimoResponse> {
  const emprestimo = await buscarEmprestimo(id);
  const novaData = new Date();
  novaData.setDate(novaData.getDate() + 14);
  const novaDataStr = novaData.toISOString().split("T")[0];

  return atualizarEmprestimo(id, {
    dataPrevistaDevolucao: novaDataStr,
    renovacoes: emprestimo.renovacoes + 1,
  });
}

export async function cancelarReserva(id: string): Promise<ReservaResponse> {
  return atualizarReserva(id, { status: "cancelada" });
}

export async function listarEmprestimosPorUsuario(
  usuarioId: string
): Promise<EmprestimoResponse[]> {
  const emprestimos = await listarEmprestimos();
  return emprestimos.filter((emp) => emp.usuarioId === usuarioId);
}

export async function listarReservasPorUsuario(
  usuarioId: string
): Promise<ReservaResponse[]> {
  const reservas = await listarReservas();
  return reservas.filter((res) => res.usuarioId === usuarioId);
}
