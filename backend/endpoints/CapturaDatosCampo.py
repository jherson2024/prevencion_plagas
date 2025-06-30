from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from datetime import date
from database import get_connection
import os
from uuid import uuid4
from IA.gemini_client import analizar_imagen_con_gemini

router = APIRouter()
IMAGENES_DIR = "static/imagenes"
os.makedirs(IMAGENES_DIR, exist_ok=True)

# -----------------------------
# Imagen
# -----------------------------
@router.post("/imagen/subir")
async def subir_y_registrar_imagen(file: UploadFile = File(...)):
    extension = file.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido")

    nombre_archivo = f"{uuid4()}.{extension}"
    ruta_fisica = os.path.join(IMAGENES_DIR, nombre_archivo)
    url_publica = f"/static/imagenes/{nombre_archivo}"

    with open(ruta_fisica, "wb") as f:
        contenido = await file.read()
        f.write(contenido)

    tam_kb = os.path.getsize(ruta_fisica) // 1024

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO imagen (
            ImaUrl, ImaTam, ImaRes, ImaFecCap, ImaPro, ImaTipIma, ImaEstReg
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (url_publica, tam_kb, "N/A", date.today(), "No", "cultivo", "A"))
    conn.commit()
    ima_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"ImaCod": ima_id, "url": url_publica, "message": "Imagen subida y registrada"}

