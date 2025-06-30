from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter()

# ==========================
# ESTADISTICA_AGREGADA
# ==========================

@router.get("/", tags=["Estadísticas"])
def listar_estadisticas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ESTADISTICA_AGREGADA WHERE EstEstReg = 'A'")
        stats = cursor.fetchall()
        cursor.close()
        conn.close()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zona/{EstZonGeoCod}", tags=["Estadísticas"])
def estadisticas_por_zona(EstZonGeoCod: int):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM ESTADISTICA_AGREGADA 
            WHERE EstZonGeoCod = %s AND EstEstReg = 'A'
        """, (EstZonGeoCod,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/crear", tags=["Estadísticas"])
def crear_estadistica(EstFec: str, EstZonGeoCod: int, EstCulCod: int, EstPlaCod: int,
                      EstTotCas: int, EstMedDañ: float, EstEstReg: str = 'A'):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ESTADISTICA_AGREGADA 
            (EstFec, EstZonGeoCod, EstCulCod, EstPlaCod, EstTotCas, EstMedDañ, EstEstReg)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (EstFec, EstZonGeoCod, EstCulCod, EstPlaCod, EstTotCas, EstMedDañ, EstEstReg))
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Estadística registrada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
e