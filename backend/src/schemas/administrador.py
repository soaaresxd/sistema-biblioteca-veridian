from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class AdministradorBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    usuarioId: str = Field(..., min_length=1)
    nivelAcesso: int = Field(default=1, ge=1, le=3)


class AdministradorCreate(AdministradorBase):
    pass


class AdministradorUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    nivelAcesso: Optional[int] = Field(None, ge=1, le=3)


class AdministradorResponse(AdministradorBase):
    id: str
    criadoEm: datetime
    atualizadoEm: datetime
