from fastapi import APIRouter, HTTPException, Query
from database import get_connection
from typing import List, Dict

router = APIRouter()

@router.get("/linea-tiempo", response_model=List[Dict])
def obtener_linea_tiempo(map_cod: int = Query(..., description="Código de la parcela")):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                'Captura' AS Evento,
                c.CapFec AS Fecha,
                CONCAT('Captura realizada. Nota: ', c.CapNot) AS Detalle
            FROM CAPTURA c
            JOIN UBICACION u ON c.CapUbiCod = u.UbiCod
            JOIN MAPA_PARCELA m ON u.UbiMapParCod = m.MapCod
            WHERE m.MapCod = %s AND c.CapEstReg = 'A'

            UNION ALL

            SELECT 
                'Diagnóstico' AS Evento,
                d.DiaFec AS Fecha,
                CONCAT('Plaga: ', p.PlaNom, ', Nivel de daño: ', d.DiaNivDañ, ', Confianza: ', d.DiaCon, ', Detalle: ', d.DiaDet) AS Detalle
            FROM DIAGNOSTICO d
            JOIN CAPTURA c ON d.DiaCapCod = c.CapCod
            JOIN UBICACION u ON c.CapUbiCod = u.UbiCod
            JOIN MAPA_PARCELA m ON u.UbiMapParCod = m.MapCod
            JOIN PLAGA p ON d.DiaPlaCod = p.PlaCod
            WHERE m.MapCod = %s AND d.DiaEstReg = 'A'

            UNION ALL

            SELECT 
                'Etiqueta Manual' AS Evento,
                e.EtiFec AS Fecha,
                CONCAT('Etiquetado por usuario ', u.UsuNom, '. Observación: ', e.EtiObs) AS Detalle
            FROM ETIQUETA_MANUAL e
            JOIN USUARIO u ON e.EtiUsuCod = u.UsuCod
            JOIN DIAGNOSTICO d ON e.EtiDiaCod = d.DiaCod
            JOIN CAPTURA c ON d.DiaCapCod = c.CapCod
            JOIN UBICACION ub ON c.CapUbiCod = ub.UbiCod
            JOIN MAPA_PARCELA m ON ub.UbiMapParCod = m.MapCod
            WHERE m.MapCod = %s AND e.EtiEstReg = 'A'

            UNION ALL

            SELECT 
                'Predicción' AS Evento,
                p.PreFecEst AS Fecha,
                CONCAT('Plaga: ', pl.PlaNom, ', Probabilidad: ', p.PrePro) AS Detalle
            FROM PREDICCION p
            JOIN PLAGA pl ON p.PrePlaCod = pl.PlaCod
            JOIN ZONA_GEOGRAFICA z ON p.PreZonGeoCod = z.ZonCod
            JOIN MAPA_PARCELA m ON m.MapZonGeoCod = z.ZonCod
            WHERE m.MapCod = %s AND p.PreEstReg = 'A'

            UNION ALL

            SELECT 
                'Alerta' AS Evento,
                a.AleFecGen AS Fecha,
                CONCAT('Tipo: ', a.AleTip, ', Gravedad: ', a.AleGra, ', Mensaje: ', a.AleMen) AS Detalle
            FROM USUARIO_ALERTA ua
            JOIN ALERTA a ON ua.UsuAleCod = a.AleCod
            JOIN USUARIO u ON ua.UsuUsuCod = u.UsuCod
            JOIN MAPA_PARCELA m ON u.UsuCod = m.MapUsuCod
            WHERE m.MapCod = %s AND a.AleEstReg = 'A'

            ORDER BY Fecha;
        """

        # Ejecutamos la consulta pasando el mismo parámetro 5 veces
        cursor.execute(query, (map_cod, map_cod, map_cod, map_cod, map_cod))
        resultados = cursor.fetchall()

        cursor.close()
        conn.close()

        return resultados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
