"""
Script interativo para criar o primeiro administrador.
Solicita dados via terminal e cria usuário + administrador.
"""

from database import SessionLocal, init_db
from models.usuario import Usuario
from models.administrador import Administrador
from services.senha_service import hash_senha
from services.auth_service import validar_cpf
import uuid
from datetime import datetime


def criar_admin():
    """Cria administrador interativamente"""
    
    print("="*60)
    print("CRIAR ADMINISTRADOR - Veridian")
    print("="*60)
    
    # Inicializar banco
    init_db()
    db = SessionLocal()
    
    try:
        print("\n📋 Preencha os dados do administrador:\n")
        
        # Coletar dados
        nome = input("Nome completo: ").strip()
        if not nome or len(nome) < 3:
            print("Nome deve ter pelo menos 3 caracteres")
            return
        
        # CPF
        while True:
            cpf = input("CPF (11 dígitos): ").strip()
            cpf = ''.join(filter(str.isdigit, cpf))
            
            if len(cpf) != 11:
                print("CPF deve ter 11 dígitos")
                continue
            
            # Verificar se CPF já existe
            cpf_existente = db.query(Usuario).filter(Usuario.cpf == cpf).first()
            if cpf_existente:
                print("CPF já cadastrado")
                continue
            
            print(f"CPF aceito: {cpf}")
            break
        
        # Email
        while True:
            email = input("Email: ").strip().lower()
            if '@' not in email or '.' not in email:
                print("Email inválido")
                continue
            
            # Verificar se email já existe
            email_existente = db.query(Usuario).filter(Usuario.email == email).first()
            if email_existente:
                print("Email já cadastrado")
                continue
            
            break
        
        # Senha
        while True:
            senha = input("Senha (mín. 6 caracteres): ").strip()
            if len(senha) < 6:
                print("Senha deve ter pelo menos 6 caracteres")
                continue
            
            senha_confirmacao = input("Confirme a senha: ").strip()
            if senha != senha_confirmacao:
                print("Senhas não conferem")
                continue
            
            break
        
        telefone = input("Telefone (opcional): ").strip() or None
        endereco = input("Endereço (opcional): ").strip() or None
        
        # Nível de acesso
        print("\nNível de acesso:")
        print("  1 - Básico")
        print("  2 - Intermediário")
        print("  3 - Total")
        
        while True:
            try:
                nivel_acesso = int(input("Escolha (1-3): ").strip())
                if nivel_acesso not in [1, 2, 3]:
                    print("Escolha entre 1, 2 ou 3")
                    continue
                break
            except ValueError:
                print("Digite um número válido")
        
        # Confirmar dados
        print("\n" + "="*60)
        print("====== CONFIRME OS DADOS: ========")
        print("="*60)
        print(f"Nome: {nome}")
        print(f"CPF: {cpf}")
        print(f"Email: {email}")
        print(f"Telefone: {telefone or 'Não informado'}")
        print(f"Endereço: {endereco or 'Não informado'}")
        print(f"Nível de acesso: {nivel_acesso}")
        print("="*60)
        
        confirmacao = input("\nConfirmar criação? (s/n): ").strip().lower()
        if confirmacao != 's':
            print("Operação cancelada")
            return
        
        # Criar usuário
        print("\nCriando usuário...")
        
        usuario_id = str(uuid.uuid4())
        data_cadastro = datetime.now().strftime('%Y-%m-%d')
        
        usuario = Usuario(
            id=usuario_id,
            nome=nome,
            cpf=cpf,
            email=email,
            senhaHash=hash_senha(senha),
            telefone=telefone,
            endereco=endereco,
            dataCadastro=data_cadastro,
            status='ativo',
            role='admin'
        )
        
        db.add(usuario)
        db.commit()
        print("====Usuário criado====")
        
        # Criar administrador
        print("Vinculando privilégios de administrador...")
        
        admin_id = str(uuid.uuid4())
        admin = Administrador(
            id=admin_id,
            usuarioId=usuario_id,
            nivelAcesso=nivel_acesso
        )
        
        db.add(admin)
        db.commit()
        print("Administrador criado")
        
        print("\n" + "="*60)
        print("ADMINISTRADOR CRIADO COM SUCESSO!")
        print("="*60)
        print(f"\nCredenciais de acesso:")
        print(f"   CPF: {cpf}")
        print(f"   Senha: [a senha que você digitou]")
        print(f"\nDados do usuário:")
        print(f"   ID: {usuario_id}")
        print(f"   Nome: {nome}")
        print(f"   Email: {email}")
        print(f"\nPrivilégios:")
        print(f"   Nível de acesso: {nivel_acesso}")
        print(f"   Role: admin")
        print(f"\nPróximos passos:")
        print(f"   1. Execute: python main.py")
        print(f"   2. Acesse: http://localhost:8000/docs")
        print(f"   3. Faça login usando CPF e senha")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\nErro ao criar administrador: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    criar_admin()
