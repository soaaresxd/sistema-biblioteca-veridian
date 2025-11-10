from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.administrador import Administrador
from models.usuario import Usuario
from schemas.administrador import AdministradorCreate, AdministradorUpdate, AdministradorResponse
import uuid

router = APIRouter(prefix="/administradores", tags=["Administradores"])


@router.get("/", response_model=List[AdministradorResponse])
def listar_administradores(db: Session = Depends(get_db)):
    """Lista todos os administradores"""
    administradores = db.query(Administrador).all()
    return administradores


@router.get("/{admin_id}", response_model=AdministradorResponse)
def buscar_administrador(admin_id: str, db: Session = Depends(get_db)):
    """Busca administrador por ID"""
    admin = db.query(Administrador).filter(Administrador.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )
    
    return admin


@router.post("/", response_model=AdministradorResponse, status_code=status.HTTP_201_CREATED)
def criar_administrador(admin_data: AdministradorCreate, db: Session = Depends(get_db)):
    """
    Cria novo administrador vinculado a um usuário existente.
    O usuário deve existir e ter role='admin'.
    """
    
    # Verificar se usuário existe
    usuario = db.query(Usuario).filter(Usuario.id == admin_data.usuarioId).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verificar se usuário tem role admin
    if usuario.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário deve ter role 'admin' para ser administrador"
        )
    
    # Verificar se já existe administrador para este usuário
    admin_existente = db.query(Administrador).filter(
        Administrador.usuarioId == admin_data.usuarioId
    ).first()
    
    if admin_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um administrador para este usuário"
        )
    
    # Criar administrador
    novo_admin = Administrador(
        id=str(uuid.uuid4()),
        usuarioId=admin_data.usuarioId,
        nivelAcesso=admin_data.nivelAcesso
    )
    
    db.add(novo_admin)
    db.commit()
    db.refresh(novo_admin)
    
    return novo_admin


@router.put("/{admin_id}", response_model=AdministradorResponse)
def atualizar_administrador(admin_id: str, admin_data: AdministradorUpdate, db: Session = Depends(get_db)):
    """Atualiza dados do administrador (apenas nivel_acesso)"""
    
    admin = db.query(Administrador).filter(Administrador.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )
    
    # Atualizar apenas campos fornecidos
    update_data = admin_data.model_dump(exclude_unset=True)
    
    for campo, valor in update_data.items():
        setattr(admin, campo, valor)
    
    db.commit()
    db.refresh(admin)
    
    return admin


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_administrador(admin_id: str, db: Session = Depends(get_db)):
    """
    Deleta administrador (remove privilégios).
    Não deleta o usuário associado.
    """
    
    admin = db.query(Administrador).filter(Administrador.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )
    
    db.delete(admin)
    db.commit()
    
    return None
