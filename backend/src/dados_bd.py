"""
Script para popular banco de dados com dados iniciais.
Cria: Categorias, Obras e Exemplares (SEM usuários).
"""

from database import SessionLocal, init_db
from models.categoria import Categoria
from models.obra import Obra
from models.exemplar import Exemplar


def popular_banco():
    """Popula banco de dados com catálogo inicial de livros"""
    
    print("🔧 Inicializando banco de dados...")
    init_db()
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem dados
        categorias_existentes = db.query(Categoria).count()
        if categorias_existentes > 0:
            print("⚠️  Banco de dados já possui dados!")
            resposta = input("Deseja continuar e adicionar mais dados? (s/n): ")
            if resposta.lower() != 's':
                print("❌ Operação cancelada")
                return
        
        print("\n📚 Criando categorias...")
        
        # Criar categorias
        categorias = [
            Categoria(id='1', nome='Ficção', descricao='Obras de literatura ficcional'),
            Categoria(id='2', nome='Não-Ficção', descricao='Obras baseadas em fatos reais'),
            Categoria(id='3', nome='Ciência', descricao='Livros científicos e acadêmicos'),
            Categoria(id='4', nome='Tecnologia', descricao='Programação, TI e tecnologia'),
            Categoria(id='5', nome='História', descricao='Livros de história e biografias'),
            Categoria(id='6', nome='Filosofia', descricao='Obras filosóficas e pensamento'),
            Categoria(id='7', nome='Autoajuda', descricao='Desenvolvimento pessoal'),
        ]
        
        for cat in categorias:
            db.add(cat)
        
        db.commit()
        print(f"✅ {len(categorias)} categorias criadas")
        
        print("\n📖 Criando obras...")
        
        # Criar obras
        obras = [
            Obra(
                id='1',
                titulo='1984',
                autor='George Orwell',
                isbn='978-0451524935',
                categoriaId='1',
                editora='Companhia das Letras',
                anoPublicacao=1949,
                descricao='Distopia sobre vigilância e totalitarismo',
                totalExemplares=5,
                exemplaresDisponiveis=5
            ),
            Obra(
                id='2',
                titulo='Clean Code',
                autor='Robert C. Martin',
                isbn='978-0132350884',
                categoriaId='4',
                editora='Prentice Hall',
                anoPublicacao=2008,
                descricao='Manual de boas práticas em programação',
                totalExemplares=8,
                exemplaresDisponiveis=8
            ),
            Obra(
                id='3',
                titulo='Sapiens',
                autor='Yuval Noah Harari',
                isbn='978-0062316097',
                categoriaId='5',
                editora='L&PM',
                anoPublicacao=2011,
                descricao='Uma breve história da humanidade',
                totalExemplares=6,
                exemplaresDisponiveis=6
            ),
            Obra(
                id='4',
                titulo='O Hobbit',
                autor='J.R.R. Tolkien',
                isbn='978-0547928227',
                categoriaId='1',
                editora='Harper Collins',
                anoPublicacao=1937,
                descricao='Aventura fantástica de Bilbo Bolseiro',
                totalExemplares=7,
                exemplaresDisponiveis=7
            ),
            Obra(
                id='5',
                titulo='Algoritmos',
                autor='Thomas Cormen',
                isbn='978-8535236996',
                categoriaId='4',
                editora='Elsevier',
                anoPublicacao=2009,
                descricao='Teoria e prática de algoritmos',
                totalExemplares=10,
                exemplaresDisponiveis=10
            ),
            Obra(
                id='6',
                titulo='O Príncipe',
                autor='Nicolau Maquiavel',
                isbn='978-8525406408',
                categoriaId='6',
                editora='Penguin',
                anoPublicacao=1532,
                descricao='Tratado sobre política e poder',
                totalExemplares=4,
                exemplaresDisponiveis=4
            ),
            Obra(
                id='7',
                titulo='Poder do Hábito',
                autor='Charles Duhigg',
                isbn='978-8539004119',
                categoriaId='7',
                editora='Objetiva',
                anoPublicacao=2012,
                descricao='Como os hábitos funcionam e como mudá-los',
                totalExemplares=5,
                exemplaresDisponiveis=5
            ),
            Obra(
                id='8',
                titulo='Breve História do Tempo',
                autor='Stephen Hawking',
                isbn='978-8580578072',
                categoriaId='3',
                editora='Intrínseca',
                anoPublicacao=1988,
                descricao='Do Big Bang aos buracos negros',
                totalExemplares=6,
                exemplaresDisponiveis=6
            ),
        ]
        
        for obra in obras:
            db.add(obra)
        
        db.commit()
        print(f"✅ {len(obras)} obras criadas")
        
        print("\n🏷️  Criando exemplares...")
        
        # Criar exemplares para cada obra
        exemplar_counter = 1
        total_exemplares = 0
        
        for obra in obras:
            for i in range(obra.totalExemplares):
                exemplar = Exemplar(
                    id=f'EX{exemplar_counter:03d}',
                    obraId=obra.id,
                    codigo=f'EX{exemplar_counter:03d}',
                    status='disponivel',
                    localizacao=f'Estante {obra.categoriaId}, Prateleira {i+1}'
                )
                db.add(exemplar)
                exemplar_counter += 1
                total_exemplares += 1
        
        db.commit()
        print(f"✅ {total_exemplares} exemplares criados")
        
        print("\n" + "="*60)
        print("✅ BANCO DE DADOS POPULADO COM SUCESSO!")
        print("="*60)
        print(f"\n📊 Resumo:")
        print(f"   • {len(categorias)} categorias")
        print(f"   • {len(obras)} obras")
        print(f"   • {total_exemplares} exemplares")
        print(f"\n⚠️  Usuários: 0 (use 'criar_admin.py' para criar)")
        print(f"⚠️  Empréstimos: 0")
        print(f"⚠️  Reservas: 0")
        print("\n🚀 Próximos passos:")
        print("   1. Execute: python criar_admin.py")
        print("   2. Execute: python main.py")
        print("   3. Acesse: http://localhost:8000/docs")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Erro ao popular banco de dados: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    popular_banco()
