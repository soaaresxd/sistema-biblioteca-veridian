from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.exemplar import Exemplar
from models.obra import Obra
from schemas.exemplar import ExemplarCreate, ExemplarUpdate, ExemplarResponse
import uuid

router = APIRouter(prefix="/exemplares", tags=["Exemplares"])


@router.get("/", response_model=List[ExemplarResponse])
def listar_exemplares(db: Session = Depends(get_db)):
    """Lista todos os exemplares"""
    exemplares = db.query(Exemplar).all()
    return exemplares


@router.get("/{exemplar_id}", response_model=ExemplarResponse)
def buscar_exemplar(exemplar_id: str, db: Session = Depends(get_db)):
    """Busca exemplar por ID"""
    exemplar = db.query(Exemplar).filter(Exemplar.id == exemplar_id).first()
    
    if not exemplar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exemplar não encontrado"
        )
    
    return exemplar


@router.post("/", response_model=ExemplarResponse, status_code=status.HTTP_201_CREATED)
def criar_exemplar(exemplar_data: ExemplarCreate, db: Session = Depends(get_db)):
    """Cria novo exemplar"""
    
    # Verificar se obra existe
    obra = db.query(Obra).filter(Obra.id == exemplar_data.obraId).first()
    if not obra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Obra não encontrada"
        )
    
    # Verificar se código já existe
    codigo_existente = db.query(Exemplar).filter(
        Exemplar.codigo == exemplar_data.codigo
    ).first()
    
    if codigo_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de exemplar já existe"
        )
    
    # Criar exemplar
    novo_exemplar = Exemplar(
        id=str(uuid.uuid4()),
        obraId=exemplar_data.obraId,
        codigo=exemplar_data.codigo,
        status=exemplar_data.status,
        localizacao=exemplar_data.localizacao
    )
    
    db.add(novo_exemplar)
    
    # Atualizar total de exemplares da obra
    obra.totalExemplares += 1
    if exemplar_data.status == "disponivel":
        obra.exemplaresDisponiveis += 1
    
    db.commit()
    db.refresh(novo_exemplar)
    
    return novo_exemplar


@router.put("/{exemplar_id}", response_model=ExemplarResponse)
def atualizar_exemplar(exemplar_id: str, exemplar_data: ExemplarUpdate, db: Session = Depends(get_db)):
    """Atualiza dados do exemplar"""
    
    exemplar = db.query(Exemplar).filter(Exemplar.id == exemplar_id).first()
    
    if not exemplar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exemplar não encontrado"
        )
    
    # Atualizar apenas campos fornecidos
    update_data = exemplar_data.model_dump(exclude_unset=True)
    
    # Se status mudou, atualizar disponibilidade da obra
    if "status" in update_data:
        obra = db.query(Obra).filter(Obra.id == exemplar.obraId).first()
        
        # Status antigo -> novo
        if exemplar.status.value == "disponivel" and update_data["status"] != "disponivel":
            obra.exemplaresDisponiveis -= 1
        elif exemplar.status.value != "disponivel" and update_data["status"] == "disponivel":
            obra.exemplaresDisponiveis += 1
    
    for campo, valor in update_data.items():
        setattr(exemplar, campo, valor)
    
    db.commit()
    db.refresh(exemplar)
    
    return exemplar


@router.delete("/{exemplar_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_exemplar(exemplar_id: str, db: Session = Depends(get_db)):
    """Deleta exemplar"""
    
    exemplar = db.query(Exemplar).filter(Exemplar.id == exemplar_id).first()
    
    if not exemplar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exemplar não encontrado"
        )
    
    # Atualizar total de exemplares da obra
    obra = db.query(Obra).filter(Obra.id == exemplar.obraId).first()
    obra.totalExemplares -= 1
    if exemplar.status.value == "disponivel":
        obra.exemplaresDisponiveis -= 1
    
    db.delete(exemplar)
    db.commit()
    
    return None
