from fastapi import APIRouter, HTTPException,Request
from pydantic import BaseModel
from datetime import date
from database import get_connection  # tu función ya definida
from fastapi import UploadFile, File
from fastapi import Form
import uuid
import os
router = APIRouter()
@router.post("/zonas/crear")
async def crear_zona_geografica(request: Request):
    body = await request.json()
    ZonNom = body.get("ZonNom")
    ZonTipZon = body.get("ZonTipZon")
    ZonReg = body.get("ZonReg")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO zona_geografica (ZonNom, ZonTipZon, ZonReg, ZonEstReg)
        VALUES (%s, %s, %s, %s)
    """, (ZonNom, ZonTipZon, ZonReg, "A"))
    conn.commit()
    zona_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"ZonCod": zona_id, "message": "Zona geográfica registrada"}
@router.post("/parcelas/crear")
async def crear_parcela(
    MapUsuCod: int = Form(...),
    MapZonGeoCod: int = Form(...),
    MapNom: str = Form(...),
    MapCom: str = Form(""),
    archivo: UploadFile = File(...)
):
    carpeta_destino = os.path.join("static", "mapas")
    os.makedirs(carpeta_destino, exist_ok=True)

    extension = archivo.filename.split(".")[-1]
    nombre_archivo = f"{uuid.uuid4()}.{extension}"
    ruta_relativa = os.path.join("static", "mapas", nombre_archivo)
    ruta_absoluta = os.path.join(carpeta_destino, nombre_archivo)

    with open(ruta_absoluta, "wb") as buffer:
        buffer.write(await archivo.read())

    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Insertar parcela
        cursor.execute("""
            INSERT INTO mapa_parcela (
                MapUsuCod, MapZonGeoCod, MapImaMap, MapFecSub, MapNom, MapCom, MapEstReg
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            MapUsuCod, MapZonGeoCod, ruta_relativa, date.today(), MapNom, MapCom, "A"
        ))
        conn.commit()
        parcela_id = cursor.lastrowid

        # Insertar al dueño como colaborador (propietario)
        cursor.execute("""
            INSERT INTO acceso_parcela (
                AccUsuCod, AccMapParCod, AccRolAcc, AccPer, AccFecAsi, AccEstReg
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            MapUsuCod, parcela_id, "propietario", "registrante del mapa", date.today(), "A"
        ))
        conn.commit()

    finally:
        cursor.close()
        conn.close()

    return {"MapCod": parcela_id, "message": "Parcela registrada con éxito"}
@router.post("/cultivos/crear")
async def crear_cultivo(request: Request):
    body = await request.json()
    CulMapParCod = body.get("CulMapParCod")
    CulNomCul = body.get("CulNomCul")
    CulFecIni = body.get("CulFecIni")
    CulFecFin = body.get("CulFecFin")
    CulObs = body.get("CulObs")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cultivo_parcela (CulMapParCod, CulNomCul, CulFecIni, CulFecFin, CulObs, CulEstReg)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (CulMapParCod, CulNomCul, CulFecIni, CulFecFin, CulObs, "A"))
    conn.commit()
    cultivo_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"CulCod": cultivo_id, "message": "Cultivo registrado correctamente"}
@router.get("/zonas/listar")
async def listar_zonas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM zona_geografica WHERE ZonEstReg = 'A'")
    zonas = cursor.fetchall()
    cursor.close()
    conn.close()
    return zonas
@router.put("/zonas/modificar/{ZonCod}")
async def modificar_zona(ZonCod: int, request: Request):
    body = await request.json()
    ZonNom = body.get("ZonNom")
    ZonTipZon = body.get("ZonTipZon")
    ZonReg = body.get("ZonReg")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE zona_geografica 
        SET ZonNom = %s, ZonTipZon = %s, ZonReg = %s
        WHERE ZonCod = %s
    """, (ZonNom, ZonTipZon, ZonReg, ZonCod))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Zona actualizada correctamente"}
@router.delete("/zonas/eliminar/{ZonCod}")
async def eliminar_zona(ZonCod: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE zona_geografica SET ZonEstReg = 'I' WHERE ZonCod = %s
    """, (ZonCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Zona eliminada lógicamente"}
@router.get("/parcelas/listar/{MapUsuCod}")
async def listar_parcelas_usuario(MapUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM mapa_parcela WHERE MapUsuCod = %s AND MapEstReg = 'A'
    """, (MapUsuCod,))
    parcelas = cursor.fetchall()
    cursor.close()
    conn.close()
    return parcelas
@router.put("/parcelas/modificar/{MapCod}")
async def modificar_parcela(MapCod: int, request: Request):
    body = await request.json()
    MapNom = body.get("MapNom")
    MapCom = body.get("MapCom")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE mapa_parcela
        SET MapNom = %s, MapAnc = %s, MapAlt = %s, MapCom = %s
        WHERE MapCod = %s
    """, (MapNom, MapCom, MapCod))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Parcela actualizada correctamente"}
@router.delete("/parcelas/eliminar/{MapCod}")
async def eliminar_parcela(MapCod: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE mapa_parcela SET MapEstReg = 'I' WHERE MapCod = %s", (MapCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Parcela eliminada lógicamente"}
@router.get("/cultivos/listar/{CulMapParCod}")
async def listar_cultivos_parcela(CulMapParCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM cultivo_parcela WHERE CulMapParCod = %s AND CulEstReg = 'A'
    """, (CulMapParCod,))
    cultivos = cursor.fetchall()
    cursor.close()
    conn.close()
    return cultivos
@router.put("/cultivos/modificar/{CulCod}")
async def modificar_cultivo(CulCod: int, request: Request):
    body = await request.json()
    CulNomCul = body.get("CulNomCul")
    CulFecIni = body.get("CulFecIni")
    CulFecFin = body.get("CulFecFin")
    CulObs = body.get("CulObs")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE cultivo_parcela
        SET CulNomCul = %s, CulFecIni = %s, CulFecFin = %s, CulObs = %s
        WHERE CulCod = %s
    """, (CulNomCul, CulFecIni, CulFecFin, CulObs, CulCod))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Cultivo modificado correctamente"}
@router.delete("/cultivos/eliminar/{CulCod}")
async def eliminar_cultivo(CulCod: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cultivo_parcela SET CulEstReg = 'I' WHERE CulCod = %s", (CulCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Cultivo eliminado lógicamente"}