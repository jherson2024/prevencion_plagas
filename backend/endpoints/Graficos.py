from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter()

@router.get("/parcelas/{parcela_id}/estadisticas")
def obtener_estadisticas_por_parcela(parcela_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT 
        p.PlaNom AS plaga,
        AVG(d.DiaNivDañ) AS nivel_promedio_danio,
        COUNT(*) AS total_diagnosticos
    FROM MAPA_PARCELA mp
    JOIN UBICACION u ON u.UbiMapParCod = mp.MapCod
    JOIN CAPTURA c ON c.CapUbiCod = u.UbiCod
    JOIN DIAGNOSTICO d ON d.DiaCapCod = c.CapCod
    JOIN PLAGA p ON p.PlaCod = d.DiaPlaCod
    WHERE mp.MapCod = %s AND d.DiaEstReg = 'A'
    GROUP BY p.PlaNom;
    """

    try:
        cursor.execute(query, (parcela_id,))
        resultados = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la base de datos: {str(e)}")

    if not resultados:
        raise HTTPException(status_code=404, detail="No se encontraron estadísticas para esta parcela.")

    return {"parcela_id": parcela_id, "estadisticas": resultados}
