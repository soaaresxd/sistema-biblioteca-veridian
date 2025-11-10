from sqlalchemy import Column, String, DateTime, Enum
from datetime import datetime
from database import Base
import enum


class StatusUsuario(enum.Enum):
    """Enum para status do usuário"""
    ativo = "ativo"
    inativo = "inativo"
    suspenso = "suspenso"


class RoleUsuario(enum.Enum):
    """Enum para role do usuário"""
    user = "user"
    admin = "admin"


class Usuario(Base):
    """
    Modelo de Usuário.
    Representa tanto usuários comuns quanto administradores.
    """
    __tablename__ = "usuarios"
    
    id = Column(String, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cpf = Column(String(11), unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    senhaHash = Column('senha_hash', String, nullable=False)
    telefone = Column(String, nullable=True)
    endereco = Column(String, nullable=True)
    dataCadastro = Column('data_cadastro', String, nullable=False)  # Formato: YYYY-MM-DD
    status = Column(Enum(StatusUsuario), default=StatusUsuario.ativo, nullable=False)
    role = Column(Enum(RoleUsuario), default=RoleUsuario.user, nullable=False)
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Usuario(id={self.id}, nome={self.nome}, cpf={self.cpf}, role={self.role.value})>"
