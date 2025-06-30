from fastapi import APIRouter, HTTPException
from database import get_connection
from datetime import date

router = APIRouter()

@router.post("/diagnostico/")
def procesar_diagnostico(cap_cod: int, pla_cod: int, niv_dañ: float, con: float, mod_cod: int, det: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Insertar el diagnóstico
        cursor.execute("""
            INSERT INTO DIAGNOSTICO (DiaCapCod, DiaPlaCod, DiaNivDañ, DiaCon, DiaModCod, DiaFec, DiaDet, DiaEstReg)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'A')
        """, (cap_cod, pla_cod, niv_dañ, con, mod_cod, date.today(), det))
        conn.commit()
        # Generar alerta si el daño estimado supera 50%
        if niv_dañ > 50:
            mensaje = f"Daño elevado detectado ({niv_dañ}%) para plaga {pla_cod}."
            cursor.execute("""
                INSERT INTO ALERTA (AleTip, AleMen, AleGra, AleFecGen, AleEstReg)
                VALUES (%s, %s, %s, %s, 'A')
            """, ('Daño', mensaje, 'Alta', date.today()))
            alerta_id = cursor.lastrowid
            # Obtener usuarios que deben recibir la alerta (puedes ajustar el criterio)
            cursor.execute("SELECT UsuCod FROM USUARIO WHERE UsuEstReg = 'A'")
            usuarios = cursor.fetchall()
            for (usu_cod,) in usuarios:
                cursor.execute("""
                    INSERT INTO USUARIO_ALERTA (UsuUsuCod, UsuAleCod, UsuLei, UsuFecLec, UsuEstReg)
                    VALUES (%s, %s, 'No', NULL, 'A')
                """, (usu_cod, alerta_id))
            conn.commit()
        return {"mensaje": "Diagnóstico registrado correctamente."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

    