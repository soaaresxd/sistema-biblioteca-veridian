from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Administrador(Base):
    """
    Modelo de Administrador.
    Relação 1:1 com Usuario - todo administrador é um usuário com privilégios elevados.
    """
    __tablename__ = "administradores"
    
    id = Column(String, primary_key=True, index=True)
    usuarioId = Column('usuario_id', String, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    nivelAcesso = Column('nivel_acesso', Integer, default=1, nullable=False)  # 1=básico, 2=intermediário, 3=total
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamento com Usuario
    usuario = relationship("Usuario", backref="administrador", foreign_keys=[usuarioId])
    
    def __repr__(self):
        return f"<Administrador(id={self.id}, usuario_id={self.usuario_id}, nivel_acesso={self.nivel_acesso})>"
