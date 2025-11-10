import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models.usuario import Usuario
from models.emprestimo import Emprestimo
from models.reserva import Reserva
from models.administrador import Administrador

logger = logging.getLogger(__name__)


class UsuarioService:
    
    @staticmethod
    def excluir_usuario_completo(db: Session, usuario_id: str) -> bool:
        try:
            usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
            if not usuario:
                raise ValueError(f"Usuário {usuario_id} não encontrado")
            
            logger.info(f"Excluindo usuário: {usuario.nome} ({usuario_id})")
            
            emprestimos_count = db.query(Emprestimo).filter(
                Emprestimo.usuarioId == usuario_id
            ).delete(synchronize_session=False)
            
            logger.info(f"Deletados {emprestimos_count} empréstimos")
            
            reservas_count = db.query(Reserva).filter(
                Reserva.usuarioId == usuario_id
            ).delete(synchronize_session=False)
            
            logger.info(f"Deletadas {reservas_count} reservas")
            
            admin_count = db.query(Administrador).filter(
                Administrador.usuarioId == usuario_id
            ).delete(synchronize_session=False)
            
            if admin_count > 0:
                logger.info("Deletado registro de administrador")
            
            db.delete(usuario)
            db.commit()
            
            logger.info(f"Usuário {usuario_id} excluído com sucesso")
            return True
            
        except ValueError as e:
            logger.error(f"Erro de validação: {str(e)}")
            db.rollback()
            raise
            
        except SQLAlchemyError as e:
            logger.error(f"Erro no banco de dados: {str(e)}")
            db.rollback()
            raise Exception(f"Erro ao excluir usuário: {str(e)}")
            
        except Exception as e:
            logger.error(f"Erro inesperado: {str(e)}")
            db.rollback()
            raise Exception(f"Erro inesperado: {str(e)}")
    
    @staticmethod
    def listar_dependencias_usuario(db: Session, usuario_id: str) -> dict:
        emprestimos = db.query(Emprestimo).filter(
            Emprestimo.usuarioId == usuario_id
        ).count()
        
        reservas = db.query(Reserva).filter(
            Reserva.usuarioId == usuario_id
        ).count()
        
        administrador = db.query(Administrador).filter(
            Administrador.usuarioId == usuario_id
        ).count()
        
        return {
            "emprestimos": emprestimos,
            "reservas": reservas,
            "administrador": administrador > 0
        }
