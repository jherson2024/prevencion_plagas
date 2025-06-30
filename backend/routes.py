from fastapi import APIRouter, HTTPException,Request
from pydantic import BaseModel
from datetime import date
from database import get_connection  # tu función ya definida
from fastapi import UploadFile, File
import os
router = APIRouter()
@router.post("/auth/login")
async def login(request: Request):
    body = await request.json()
    UsuCor = body.get("UsuCor")
    UsuCon = body.get("UsuCon")
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM USUARIO WHERE UsuCor = %s AND UsuCon = %s AND UsuEstReg = 'A'", (UsuCor, UsuCon))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"message": "Login exitoso", "UsuCod": usuario["UsuCod"],"UsuNom": usuario["UsuNom"]}
@router.post("/usuarios/registrar")
async def registrar_usuario(request: Request):
    body = await request.json()
    UsuNom = body.get("UsuNom")
    UsuCor = body.get("UsuCor")
    UsuCon = body.get("UsuCon")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO USUARIO (UsuNom, UsuCor, UsuCon, UsuFecReg, UsuEstReg)
        VALUES (%s, %s, %s, %s, %s)
    """, (UsuNom, UsuCor, UsuCon, date.today(), "A"))
    conn.commit()
    usuario_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"UsuCod": usuario_id}
