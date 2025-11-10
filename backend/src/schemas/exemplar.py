from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class ExemplarBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    obraId: str
    codigo: str = Field(..., min_length=1, max_length=50)
    status: str = Field(default="disponivel", pattern=r'^(disponivel|emprestado|reservado|manutencao)$')
    localizacao: Optional[str] = None


class ExemplarCreate(ExemplarBase):
    pass


class ExemplarUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    obraId: Optional[str] = None
    codigo: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[str] = Field(None, pattern=r'^(disponivel|emprestado|reservado|manutencao)$')
    localizacao: Optional[str] = None


class ExemplarResponse(ExemplarBase):
    id: str
    criadoEm: datetime
    atualizadoEm: datetime
