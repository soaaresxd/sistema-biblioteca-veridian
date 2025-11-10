import logging
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./veridian.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Inicializa o banco criando todas as tabelas conhecidas."""
    from models.usuario import Usuario  # noqa: F401
    from models.administrador import Administrador  # noqa: F401
    from models.categoria import Categoria  # noqa: F401
    from models.obra import Obra  # noqa: F401
    from models.exemplar import Exemplar  # noqa: F401
    from models.emprestimo import Emprestimo  # noqa: F401
    from models.reserva import Reserva  # noqa: F401

    Base.metadata.create_all(bind=engine)
    logger.info("Banco de dados inicializado com sucesso")
