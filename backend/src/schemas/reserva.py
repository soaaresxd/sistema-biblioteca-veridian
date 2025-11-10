from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ReservaBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    usuarioId: str
    obraId: str
    dataReserva: str
    dataExpiracao: str


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    status: Optional[str] = None
    dataExpiracao: Optional[str] = None


class ReservaResponse(ReservaBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    status: str
    criadoEm: datetime
    atualizadoEm: datetime
