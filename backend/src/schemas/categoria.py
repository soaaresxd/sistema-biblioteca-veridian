from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class CategoriaBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    nome: str = Field(..., min_length=2, max_length=100)
    descricao: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    descricao: Optional[str] = None


class CategoriaResponse(CategoriaBase):
    id: str
    criadoEm: datetime
    atualizadoEm: datetime
