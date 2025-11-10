from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.usuario import UsuarioLogin, UsuarioResponse
from services.auth_service import autenticar_usuario
from models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=UsuarioResponse)
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Realiza login do usuário.
    Retorna dados do usuário se autenticado com sucesso.
    """
    # Autenticar usuário
    usuario = autenticar_usuario(db, dados.cpf, dados.senha)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos"
        )
    
    return usuario


@router.post("/logout")
def logout():
    """
    Endpoint de logout (placeholder).
    Em produção, implementar invalidação de token JWT.
    """
    return {"message": "Logout realizado com sucesso"}
