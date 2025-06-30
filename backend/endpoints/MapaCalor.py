from typing import Dict, List
from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter()

@router.get("/intensidad-plagas/", response_model=List[Dict])
def obtener_intensidad_plagas():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            mp.MapCod AS parcela_id,
            mp.MapNom AS nombre_parcela,
            pl.PlaNom AS nombre_plaga,
            d.DiaNivDañ AS nivel_danio,
            u.UbiCoo AS latitud,
            u.UbiCooB AS longitud,
            d.DiaFec AS fecha_diagnostico
        FROM DIAGNOSTICO d
        INNER JOIN PLAGA pl ON d.DiaPlaCod = pl.PlaCod
        INNER JOIN CAPTURA c ON d.DiaCapCod = c.CapCod
        INNER JOIN UBICACION u ON c.CapUbiCod = u.UbiCod
        INNER JOIN MAPA_PARCELA mp ON u.UbiMapParCod = mp.MapCod
        WHERE d.DiaEstReg = 'A' AND mp.MapEstReg = 'A' AND u.UbiEstReg = 'A'
        """
        
        cursor.execute(query)
        resultados = cursor.fetchall()
        
        return resultados
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
