from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.categoria import Categoria
from schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
import uuid

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """Lista todas as categorias"""
    categorias = db.query(Categoria).all()
    return categorias


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def buscar_categoria(categoria_id: str, db: Session = Depends(get_db)):
    """Busca categoria por ID"""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar_categoria(categoria_data: CategoriaCreate, db: Session = Depends(get_db)):
    """Cria nova categoria"""
    
    # Verificar se categoria com mesmo nome já existe
    categoria_existente = db.query(Categoria).filter(
        Categoria.nome == categoria_data.nome
    ).first()
    
    if categoria_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria com este nome já existe"
        )
    
    # Criar categoria
    nova_categoria = Categoria(
        id=str(uuid.uuid4()),
        nome=categoria_data.nome,
        descricao=categoria_data.descricao
    )
    
    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)
    
    return nova_categoria


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(categoria_id: str, categoria_data: CategoriaUpdate, db: Session = Depends(get_db)):
    """Atualiza dados da categoria"""
    
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    # Atualizar apenas campos fornecidos
    update_data = categoria_data.model_dump(exclude_unset=True)
    
    for campo, valor in update_data.items():
        setattr(categoria, campo, valor)
    
    db.commit()
    db.refresh(categoria)
    
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_categoria(categoria_id: str, db: Session = Depends(get_db)):
    """Deleta categoria"""
    
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    db.delete(categoria)
    db.commit()
    
    return None
