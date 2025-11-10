from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class EmprestimoBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    usuarioId: str
    exemplarId: str
    obraId: str
    dataEmprestimo: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    dataPrevistaDevolucao: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    dataDevolucao: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')
    status: str = Field(default="ativo", pattern=r'^(ativo|devolvido|atrasado)$')
    renovacoes: int = Field(default=0, ge=0)


class EmprestimoCreate(EmprestimoBase):
    pass


class EmprestimoUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    dataPrevistaDevolucao: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')
    dataDevolucao: Optional[str] = Field(None, pattern=r'^\d{4}-\d{2}-\d{2}$')
    status: Optional[str] = Field(None, pattern=r'^(ativo|devolvido|atrasado)$')
    renovacoes: Optional[int] = Field(None, ge=0)


class EmprestimoResponse(EmprestimoBase):
    id: str
    criadoEm: datetime
    atualizadoEm: datetime
