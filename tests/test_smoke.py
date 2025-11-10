"""testes básicos de integração para garantir que rotas principais funcionam"""
from __future__ import annotations

import sys
from pathlib import Path

# Adiciona o diretório backend/src ao PYTHONPATH
BACKEND_SRC = Path(__file__).resolve().parent.parent / "backend" / "src"
sys.path.insert(0, str(BACKEND_SRC))

from fastapi.testclient import TestClient

from database import init_db
from main import app

init_db()
client = TestClient(app)


def test_healthcheck() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload.get("status") == "ok"


def test_listar_usuarios_vazio_ok() -> None:
    response = client.get("/usuarios/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_listar_obras() -> None:
    """testa listagem de obras cadastradas"""
    response = client.get("/obras/")
    assert response.status_code == 200
    obras = response.json()
    assert isinstance(obras, list)


def test_listar_categorias() -> None:
    """testa endpoint de categorias"""
    response = client.get("/categorias/")
    assert response.status_code == 200
    categorias = response.json()
    assert isinstance(categorias, list)


def test_buscar_obra_inexistente() -> None:
    """verifica retorno 404 para obra que não existe"""
    response = client.get("/obras/id-inexistente-123")
    assert response.status_code == 404
    assert "não encontrada" in response.json().get("detail", "").lower()


def test_criar_obra_sem_categoria() -> None:
    """tenta criar obra com categoria inválida e espera erro"""
    payload = {
        "titulo": "Teste",
        "autor": "Autor Teste",
        "isbn": "1234567890123",
        "categoriaId": "cat-invalida",
        "totalExemplares": 1,
        "exemplaresDisponiveis": 1
    }
    response = client.post("/obras/", json=payload)
    assert response.status_code in [404, 400]
