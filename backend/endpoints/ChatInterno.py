from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from database import get_connection

router = APIRouter()

class Mensaje(BaseModel):
    emisor_id: int
    receptor_id: int
    contenido: str

@router.post("/chat/enviar")
def enviar_mensaje(msg: Mensaje):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Verificar que ambos colaboran en al menos una parcela
        cursor.execute("""
            SELECT COUNT(*) FROM ACCESO_PARCELA a
            JOIN ACCESO_PARCELA b ON a.AccMapParCod = b.AccMapParCod
            WHERE a.AccUsuCod = %s AND b.AccUsuCod = %s
              AND a.AccEstReg = 'A' AND b.AccEstReg = 'A'
        """, (msg.emisor_id, msg.receptor_id))
        if cursor.fetchone()[0] == 0:
            raise HTTPException(status_code=403, detail="Los usuarios no colaboran en ninguna parcela")

        # Insertar mensaje
        cursor.execute("""
            INSERT INTO MENSAJE_CHAT (MenUsuCod, MenUsuBCod, MenCon, MenFecHor, MenEstReg)
            VALUES (%s, %s, %s, %s, 'A')
        """, (msg.emisor_id, msg.receptor_id, msg.contenido, datetime.now()))
        conn.commit()
        return {"mensaje": "Mensaje enviado correctamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/chat/entre/{usuario1_id}/{usuario2_id}")
def obtener_conversacion(usuario1_id: int, usuario2_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT MenCod, MenUsuCod, MenUsuBCod, MenCon, MenFecHor
            FROM MENSAJE_CHAT
            WHERE ((MenUsuCod = %s AND MenUsuBCod = %s)
                OR (MenUsuCod = %s AND MenUsuBCod = %s))
              AND MenEstReg = 'A'
            ORDER BY MenFecHor ASC
        """, (usuario1_id, usuario2_id, usuario2_id, usuario1_id))
        mensajes = cursor.fetchall()
        return mensajes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
        
@router.get("/usuarios/{usu_cod}/colaboradores")
def obtener_colaboradores(usu_cod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT DISTINCT u.UsuCod, u.UsuNom, u.UsuCor
            FROM USUARIO u
            JOIN ACCESO_PARCELA ap1 ON ap1.AccUsuCod = %s AND ap1.AccEstReg = 'A'
            JOIN ACCESO_PARCELA ap2 ON ap2.AccMapParCod = ap1.AccMapParCod
                                    AND ap2.AccUsuCod = u.UsuCod AND ap2.AccEstReg = 'A'
            WHERE u.UsuCod != %s AND u.UsuEstReg = 'A'
        """, (usu_cod, usu_cod))

        colaboradores = cursor.fetchall()
        return colaboradores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()