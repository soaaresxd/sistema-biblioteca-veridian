import bcrypt


def hash_senha(senha: str) -> str:
    """
    Cria hash da senha usando bcrypt.
    
    Args:
        senha: Senha em texto plano
        
    Returns:
        Hash da senha como string
    """
    senha_bytes = senha.encode('utf-8')
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(senha_bytes, salt)
    return hash_bytes.decode('utf-8')


def verificar_senha(senha: str, hash_senha: str) -> bool:
    """
    Verifica se a senha corresponde ao hash.
    
    Args:
        senha: Senha em texto plano
        hash_senha: Hash armazenado no banco
        
    Returns:
        True se a senha está correta, False caso contrário
    """
    senha_bytes = senha.encode('utf-8')
    hash_bytes = hash_senha.encode('utf-8')
    return bcrypt.checkpw(senha_bytes, hash_bytes)
