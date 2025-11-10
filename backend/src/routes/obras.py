from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.obra import Obra
from models.categoria import Categoria
from schemas.obra import ObraCreate, ObraUpdate, ObraResponse
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/obras", tags=["Obras"])

UPLOAD_DIR = os.path.join("static", "uploads", "capas")
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


@router.get("/", response_model=List[ObraResponse])
def listar_obras(db: Session = Depends(get_db)):
    """retorna todas as obras cadastradas"""
    obras = db.query(Obra).all()
    return obras


@router.get("/{obra_id}", response_model=ObraResponse)
def buscar_obra(obra_id: str, db: Session = Depends(get_db)):
    """busca obra específica por id"""
    obra = db.query(Obra).filter(Obra.id == obra_id).first()
    
    if not obra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Obra não encontrada"
        )
    
    return obra


@router.post("/", response_model=ObraResponse, status_code=status.HTTP_201_CREATED)
def criar_obra(obra_data: ObraCreate, db: Session = Depends(get_db)):
    """cria obra e gera seus exemplares físicos automaticamente"""
    from models.exemplar import Exemplar, StatusExemplar
    
    categoria = db.query(Categoria).filter(Categoria.id == obra_data.categoriaId).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    isbn_existente = db.query(Obra).filter(Obra.isbn == obra_data.isbn).first()
    if isbn_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ISBN já cadastrado"
        )
    
    obra_id = str(uuid.uuid4())
    nova_obra = Obra(
        id=obra_id,
        titulo=obra_data.titulo,
        autor=obra_data.autor,
        isbn=obra_data.isbn,
        categoriaId=obra_data.categoriaId,
        editora=obra_data.editora,
        anoPublicacao=obra_data.anoPublicacao,
        descricao=obra_data.descricao,
        capa=obra_data.capa,
        totalExemplares=obra_data.totalExemplares,
        exemplaresDisponiveis=obra_data.exemplaresDisponiveis
    )
    
    db.add(nova_obra)
    db.flush()
    
    for i in range(1, obra_data.totalExemplares + 1):
        codigo_exemplar = f"{obra_id[:8]}-{str(i).zfill(3)}"
        
        exemplar = Exemplar(
            id=str(uuid.uuid4()),
            obraId=obra_id,
            codigo=codigo_exemplar,
            status=StatusExemplar.disponivel,
            localizacao=None
        )
        db.add(exemplar)
    
    db.commit()
    db.refresh(nova_obra)
    
    return nova_obra


@router.put("/{obra_id}", response_model=ObraResponse)
def atualizar_obra(obra_id: str, obra_data: ObraUpdate, db: Session = Depends(get_db)):
    """atualiza campos de uma obra existente"""
    
    obra = db.query(Obra).filter(Obra.id == obra_id).first()
    
    if not obra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Obra não encontrada"
        )
    
    update_data = obra_data.model_dump(exclude_unset=True)
    
    for campo, valor in update_data.items():
        setattr(obra, campo, valor)
    
    db.commit()
    db.refresh(obra)
    
    return obra


@router.delete("/{obra_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_obra(obra_id: str, db: Session = Depends(get_db)):
    """remove obra do sistema"""
    
    obra = db.query(Obra).filter(Obra.id == obra_id).first()
    
    if not obra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Obra não encontrada"
        )
    
    db.delete(obra)
    db.commit()
    
    return None


@router.post("/{obra_id}/upload-capa")
async def upload_capa(obra_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """recebe arquivo de imagem e define como capa da obra"""
    
    obra = db.query(Obra).filter(Obra.id == obra_id).first()
    if not obra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Obra não encontrada"
        )
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato não permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    timestamp = int(datetime.now().timestamp())
    filename = f"obra_{obra_id}_{timestamp}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )
    
    obra.capa = f"/static/uploads/capas/{filename}"
    db.commit()
    db.refresh(obra)
    
    return {
        "message": "Capa enviada com sucesso",
        "filename": filename,
        "path": obra.capa
    }
