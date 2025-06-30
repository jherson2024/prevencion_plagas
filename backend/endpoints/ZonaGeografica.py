from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import get_connection
from typing import Optional
import mysql.connector

router = APIRouter()

class ZonaResumen(BaseModel):
    zona_nombre: str
    total_cultivos: int
    total_capturas: int
    total_diagnosticos: int
    total_alertas: int
    total_recomendaciones: int

@router.get("/resumen-zona/{zona_id}", response_model=ZonaResumen)
def obtener_resumen_zona(zona_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Obtener nombre de la zona
        cursor.execute("""
            SELECT ZonNom FROM ZONA_GEOGRAFICA WHERE ZonCod = %s AND ZonEstReg = 'A'
        """, (zona_id,))
        zona = cursor.fetchone()
        if not zona:
            raise HTTPException(status_code=404, detail="Zona no encontrada")

        # Total de cultivos asociados a mapas en esta zona
        cursor.execute("""
            SELECT COUNT(*) AS total_cultivos
            FROM CULTIVO_PARCELA CP
            JOIN MAPA_PARCELA MP ON CP.CulMapParCod = MP.MapCod
            WHERE MP.MapZonGeoCod = %s AND CP.CulEstReg = 'A' AND MP.MapEstReg = 'A'
        """, (zona_id,))
        cultivos = cursor.fetchone()["total_cultivos"]

        # Total de capturas
        cursor.execute("""
            SELECT COUNT(*) AS total_capturas
            FROM CAPTURA C
            JOIN UBICACION U ON C.CapUbiCod = U.UbiCod
            JOIN MAPA_PARCELA MP ON U.UbiMapParCod = MP.MapCod
            WHERE MP.MapZonGeoCod = %s AND C.CapEstReg = 'A' AND U.UbiEstReg = 'A'
        """, (zona_id,))
        capturas = cursor.fetchone()["total_capturas"]

        # Total de diagnósticos
        cursor.execute("""
            SELECT COUNT(*) AS total_diagnosticos
            FROM DIAGNOSTICO D
            JOIN CAPTURA C ON D.DiaCapCod = C.CapCod
            JOIN UBICACION U ON C.CapUbiCod = U.UbiCod
            JOIN MAPA_PARCELA MP ON U.UbiMapParCod = MP.MapCod
            WHERE MP.MapZonGeoCod = %s AND D.DiaEstReg = 'A'
        """, (zona_id,))
        diagnosticos = cursor.fetchone()["total_diagnosticos"]

        # Total de alertas asignadas a usuarios de esta zona
        cursor.execute("""
            SELECT COUNT(DISTINCT UA.UsuAleCod) AS total_alertas
            FROM USUARIO_ALERTA UA
            JOIN USUARIO U ON UA.UsuUsuCod = U.UsuCod
            JOIN MAPA_PARCELA MP ON U.UsuCod = MP.MapUsuCod
            WHERE MP.MapZonGeoCod = %s AND UA.UsuEstReg = 'A'
        """, (zona_id,))
        alertas = cursor.fetchone()["total_alertas"]

        # Total de recomendaciones de plagas para esta zona
        cursor.execute("""
            SELECT COUNT(*) AS total_recomendaciones
            FROM RECOMENDACION R
            JOIN PLAGA P ON R.RecPlaCod = P.PlaCod
            JOIN ESTADISTICA_AGREGADA EA ON EA.EstPlaCod = P.PlaCod
            WHERE EA.EstZonGeoCod = %s AND R.RecEstReg = 'A'
        """, (zona_id,))
        recomendaciones = cursor.fetchone()["total_recomendaciones"]

        return ZonaResumen(
            zona_nombre=zona["ZonNom"],
            total_cultivos=cultivos,
            total_capturas=capturas,
            total_diagnosticos=diagnosticos,
            total_alertas=alertas,
            total_recomendaciones=recomendaciones
        )

    finally:
        cursor.close()
        conn.close()
