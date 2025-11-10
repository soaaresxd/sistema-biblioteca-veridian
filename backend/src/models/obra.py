from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Obra(Base):
    """
    Modelo de Obra.
    Representa um livro/publicação na biblioteca.
    """
    __tablename__ = "obras"
    
    id = Column(String, primary_key=True, index=True)
    titulo = Column(String, nullable=False, index=True)
    autor = Column(String, nullable=False)
    isbn = Column(String, unique=True, nullable=False)
    categoriaId = Column('categoria_id', String, ForeignKey("categorias.id"), nullable=False)
    editora = Column(String, nullable=True)
    anoPublicacao = Column('ano_publicacao', Integer, nullable=True)
    descricao = Column(String, nullable=True)
    capa = Column(String, nullable=True)  # URL ou caminho do arquivo
    totalExemplares = Column('total_exemplares', Integer, default=0, nullable=False)
    exemplaresDisponiveis = Column('exemplares_disponiveis', Integer, default=0, nullable=False)
    
    # Timestamps automáticos
    criadoEm = Column('criado_em', DateTime, default=datetime.utcnow, nullable=False)
    atualizadoEm = Column('atualizado_em', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamento com Categoria
    categoria = relationship("Categoria", backref="obras", foreign_keys=[categoriaId])
    
    # Relacionamentos com cascade delete
    exemplares = relationship("Exemplar", backref="obra_rel", cascade="all, delete-orphan", passive_deletes=True)
    emprestimos = relationship("Emprestimo", backref="obra_rel_emp", cascade="all, delete-orphan", passive_deletes=True)
    reservas = relationship("Reserva", backref="obra_rel_res", cascade="all, delete-orphan", passive_deletes=True)
    
    def __repr__(self):
        return f"<Obra(id={self.id}, titulo={self.titulo}, autor={self.autor})>"
