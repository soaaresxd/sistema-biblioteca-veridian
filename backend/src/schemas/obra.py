from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ObraBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    titulo: str = Field(..., min_length=1, max_length=300)
    autor: str = Field(..., min_length=1, max_length=200)
    isbn: str = Field(..., min_length=10, max_length=17)
    categoriaId: str
    editora: Optional[str] = None
    anoPublicacao: Optional[int] = Field(None, ge=1000, le=9999)
    descricao: Optional[str] = None
    capa: Optional[str] = None
    totalExemplares: int = Field(default=0, ge=0)
    exemplaresDisponiveis: int = Field(default=0, ge=0)


class ObraCreate(ObraBase):
    pass


class ObraUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    titulo: Optional[str] = Field(None, min_length=1, max_length=300)
    autor: Optional[str] = Field(None, min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, min_length=10, max_length=17)
    categoriaId: Optional[str] = None
    editora: Optional[str] = None
    anoPublicacao: Optional[int] = Field(None, ge=1000, le=9999)
    descricao: Optional[str] = None
    capa: Optional[str] = None
    totalExemplares: Optional[int] = Field(None, ge=0)
    exemplaresDisponiveis: Optional[int] = Field(None, ge=0)


class ObraResponse(ObraBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    criadoEm: datetime
    atualizadoEm: datetime
