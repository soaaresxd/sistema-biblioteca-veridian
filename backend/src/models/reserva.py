from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


class StatusReserva(enum.Enum):
    """Enum para status da reserva"""
    ativa = "ativa"
    cancelada = "cancelada"
    concluida = "concluida"


class Reserva(Base):
    """
    Modelo de Reserva.
    Permite usuários reservarem obras que estão emprestadas.
    """
    __tablename__ = "reservas"
    
    id = Column(String, primary_key=True, index=True)
    usuarioId = Column('usuario_id', String, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    obraId = Column('obra_id', String, ForeignKey("obras.id", ondelete="CASCADE"), nullable=False)
    dataReserva = Column('data_reserva', String, nullable=False)  # Formato: YYYY-MM-DD
    status = Column(Enum(StatusReserva), default=StatusReserva.ativa, nullable=False)
    dataExpiracao = Column('data_expiracao', String, nullable=False)  # Formato: YYYY-MM-DD
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    usuario = relationship("Usuario", backref="reservas", foreign_keys=[usuarioId])
    
    def __repr__(self):
        return f"<Reserva(id={self.id}, usuario_id={self.usuario_id}, obra_id={self.obra_id}, status={self.status.value})>"
