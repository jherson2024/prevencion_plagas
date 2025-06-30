from fastapi import APIRouter, HTTPException, Request
from datetime import date
from database import get_connection

router = APIRouter()

@router.post("/accesos/crear")
async def crear_acceso_parcela(request: Request):
    body = await request.json()
    AccUsuCod = body.get("AccUsuCod")
    AccMapParCod = body.get("AccMapParCod")
    AccRolAcc = body.get("AccRolAcc")
    AccPer = body.get("AccPer", "")  # Opcional

    if not all([AccUsuCod, AccMapParCod, AccRolAcc]):
        raise HTTPException(status_code=400, detail="Datos incompletos")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO acceso_parcela (
            AccUsuCod, AccMapParCod, AccRolAcc, AccPer, AccFecAsi, AccEstReg
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (AccUsuCod, AccMapParCod, AccRolAcc, AccPer, date.today(), "A"))
    conn.commit()
    acceso_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"AccCod": acceso_id, "message": "Acceso a parcela registrado"}

@router.get("/accesos/listar/{AccMapParCod}")
async def listar_accesos_parcela(AccMapParCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.*, u.UsuNom
        FROM acceso_parcela a
        JOIN usuario u ON a.AccUsuCod = u.UsuCod
        WHERE a.AccMapParCod = %s AND a.AccEstReg = 'A'
    """, (AccMapParCod,))
    accesos = cursor.fetchall()
    cursor.close()
    conn.close()
    return accesos

@router.delete("/accesos/eliminar/{AccCod}")
async def eliminar_acceso(AccCod: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE acceso_parcela SET AccEstReg = 'I' WHERE AccCod = %s", (AccCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Acceso eliminado lógicamente"}
@router.get("/usuarios/buscar")
async def buscar_usuario_por_correo(correo: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT UsuCod, UsuNom, UsuCor
        FROM usuario
        WHERE UsuCor = %s AND UsuEstReg = 'A'
    """, (correo,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return usuario
