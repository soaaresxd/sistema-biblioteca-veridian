export function resolverValor(
  valor: string | { value?: string } | undefined
): string {
  if (!valor) return "";
  return typeof valor === "string" ? valor : valor.value ?? "";
}

export function normalizarTexto(
  valor: string | { value?: string } | undefined
): string {
  if (!valor) return "";
  const texto = typeof valor === "string" ? valor : valor.value ?? "";
  return texto.trim();
}

export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "");
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function formatarTelefone(telefone: string): string {
  const tel = telefone.replace(/\D/g, "");
  if (tel.length === 11) {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (tel.length === 10) {
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}

export function formatarData(dataStr: string): string {
  if (!dataStr) return "-";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function converterDataParaISO(dataBR: string): string {
  const [dia, mes, ano] = dataBR.split("/");
  return `${ano}-${mes}-${dia}`;
}

export function calcularDiasRestantes(dataPrevista: string): number {
  if (!dataPrevista) return 0;
  const hoje = new Date();
  const dataLimite = new Date(dataPrevista);
  const diferencaTempo = dataLimite.getTime() - hoje.getTime();
  return Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
}

export function estaAtrasado(dataPrevista: string): boolean {
  return calcularDiasRestantes(dataPrevista) < 0;
}

export function formatarDiasRestantes(dias: number): string {
  if (dias < 0) return `${Math.abs(dias)} dias de atraso`;
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "1 dia restante";
  return `${dias} dias restantes`;
}

export function truncarTexto(texto: string, limite: number = 50): string {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + "...";
}

export function capitalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = limparCPF(cpf);

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}
