import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { BookOpen, AlertCircle } from "lucide-react";
import { User } from "../App";
import { login } from "../lib/api";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const imagemPainel = "/assets/login-background.svg";

  const formatarCpf = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length > 11) {
      return cpf;
    }
    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const aoAlterarCpf = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCpf(evento.target.value);
    setCpf(formatado);
  };

  const cpfValido = (valorCpf: string): boolean => {
    const numeros = valorCpf.replace(/\D/g, "");
    if (numeros.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numeros)) return false;
    return true;
  };

  const aoEnviarFormulario = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setError("");
    setLoading(true);

    const cpfNumeros = cpf.replace(/\D/g, "");

    if (!cpfValido(cpf)) {
      setError("CPF inválido. Por favor, verifique o número digitado.");
      setLoading(false);
      return;
    }

    try {
      const usuario = await login(cpfNumeros, senha);
      onLogin({
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        email: usuario.email,
        role: usuario.role,
      });
    } catch (erro: any) {
      setError(erro.message || "CPF ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0a4d3c 0%, #134e3a 30%, #1a5c46 60%, #0f3730 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-white text-4xl">Veridian</h1>
              <p className="text-emerald-100 text-sm">
                Sistema de Biblioteca Online
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold mb-3 tracking-wide uppercase drop-shadow-lg">
            BEM-VINDO A SUA BIBLIOTECA ONLINE!
          </h2>
          <p className="text-emerald-100 text-lg">
            Controle de empréstimos, reservas e devoluções
          </p>
        </div>

        <div className="relative z-10 text-emerald-100 text-sm">
          <p>
            Desenvolvido por Felipe Soares, Gabriel Cerqueira e Matheus Sena
          </p>
          <p>Ciência da Computação – Unijorge</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <h1 className="text-emerald-600 text-3xl">Veridian</h1>
            </div>
            <h2 className="text-gray-900 text-2xl mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-600">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={aoEnviarFormulario} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={aoAlterarCpf}
                  maxLength={14}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="manter"
                    checked={manterConectado}
                    onCheckedChange={(
                      checked: boolean | "indeterminate" | undefined
                    ) => setManterConectado(Boolean(checked))}
                  />
                  <Label htmlFor="manter" className="cursor-pointer text-sm">
                    Manter conectado
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
