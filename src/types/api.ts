// Generated manually from backend OpenAPI schema. Represents the public API contract.

export type UsuarioStatus = "ativo" | "inativo" | "suspenso";
export type UsuarioRole = "user" | "admin";

export interface UsuarioLogin {
  cpf: string;
  senha: string;
}

export interface UsuarioCreate {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  endereco?: string | null;
  status?: UsuarioStatus;
  role?: UsuarioRole;
  senha: string;
  dataCadastro: string;
}

export interface UsuarioUpdate {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  status?: UsuarioStatus | null;
  role?: UsuarioRole | null;
  senha?: string | null;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  endereco?: string | null;
  status: UsuarioStatus;
  role: UsuarioRole;
  dataCadastro: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AdministradorCreate {
  usuarioId: string;
  nivelAcesso?: number;
}

export interface AdministradorUpdate {
  nivelAcesso?: number | null;
}

export interface AdministradorResponse {
  id: string;
  usuarioId: string;
  nivelAcesso: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CategoriaCreate {
  nome: string;
  descricao?: string | null;
}

export interface CategoriaUpdate {
  nome?: string | null;
  descricao?: string | null;
}

export interface CategoriaResponse {
  id: string;
  nome: string;
  descricao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ObraCreate {
  titulo: string;
  autor: string;
  isbn: string;
  categoriaId: string;
  editora?: string | null;
  anoPublicacao?: number | null;
  descricao?: string | null;
  capa?: string | null;
  totalExemplares?: number;
  exemplaresDisponiveis?: number;
}

export interface ObraUpdate {
  titulo?: string | null;
  autor?: string | null;
  isbn?: string | null;
  categoriaId?: string | null;
  editora?: string | null;
  anoPublicacao?: number | null;
  descricao?: string | null;
  capa?: string | null;
  totalExemplares?: number | null;
  exemplaresDisponiveis?: number | null;
}

export interface ObraResponse {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  categoriaId: string;
  editora?: string | null;
  anoPublicacao?: number | null;
  descricao?: string | null;
  capa?: string | null;
  totalExemplares: number;
  exemplaresDisponiveis: number;
  criadoEm: string;
  atualizadoEm: string;
}

export type ExemplarStatus =
  | "disponivel"
  | "emprestado"
  | "reservado"
  | "manutencao";

export interface ExemplarCreate {
  obraId: string;
  codigo: string;
  status?: ExemplarStatus;
  localizacao?: string | null;
}

export interface ExemplarUpdate {
  obraId?: string | null;
  codigo?: string | null;
  status?: ExemplarStatus | null;
  localizacao?: string | null;
}

export interface ExemplarResponse {
  id: string;
  obraId: string;
  codigo: string;
  status: ExemplarStatus;
  localizacao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type EmprestimoStatus = "ativo" | "devolvido" | "atrasado";

export interface EmprestimoCreate {
  usuarioId: string;
  exemplarId: string;
  obraId: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao?: string | null;
  status?: EmprestimoStatus;
  renovacoes?: number;
}

export interface EmprestimoUpdate {
  dataPrevistaDevolucao?: string | null;
  dataDevolucao?: string | null;
  status?: EmprestimoStatus | null;
  renovacoes?: number | null;
}

export interface EmprestimoResponse {
  id: string;
  usuarioId: string;
  exemplarId: string;
  obraId: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao?: string | null;
  status: EmprestimoStatus;
  renovacoes: number;
  criadoEm: string;
  atualizadoEm: string;
}

export type ReservaStatus = "ativa" | "cancelada" | "concluida";

export interface ReservaCreate {
  usuarioId: string;
  obraId: string;
  dataReserva: string;
  dataExpiracao: string;
  status?: ReservaStatus;
}

export interface ReservaUpdate {
  status?: ReservaStatus | null;
  dataExpiracao?: string | null;
}

export interface ReservaResponse {
  id: string;
  usuarioId: string;
  obraId: string;
  dataReserva: string;
  dataExpiracao: string;
  status: ReservaStatus;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}
