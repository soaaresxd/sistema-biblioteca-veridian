import uuid
from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from services.senha_service import hash_senha
from services.usuario_service import UsuarioService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


def _get_usuario_or_404(db: Session, usuario_id: str) -> Usuario:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return usuario


def _ensure_unique(db: Session, field, value: str, message: str):
    if db.query(Usuario).filter(field == value).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def buscar_usuario(usuario_id: str, db: Session = Depends(get_db)):
    return _get_usuario_or_404(db, usuario_id)


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    _ensure_unique(db, Usuario.cpf, usuario_data.cpf, "CPF já cadastrado")
    _ensure_unique(db, Usuario.email, usuario_data.email, "Email já cadastrado")

    novo_usuario = Usuario(
        id=str(uuid.uuid4()),
        nome=usuario_data.nome,
        cpf=usuario_data.cpf,
        email=usuario_data.email,
        senhaHash=hash_senha(usuario_data.senha),
        telefone=usuario_data.telefone,
        endereco=usuario_data.endereco,
        dataCadastro=usuario_data.dataCadastro,
        status=usuario_data.status,
        role=usuario_data.role
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(usuario_id: str, usuario_data: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = _get_usuario_or_404(db, usuario_id)
    update_data = usuario_data.model_dump(exclude_unset=True)
    
    if "senha" in update_data:
        update_data["senhaHash"] = hash_senha(update_data.pop("senha"))
    
    for campo, valor in update_data.items():
        setattr(usuario, campo, valor)
    
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_usuario(usuario_id: str, db: Session = Depends(get_db)):
    try:
        UsuarioService.excluir_usuario_completo(db, usuario_id)
        return None
    except ValueError as e:
        logger.error(f"Usuário não encontrado: {str(e)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao deletar usuário: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao excluir usuário: {str(e)}")


@router.get("/{usuario_id}/dependencias")
def listar_dependencias(usuario_id: str, db: Session = Depends(get_db)):
    try:
        return UsuarioService.listar_dependencias_usuario(db, usuario_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
