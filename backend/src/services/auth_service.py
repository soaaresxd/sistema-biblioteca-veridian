from sqlalchemy.orm import Session
from models.usuario import Usuario
from services.senha_service import verificar_senha


def autenticar_usuario(db: Session, cpf: str, senha: str) -> Usuario | None:
    """
    Autentica usuário por CPF e senha.
    
    Args:
        db: Sessão do banco de dados
        cpf: CPF do usuário (somente números)
        senha: Senha em texto plano
        
    Returns:
        Objeto Usuario se autenticado, None caso contrário
    """
    # Buscar usuário por CPF
    usuario = db.query(Usuario).filter(Usuario.cpf == cpf).first()
    
    if not usuario:
        return None
    
    # Verificar senha
    if not verificar_senha(senha, usuario.senhaHash):
        return None
    
    # Verificar se usuário está ativo (comparar com enum ou string)
    if hasattr(usuario.status, 'value'):
        # É um Enum
        if usuario.status.value != 'ativo':
            return None
    else:
        # É string
        if usuario.status != 'ativo':
            return None
    
    return usuario


def validar_cpf(cpf: str) -> bool:
    """
    Valida CPF brasileiro.
    
    Args:
        cpf: CPF (somente números)
        
    Returns:
        True se CPF é válido, False caso contrário
    """
    # Remove caracteres não numéricos
    cpf = ''.join(filter(str.isdigit, cpf))
    
    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False
    
    # Verifica se todos os dígitos são iguais
    if cpf == cpf[0] * 11:
        return False
    
    # Validação do primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digito1 = (soma * 10 % 11) % 10
    
    if int(cpf[9]) != digito1:
        return False
    
    # Validação do segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digito2 = (soma * 10 % 11) % 10
    
    if int(cpf[10]) != digito2:
        return False
    
    return True
