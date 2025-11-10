from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


class StatusEmprestimo(enum.Enum):
    """Enum para status do empréstimo"""
    ativo = "ativo"
    devolvido = "devolvido"
    atrasado = "atrasado"


class Emprestimo(Base):
    """
    Modelo de Empréstimo.
    Registra empréstimos de exemplares para usuários.
    """
    __tablename__ = "emprestimos"
    
    id = Column(String, primary_key=True, index=True)
    usuarioId = Column('usuario_id', String, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    exemplarId = Column('exemplar_id', String, ForeignKey("exemplares.id", ondelete="CASCADE"), nullable=False)
    obraId = Column('obra_id', String, ForeignKey("obras.id", ondelete="CASCADE"), nullable=False)
    dataEmprestimo = Column('data_emprestimo', String, nullable=False)  # Formato: YYYY-MM-DD
    dataPrevistaDevolucao = Column('data_prevista_devolucao', String, nullable=False)  # Formato: YYYY-MM-DD
    dataDevolucao = Column('data_devolucao', String, nullable=True)  # Formato: YYYY-MM-DD
    status = Column(Enum(StatusEmprestimo), default=StatusEmprestimo.ativo, nullable=False)
    renovacoes = Column(Integer, default=0, nullable=False)
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    usuario = relationship("Usuario", backref="emprestimos", foreign_keys=[usuarioId])
    exemplar = relationship("Exemplar", backref="emprestimos", foreign_keys=[exemplarId])
    
    def __repr__(self):
        return f"<Emprestimo(id={self.id}, usuario_id={self.usuario_id}, obra_id={self.obra_id}, status={self.status.value})>"
