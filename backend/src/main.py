import logging
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from routes.administradores import router as administradores_router
from routes.auth import router as auth_router
from routes.categorias import router as categorias_router
from routes.emprestimos import router as emprestimos_router
from routes.exemplares import router as exemplares_router
from routes.obras import router as obras_router
from routes.reservas import router as reservas_router
from routes.usuarios import router as usuarios_router


logger = logging.getLogger(__name__)


app = FastAPI(
    title="Veridian API",
    description="Sistema de Gerenciamento de Biblioteca",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(usuarios_router)
app.include_router(administradores_router)
app.include_router(categorias_router)
app.include_router(obras_router)
app.include_router(exemplares_router)
app.include_router(emprestimos_router)
app.include_router(reservas_router)


@app.get("/")
def root():
    """Endpoint raiz."""
    return {
        "message": "Veridian API - Sistema de Biblioteca",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    """Verifica status da API."""
    return {"status": "ok", "message": "API funcionando corretamente"}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Inicializando banco de dados")
    init_db()
    logger.info("Iniciando servidor FastAPI em http://127.0.0.1:8000")

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )
