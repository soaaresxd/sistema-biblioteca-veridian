from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.reserva import Reserva
from models.usuario import Usuario
from models.obra import Obra
from schemas.reserva import ReservaCreate, ReservaUpdate, ReservaResponse
import uuid

router = APIRouter(prefix="/reservas", tags=["Reservas"])


@router.get("/", response_model=List[ReservaResponse])
def listar_reservas(db: Session = Depends(get_db)):
    """Lista todas as reservas"""
    reservas = db.query(Reserva).all()
    return reservas


@router.get("/{reserva_id}", response_model=ReservaResponse)
def buscar_reserva(reserva_id: str, db: Session = Depends(get_db)):
    """Busca reserva por ID"""
    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    
    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    return reserva


@router.post("/", response_model=ReservaResponse, status_code=status.HTTP_201_CREATED)
def criar_reserva(reserva_data: ReservaCreate, db: Session = Depends(get_db)):
    """Cria nova reserva - VERSÃO SIMPLIFICADA"""
    
    nova_reserva = Reserva(
        id=str(uuid.uuid4()),
        usuarioId=reserva_data.usuarioId,
        obraId=reserva_data.obraId,
        dataReserva=reserva_data.dataReserva,
        status="ativa",
        dataExpiracao=reserva_data.dataExpiracao
    )
    
    db.add(nova_reserva)
    db.commit()
    db.refresh(nova_reserva)
    
    return nova_reserva


@router.put("/{reserva_id}", response_model=ReservaResponse)
def atualizar_reserva(reserva_id: str, reserva_data: ReservaUpdate, db: Session = Depends(get_db)):
    """Atualiza dados da reserva"""
    
    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    
    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    # Atualizar apenas campos fornecidos
    update_data = reserva_data.model_dump(exclude_unset=True)
    
    for campo, valor in update_data.items():
        setattr(reserva, campo, valor)
    
    db.commit()
    db.refresh(reserva)
    
    return reserva


@router.delete("/{reserva_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_reserva(reserva_id: str, db: Session = Depends(get_db)):
    """Deleta reserva"""
    
    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    
    if not reserva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada"
        )
    
    db.delete(reserva)
    db.commit()
    
    return None