@router.delete("/imagen/eliminar/{ImaCod}")
async def eliminar_imagen(ImaCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT ImaUrl FROM imagen WHERE ImaCod = %s AND ImaEstReg = 'A'", (ImaCod,))
    imagen = cursor.fetchone()

    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    ruta_fisica = "." + imagen["ImaUrl"]
    if os.path.exists(ruta_fisica):
        os.remove(ruta_fisica)

    cursor.execute("UPDATE imagen SET ImaEstReg = 'I' WHERE ImaCod = %s", (ImaCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Imagen eliminada"}

# -----------------------------
# Ubicacion
# -----------------------------
@router.post("/ubicacion/crear")
async def crear_ubicacion(request: Request):
    body = await request.json()
    UbiMapParCod = body.get("UbiMapParCod")
    UbiCoo = body.get("UbiCoo")
    UbiCooB = body.get("UbiCooB")
    UbiCom = body.get("UbiCom", "")

    if not all([UbiMapParCod, UbiCoo, UbiCooB]):
        raise HTTPException(status_code=400, detail="Datos incompletos")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ubicacion (
            UbiMapParCod, UbiCoo, UbiCooB, UbiCom, UbiEstReg
        ) VALUES (%s, %s, %s, %s, %s)
    """, (UbiMapParCod, UbiCoo, UbiCooB, UbiCom, "A"))
    conn.commit()
    ubi_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"UbiCod": ubi_id, "message": "Ubicación registrada"}

# -----------------------------
# Captura
# -----------------------------

@router.post("/captura/crear")
async def crear_captura(request: Request):
    body = await request.json()
    CapUsuCod = body.get("CapUsuCod")
    CapImaCod = body.get("CapImaCod")
    CapUbiCod = body.get("CapUbiCod")
    CapFec = body.get("CapFec", str(date.today()))
    CapNot = body.get("CapNot", "")

    if not all([CapUsuCod, CapImaCod, CapUbiCod]):
        raise HTTPException(status_code=400, detail="Datos incompletos")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Insertar captura
        cursor.execute("""
            INSERT INTO captura (
                CapUsuCod, CapImaCod, CapUbiCod, CapFec, CapNot, CapEstReg
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (CapUsuCod, CapImaCod, CapUbiCod, CapFec, CapNot, "A"))
        conn.commit()
        cap_id = cursor.lastrowid

        # 2. Diagnóstico con Gemini
        resultado = analizar_imagen_con_gemini(CapImaCod)

        if resultado:
            DiaPlaCod = resultado.get("plaga_id", 1)
            DiaNivDañ = resultado.get("nivel_dano", 60.0)
            DiaCon = resultado.get("confianza", 0.85)
            DiaModCod = 9  # Gemini
            DiaFec = date.today()
            DiaDet = resultado.get("detalle", "Diagnóstico generado por Gemini.")

            # Insertar diagnóstico
            cursor.execute("""
                INSERT INTO DIAGNOSTICO (
                    DiaCapCod, DiaPlaCod, DiaNivDañ, DiaCon, DiaModCod, DiaFec, DiaDet, DiaEstReg
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'A')
            """, (cap_id, DiaPlaCod, DiaNivDañ, DiaCon, DiaModCod, DiaFec, DiaDet))
            conn.commit()

            # 3. Si daño > 50%, generar alerta
            if DiaNivDañ > 50:
                mensaje_alerta = f"Daño elevado ({DiaNivDañ}%) detectado por Gemini en plaga ID {DiaPlaCod}."

                cursor.execute("""
                    INSERT INTO ALERTA (
                        AleTip, AleMen, AleGra, AleFecGen, AleEstReg
                    ) VALUES (%s, %s, %s, %s, 'A')
                """, ('Daño', mensaje_alerta, 'Alta', date.today()))
                alerta_id = cursor.lastrowid

                # Asociar alerta a todos los usuarios activos
                cursor.execute("SELECT UsuCod FROM USUARIO WHERE UsuEstReg = 'A'")
                usuarios = cursor.fetchall()

                for (usu_cod,) in usuarios:
                    cursor.execute("""
                        INSERT INTO USUARIO_ALERTA (
                            UsuUsuCod, UsuAleCod, UsuLei, UsuFecLec, UsuEstReg
                        ) VALUES (%s, %s, 'No', NULL, 'A')
                    """, (usu_cod, alerta_id))
                conn.commit()

        return {
            "CapCod": cap_id,
            "message": "Captura registrada. Diagnóstico generado con Gemini.",
            "diagnostico": resultado
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

# -----------------------------
# Offline Buffer
# -----------------------------
@router.post("/offline_buffer/guardar")
async def guardar_offline(request: Request):
    body = await request.json()
    DatUsuCod = body.get("DatUsuCod")
    DatTipDat = body.get("DatTipDat")
    DatCon = body.get("DatCon")
    DatFecCre = body.get("DatFecCre", str(date.today()))
    DatSin = body.get("DatSin", "pendiente")

    if not all([DatUsuCod, DatTipDat, DatCon]):
        raise HTTPException(status_code=400, detail="Datos incompletos")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO datos_offline_buffer (
            DatUsuCod, DatTipDat, DatCon, DatFecCre, DatSin, DatEstReg
        ) VALUES (%s, %s, %s, %s, %s, %s)
    """, (DatUsuCod, DatTipDat, DatCon, DatFecCre, DatSin, "A"))
    conn.commit()
    dat_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"DatCod": dat_id, "message": "Dato offline guardado"}

# -----------------------------
# Sync Log
# -----------------------------
@router.post("/sync_log/registrar")
async def registrar_sync_log(request: Request):
    body = await request.json()
    SynUsuCod = body.get("SynUsuCod")
    SynFec = body.get("SynFec", str(date.today()))
    SynTipSin = body.get("SynTipSin")
    SynRes = body.get("SynRes")

    if not all([SynUsuCod, SynTipSin, SynRes]):
        raise HTTPException(status_code=400, detail="Datos incompletos")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sync_log (
            SynUsuCod, SynFec, SynTipSin, SynRes, SynEstReg
        ) VALUES (%s, %s, %s, %s, %s)
    """, (SynUsuCod, SynFec, SynTipSin, SynRes, "A"))
    conn.commit()
    sync_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"SynCod": sync_id, "message": "Sincronización registrada"}
@router.get("/imagen/listar/usuario/{UsuCod}")
async def listar_imagenes_por_usuario(UsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ImaCod, ImaUrl, ImaTam, ImaRes, ImaFecCap, ImaTipIma
        FROM imagen
        WHERE ImaEstReg = 'A' AND ImaCod IN (
            SELECT CapImaCod FROM captura WHERE CapUsuCod = %s AND CapEstReg = 'A'
        )
    """, (UsuCod,))
    imagenes = cursor.fetchall()
    cursor.close()
    conn.close()
    return imagenes
@router.get("/captura/listar")
async def listar_capturas(usu: int = None, parcela: int = None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT c.CapCod, c.CapFec, c.CapNot,
               i.ImaUrl, i.ImaRes, i.ImaTam,
               u.UbiCoo, u.UbiCooB, u.UbiCom
        FROM captura c
        JOIN imagen i ON c.CapImaCod = i.ImaCod
        JOIN ubicacion u ON c.CapUbiCod = u.UbiCod
        WHERE c.CapEstReg = 'A'
    """
    params = []

    if usu:
        query += " AND c.CapUsuCod = %s"
        params.append(usu)
    if parcela:
        query += " AND u.UbiMapParCod = %s"
        params.append(parcela)

    cursor.execute(query, tuple(params))
    capturas = cursor.fetchall()
    cursor.close()
    conn.close()
    return capturas

# -----------------------------
# Editar Captura
# -----------------------------
@router.put("/captura/editar/{CapCod}")
async def editar_captura(CapCod: int, request: Request):
    body = await request.json()
    CapFec = body.get("CapFec")
    CapNot = body.get("CapNot")

    if not CapFec and not CapNot:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE captura
        SET CapFec = COALESCE(%s, CapFec),
            CapNot = COALESCE(%s, CapNot)
        WHERE CapCod = %s AND CapEstReg = 'A'
    """, (CapFec, CapNot, CapCod))

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Captura actualizada"}

# -----------------------------
# Eliminar Captura
# -----------------------------
@router.delete("/captura/eliminar/{CapCod}")
async def eliminar_captura(CapCod: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE captura SET CapEstReg = 'I' WHERE CapCod = %s", (CapCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Captura eliminada"}

# -----------------------------
# Editar Ubicación
# -----------------------------
@router.put("/ubicacion/editar/{UbiCod}")
async def editar_ubicacion(UbiCod: int, request: Request):
    body = await request.json()
    UbiCoo = body.get("UbiCoo")
    UbiCooB = body.get("UbiCooB")
    UbiCom = body.get("UbiCom")

    if UbiCoo is None and UbiCooB is None and UbiCom is None:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE ubicacion
        SET UbiCoo = COALESCE(%s, UbiCoo),
            UbiCooB = COALESCE(%s, UbiCooB),
            UbiCom = COALESCE(%s, UbiCom)
        WHERE UbiCod = %s AND UbiEstReg = 'A'
    """, (UbiCoo, UbiCooB, UbiCom, UbiCod))

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Ubicación actualizada"}

# -----------------------------
# Eliminar Ubicación
# -----------------------------
@router.delete("/ubicacion/eliminar/{UbiCod}")
async def eliminar_ubicacion(UbiCod: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE ubicacion SET UbiEstReg = 'I' WHERE UbiCod = %s", (UbiCod,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Ubicación eliminada"}
