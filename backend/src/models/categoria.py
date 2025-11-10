from sqlalchemy import Column, String, DateTime
from datetime import datetime
from database import Base


class Categoria(Base):
    """
    Modelo de Categoria.
    Categoriza as obras da biblioteca (Ficção, Tecnologia, etc).
    """
    __tablename__ = "categorias"
    
    id = Column(String, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    descricao = Column(String, nullable=True)
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Categoria(id={self.id}, nome={self.nome})>"
