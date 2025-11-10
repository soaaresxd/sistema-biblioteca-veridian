from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


class StatusExemplar(enum.Enum):
    """Enum para status do exemplar"""
    disponivel = "disponivel"
    emprestado = "emprestado"
    reservado = "reservado"
    manutencao = "manutencao"


class Exemplar(Base):
    """
    Modelo de Exemplar.
    Representa um exemplar físico de uma obra.
    Uma obra pode ter vários exemplares.
    """
    __tablename__ = "exemplares"
    
    id = Column(String, primary_key=True, index=True)
    obraId = Column('obra_id', String, ForeignKey("obras.id", ondelete="CASCADE"), nullable=False)
    codigo = Column(String, unique=True, nullable=False, index=True)  # Código de barras/etiqueta
    status = Column(Enum(StatusExemplar), default=StatusExemplar.disponivel, nullable=False)
    localizacao = Column(String, nullable=True)  # Estante/prateleira
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Exemplar(id={self.id}, codigo={self.codigo}, status={self.status.value})>"
