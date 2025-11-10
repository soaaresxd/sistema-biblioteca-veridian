from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class UsuarioBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    nome: str = Field(..., min_length=3, max_length=200)
    cpf: str = Field(..., min_length=11, max_length=11, pattern=r'^\d{11}$')
    email: EmailStr
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    status: str = Field(default="ativo", pattern=r'^(ativo|inativo|suspenso)$')
    role: str = Field(default="user", pattern=r'^(user|admin)$')


class UsuarioCreate(UsuarioBase):
    senha: str = Field(..., min_length=6, max_length=100)
    dataCadastro: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    
    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('CPF deve conter apenas números')
        if len(v) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return v


class UsuarioUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    nome: Optional[str] = Field(None, min_length=3, max_length=200)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r'^(ativo|inativo|suspenso)$')
    role: Optional[str] = Field(None, pattern=r'^(user|admin)$')
    senha: Optional[str] = Field(None, min_length=6, max_length=100)


class UsuarioResponse(UsuarioBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    dataCadastro: str
    criadoEm: datetime
    atualizadoEm: datetime


class UsuarioLogin(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=11)
    senha: str = Field(..., min_length=6, max_length=100)
