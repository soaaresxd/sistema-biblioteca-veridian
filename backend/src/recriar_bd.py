import os
from database import Base, engine, init_db

def recriar_banco():
    """Remove e recria o banco de dados do zero."""
    
    db_path = "veridian.db"
    
    if os.path.exists(db_path):
        print(f"🗑️  Removendo banco de dados antigo: {db_path}")
        os.remove(db_path)
    
    print("🔨 Criando novo banco de dados com estrutura atualizada...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Banco de dados recriado com sucesso!")
    print("📝 Execute 'python dados_bd.py' para popular com dados de exemplo")

if __name__ == "__main__":
    recriar_banco()
