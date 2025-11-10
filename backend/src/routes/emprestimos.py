import uuid
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.emprestimo import Emprestimo
from models.exemplar import Exemplar
from models.obra import Obra
from models.usuario import Usuario
from schemas.emprestimo import EmprestimoCreate, EmprestimoResponse, EmprestimoUpdate


def atualizar_status_atrasados(db: Session) -> None:
    """Atualiza automaticamente empréstimos que já passaram da data."""
    hoje = date.today()
    emprestimos_ativos = db.query(Emprestimo).filter(
        Emprestimo.status == "ativo",
        Emprestimo.dataDevolucao.is_(None),
    ).all()

    houve_atualizacao = False
    for emprestimo in emprestimos_ativos:
        data_prevista = (
            date.fromisoformat(emprestimo.dataPrevistaDevolucao)
            if isinstance(emprestimo.dataPrevistaDevolucao, str)
            else emprestimo.dataPrevistaDevolucao
        )
        if data_prevista < hoje:
            emprestimo.status = "atrasado"
            houve_atualizacao = True

    if houve_atualizacao:
        db.commit()


def _get_status_value(status_field) -> str:
    return getattr(status_field, "value", status_field)


def _get_or_404(db: Session, model, entity_id: str, mensagem: str):
    instancia = db.query(model).filter(model.id == entity_id).first()
    if not instancia:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=mensagem)
    return instancia


router = APIRouter(prefix="/emprestimos", tags=["Empréstimos"])


@router.get("/", response_model=List[EmprestimoResponse])
def listar_emprestimos(db: Session = Depends(get_db)):
    """Lista todos os empréstimos e atualiza status de atrasados"""
    atualizar_status_atrasados(db)
    emprestimos = db.query(Emprestimo).all()
    return emprestimos


@router.get("/{emprestimo_id}", response_model=EmprestimoResponse)
def buscar_emprestimo(emprestimo_id: str, db: Session = Depends(get_db)):
    """Busca empréstimo por ID"""
    atualizar_status_atrasados(db)
    emprestimo = db.query(Emprestimo).filter(Emprestimo.id == emprestimo_id).first()
    
    if not emprestimo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empréstimo não encontrado"
        )
    
    return emprestimo


@router.post("/", response_model=EmprestimoResponse, status_code=status.HTTP_201_CREATED)
def criar_emprestimo(emprestimo_data: EmprestimoCreate, db: Session = Depends(get_db)):
    """Cria novo empréstimo"""

    usuario = _get_or_404(db, Usuario, emprestimo_data.usuarioId, "Usuário não encontrado")
    if _get_status_value(usuario.status) != "ativo":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário está inativo ou suspenso",
        )

    exemplar = _get_or_404(db, Exemplar, emprestimo_data.exemplarId, "Exemplar não encontrado")
    if _get_status_value(exemplar.status) != "disponivel":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exemplar não está disponível",
        )

    obra = _get_or_404(db, Obra, emprestimo_data.obraId, "Obra não encontrada")

    novo_emprestimo = Emprestimo(
        id=str(uuid.uuid4()),
        usuarioId=emprestimo_data.usuarioId,
        exemplarId=emprestimo_data.exemplarId,
        obraId=emprestimo_data.obraId,
        dataEmprestimo=emprestimo_data.dataEmprestimo,
        dataPrevistaDevolucao=emprestimo_data.dataPrevistaDevolucao,
        dataDevolucao=emprestimo_data.dataDevolucao,
        status=emprestimo_data.status,
        renovacoes=emprestimo_data.renovacoes,
    )

    db.add(novo_emprestimo)

    exemplar.status = "emprestado"
    obra.exemplaresDisponiveis = max(obra.exemplaresDisponiveis - 1, 0)

    db.commit()
    db.refresh(novo_emprestimo)

    return novo_emprestimo


@router.put("/{emprestimo_id}", response_model=EmprestimoResponse)
def atualizar_emprestimo(emprestimo_id: str, emprestimo_data: EmprestimoUpdate, db: Session = Depends(get_db)):
    """Atualiza dados do empréstimo"""
    
    emprestimo = db.query(Emprestimo).filter(Emprestimo.id == emprestimo_id).first()
    
    if not emprestimo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empréstimo não encontrado",
        )

    # Atualizar apenas campos fornecidos
    update_data = emprestimo_data.model_dump(exclude_unset=True)

    if update_data.get("dataDevolucao"):
        exemplar = _get_or_404(db, Exemplar, emprestimo.exemplarId, "Exemplar não encontrado")
        exemplar.status = "disponivel"

        obra = _get_or_404(db, Obra, emprestimo.obraId, "Obra não encontrada")
        obra.exemplaresDisponiveis += 1

        update_data["status"] = "devolvido"

    for campo, valor in update_data.items():
        setattr(emprestimo, campo, valor)

    db.commit()
    db.refresh(emprestimo)

    return emprestimo


@router.delete("/{emprestimo_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_emprestimo(emprestimo_id: str, db: Session = Depends(get_db)):
    """Deleta empréstimo"""
    
    emprestimo = db.query(Emprestimo).filter(Emprestimo.id == emprestimo_id).first()
    
    if not emprestimo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empréstimo não encontrado"
        )
    
    db.delete(emprestimo)
    db.commit()
    
    return None
