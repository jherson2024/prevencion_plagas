from fastapi import APIRouter, HTTPException,Request
from pydantic import BaseModel
from datetime import date
from database import get_connection  # tu función ya definida
from fastapi import UploadFile, File
import os

router = APIRouter()

@router.post("/auth/login")
async def login(request: Request):
    body = await request.json()
    UsuCor = body.get("UsuCor")
    UsuCon = body.get("UsuCon")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM USUARIO WHERE UsuCor = %s AND UsuCon = %s AND UsuEstReg = 'A'", (UsuCor, UsuCon))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    return {"message": "Login exitoso", "UsuCod": usuario["UsuCod"],"UsuNom": usuario["UsuNom"]}

@router.post("/usuarios/registrar")
async def registrar_usuario(request: Request):
    body = await request.json()
    UsuNom = body.get("UsuNom")
    UsuCor = body.get("UsuCor")
    UsuCon = body.get("UsuCon")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO USUARIO (UsuNom, UsuCor, UsuCon, UsuFecReg, UsuEstReg)
        VALUES (%s, %s, %s, %s, %s)
    """, (UsuNom, UsuCor, UsuCon, date.today(), "A"))
    conn.commit()
    usuario_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {"UsuCod": usuario_id}

@router.post("/usuarios/{id}/rol")
async def asignar_rol(id: int, request: Request):
    body = await request.json()
    RolNom = body.get("RolNom")
    conn = get_connection()
    cursor = conn.cursor()
    # Buscar si el rol ya existe
    cursor.execute("SELECT RolCod FROM ROL WHERE RolNom = %s AND RolEstReg = 'A'", (RolNom,))
    rol = cursor.fetchone()
    if not rol:
        cursor.execute("INSERT INTO ROL (RolNom, RolDes, RolEstReg) VALUES (%s, %s, %s)", (RolNom, RolNom, "A"))
        conn.commit()
        RolCod = cursor.lastrowid
    else:
        RolCod = rol[0]
    # Asignar el rol al usuario
    cursor.execute("INSERT INTO USUARIO_ROL (UsuUsuCod, UsuRolCod, UsuEstReg) VALUES (%s, %s, %s)", (id, RolCod, "A"))
    conn.commit()
    cursor.close()
    conn.close()
    return {"UsuUsuCod": id, "UsuRolCod": RolCod}

@router.get("/zonas-geograficas/listar")
def listar_zonas_geograficas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ZONA_GEOGRAFICA WHERE ZonEstReg = 'A'")
    zonas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"zonas": zonas}

@router.post("/mapas-parcela/subir")
async def subir_mapa_parcela(
    MapUsuCod: int,
    MapZonGeoCod: int,
    MapFecSub: str,
    MapNom: str,
    MapCom: str,
    MapAnc: int,
    MapAlt: int,
    file: UploadFile = File(...)
):
    nombre_archivo = file.filename
    ruta = f"static/mapas/{nombre_archivo}"

    with open(ruta, "wb") as f:
        f.write(await file.read())

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO MAPA_PARCELA (MapUsuCod, MapZonGeoCod, MapImaMap, MapAnc, MapAlt, MapFecSub, MapNom, MapCom, MapEstReg)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'A')
    """, (MapUsuCod, MapZonGeoCod, ruta, MapAnc, MapAlt, MapFecSub, MapNom, MapCom))
    conn.commit()
    MapCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"MapCod": MapCod, "MapImaMap": ruta}


@router.get("/mapas-parcela/usuario")
def obtener_mapas_parcela(MapUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM MAPA_PARCELA
        WHERE MapUsuCod = %s AND MapEstReg = 'A'
        ORDER BY MapFecSub DESC
    """, (MapUsuCod,))
    mapas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"mapas": mapas}

@router.post("/capas-mapa/generar")
async def generar_capa_mapa(request: Request):
    body = await request.json()
    CapUsuCod = body.get("CapUsuCod")
    CapNom = body.get("CapNom")
    CapTipVis = body.get("CapTipVis")
    CapFilApl = body.get("CapFilApl")  # Ej: "Tomate, Mosca Blanca, Nivel alto"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO CAPA_MAPA (CapUsuCod, CapNom, CapTipVis, CapFilApl, CapEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (CapUsuCod, CapNom, CapTipVis, CapFilApl))
    conn.commit()
    CapCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"CapCod": CapCod}
@router.get("/capas-mapa/usuario")
def obtener_capas_usuario(CapUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM CAPA_MAPA
        WHERE CapUsuCod = %s AND CapEstReg = 'A'
        ORDER BY CapCod DESC
    """, (CapUsuCod,))
    capas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"capas": capas}
@router.post("/capturas/crear")
async def crear_captura(
    CapUsuCod: int,
    CapUbiCod: int,
    CapFec: str,
    CapNot: str,
    ImaPro: str,
    ImaFecCap: str,
    file: UploadFile = File(...)
):
    nombre_archivo = file.filename
    ruta = f"static/imagenes/{nombre_archivo}"

    with open(ruta, "wb") as f:
        f.write(await file.read())

    tamaño = os.path.getsize(ruta)

    conn = get_connection()
    cursor = conn.cursor()

    # 1. Registrar imagen
    cursor.execute("""
        INSERT INTO IMAGEN (ImaUrl, ImaTam, ImaRes, ImaFecCap, ImaPro, ImaEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (ruta, tamaño, "Desconocida", ImaFecCap, ImaPro))
    conn.commit()
    CapImaCod = cursor.lastrowid

    # 2. Registrar captura
    cursor.execute("""
        INSERT INTO CAPTURA (CapUsuCod, CapImaCod, CapUbiCod, CapFec, CapNot, CapEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (CapUsuCod, CapImaCod, CapUbiCod, CapFec, CapNot))
    conn.commit()
    CapCod = cursor.lastrowid

    cursor.close()
    conn.close()

    return {"CapCod": CapCod, "CapImaCod": CapImaCod, "ImaUrl": ruta}

@router.post("/ubicaciones/crear")
async def crear_ubicacion(request: Request):
    body = await request.json()
    UbiMapParCod = body.get("UbiMapParCod")
    UbiCoo = body.get("UbiCoo")
    UbiCooB = body.get("UbiCooB")
    UbiCom = body.get("UbiCom")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO UBICACION (UbiMapParCod, UbiCoo, UbiCooB, UbiCom, UbiEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (UbiMapParCod, UbiCoo, UbiCooB, UbiCom))
    conn.commit()
    UbiCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"UbiCod": UbiCod}
@router.post("/offline-buffer/guardar")
async def guardar_dato_offline(request: Request):
    body = await request.json()
    DatUsuCod = body.get("DatUsuCod")
    DatTipDat = body.get("DatTipDat")
    DatCon = body.get("DatCon")
    DatFecCre = body.get("DatFecCre")  # formato: YYYY-MM-DD
    DatSin = body.get("DatSin")  # Ej: "NoSincronizado"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO DATOS_OFFLINE_BUFFER (DatUsuCod, DatTipDat, DatCon, DatFecCre, DatSin, DatEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (DatUsuCod, DatTipDat, DatCon, DatFecCre, DatSin))
    conn.commit()
    DatCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"DatCod": DatCod}
@router.post("/sync/sincronizar")
async def sincronizar(request: Request):
    body = await request.json()
    SynUsuCod = body.get("SynUsuCod")
    SynTipSin = body.get("SynTipSin")  # Ej: "Auto"
    SynRes = body.get("SynRes")        # Ej: "Éxito"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO SYNC_LOG (SynUsuCod, SynFec, SynTipSin, SynRes, SynEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (SynUsuCod, date.today(), SynTipSin, SynRes))
    conn.commit()
    SynCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"SynCod": SynCod}
@router.get("/sync/logs/usuario")
def obtener_logs_sync(SynUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM SYNC_LOG
        WHERE SynUsuCod = %s AND SynEstReg = 'A'
        ORDER BY SynFec DESC
    """, (SynUsuCod,))
    logs = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"logs": logs}
@router.post("/diagnosticos/procesar")
async def procesar_diagnostico(request: Request):
    body = await request.json()
    DiaCapCod = body.get("DiaCapCod")
    DiaPlaCod = body.get("DiaPlaCod")
    DiaCulCod = body.get("DiaCulCod")
    DiaNivDañ = body.get("DiaNivDañ")
    DiaCon = body.get("DiaCon")
    DiaMod = body.get("DiaMod")
    DiaFec = body.get("DiaFec")  # formato: YYYY-MM-DD

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO DIAGNOSTICO (DiaCapCod, DiaPlaCod, DiaCulCod, DiaNivDañ, DiaCon, DiaMod, DiaFec, DiaEstReg)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'A')
    """, (DiaCapCod, DiaPlaCod, DiaCulCod, DiaNivDañ, DiaCon, DiaMod, DiaFec))
    conn.commit()
    DiaCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"DiaCod": DiaCod}
@router.get("/diagnosticos/captura/{id}")
def obtener_diagnostico_por_captura(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM DIAGNOSTICO
        WHERE DiaCapCod = %s AND DiaEstReg = 'A'
    """, (id,))
    diagnostico = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"diagnostico": diagnostico}
@router.post("/etiquetas-manuales/crear")
async def crear_etiqueta_manual(request: Request):
    body = await request.json()
    EtiDiaCod = body.get("EtiDiaCod")
    EtiUsuCod = body.get("EtiUsuCod")
    EtiPlaCor = body.get("EtiPlaCor")
    EtiObs = body.get("EtiObs")
    EtiFec = body.get("EtiFec")  # formato: YYYY-MM-DD

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ETIQUETA_MANUAL (EtiDiaCod, EtiUsuCod, EtiPlaCor, EtiObs, EtiFec, EtiEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (EtiDiaCod, EtiUsuCod, EtiPlaCor, EtiObs, EtiFec))
    conn.commit()
    EtiCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"EtiCod": EtiCod}
@router.get("/etiquetas-manuales/usuario")
def obtener_etiquetas_usuario(EtiUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM ETIQUETA_MANUAL
        WHERE EtiUsuCod = %s AND EtiEstReg = 'A'
        ORDER BY EtiFec DESC
    """, (EtiUsuCod,))
    etiquetas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"etiquetas": etiquetas}
@router.get("/alertas/usuario")
def obtener_alertas_usuario(UsuUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT A.* FROM ALERTA A
        JOIN USUARIO_ALERTA UA ON UA.UsuAleCod = A.AleCod
        WHERE UA.UsuUsuCod = %s AND A.AleEstReg = 'A' AND UA.UsuEstReg = 'A'
        ORDER BY A.AleFecGen DESC
    """, (UsuUsuCod,))
    alertas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"alertas": alertas}
@router.post("/usuario-alerta/marcar-leida")
async def marcar_alerta_leida(request: Request):
    body = await request.json()
    UsuUsuCod = body.get("UsuUsuCod")
    UsuAleCod = body.get("UsuAleCod")
    UsuFecLec = body.get("UsuFecLec")  # formato: YYYY-MM-DD

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE USUARIO_ALERTA
        SET UsuLei = 'Sí', UsuFecLec = %s
        WHERE UsuUsuCod = %s AND UsuAleCod = %s
    """, (UsuFecLec, UsuUsuCod, UsuAleCod))
    conn.commit()
    cursor.close()
    conn.close()

    return {"mensaje": "Alerta marcada como leída"}
@router.get("/recomendaciones/diagnostico/{id}")
def obtener_recomendaciones(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT DiaPlaCod, DiaCulCod FROM DIAGNOSTICO
        WHERE DiaCod = %s AND DiaEstReg = 'A'
    """, (id,))
    diag = cursor.fetchone()

    if not diag:
        cursor.close()
        conn.close()
        return {"mensaje": "Diagnóstico no encontrado"}

    DiaPlaCod = diag["DiaPlaCod"]
    DiaCulCod = diag["DiaCulCod"]

    cursor.execute("""
        SELECT * FROM RECOMENDACION
        WHERE RecPlaCod = %s AND RecCulCod = %s AND RecEstReg = 'A'
    """, (DiaPlaCod, DiaCulCod))
    recomendaciones = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"recomendaciones": recomendaciones}
@router.post("/recomendaciones/aplicar")
async def aplicar_recomendacion(request: Request):
    body = await request.json()
    RecUsuCod = body.get("RecUsuCod")
    RecRecCod = body.get("RecRecCod")
    RecFec = body.get("RecFec")  # YYYY-MM-DD
    RecCom = body.get("RecCom")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO RECOMENDACION_APLICADA (RecUsuCod, RecRecCod, RecFec, RecCom, RecEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (RecUsuCod, RecRecCod, RecFec, RecCom))
    conn.commit()
    RecCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"RecCod": RecCod}
@router.get("/clima/zona/{id}")
def obtener_clima(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM CLIMA
        WHERE CliZonGeoCod = %s AND CliEstReg = 'A'
        ORDER BY CliFec DESC LIMIT 1
    """, (id,))
    clima = cursor.fetchone()
    cursor.close()
    conn.close()

    return {"clima": clima}
@router.post("/clima/registrar")
async def registrar_clima(request: Request):
    body = await request.json()
    CliFec = body.get("CliFec")
    CliZonGeoCod = body.get("CliZonGeoCod")
    CliTem = body.get("CliTem")
    CliHum = body.get("CliHum")
    CliLlu = body.get("CliLlu")
    CliFue = body.get("CliFue")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO CLIMA (CliFec, CliZonGeoCod, CliTem, CliHum, CliLlu, CliFue, CliEstReg)
        VALUES (%s, %s, %s, %s, %s, %s, 'A')
    """, (CliFec, CliZonGeoCod, CliTem, CliHum, CliLlu, CliFue))
    conn.commit()
    CliCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"CliCod": CliCod}
@router.get("/predicciones/zona/{id}")
def obtener_predicciones(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM PREDICCION
        WHERE PreZonGeoCod = %s AND PreEstReg = 'A'
        ORDER BY PreFecEst DESC
    """, (id,))
    predicciones = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"predicciones": predicciones}
@router.post("/predicciones/generar")
async def generar_prediccion(request: Request):
    body = await request.json()
    PrePlaCod = body.get("PrePlaCod")
    PreZonGeoCod = body.get("PreZonGeoCod")
    PreFecEst = body.get("PreFecEst")
    PrePro = body.get("PrePro")
    PreModCod = body.get("PreModCod")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO PREDICCION (PrePlaCod, PreZonGeoCod, PreFecEst, PrePro, PreModCod, PreEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (PrePlaCod, PreZonGeoCod, PreFecEst, PrePro, PreModCod))
    conn.commit()
    PreCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"PreCod": PreCod}
@router.get("/mapa-calor/zona/{id}")
def obtener_mapa_calor(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM MAPA_CALOR_CACHE
        WHERE MapZonGeoCod = %s AND MapEstReg = 'A'
        ORDER BY MapFec DESC
    """, (id,))
    mapas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"mapa_calor": mapas}
@router.get("/estadisticas/zona/{id}")
def obtener_estadisticas(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM ESTADISTICA_AGREGADA
        WHERE EstZonGeoCod = %s AND EstEstReg = 'A'
        ORDER BY EstFec DESC
    """, (id,))
    estadisticas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"estadisticas": estadisticas}
@router.post("/chat/mensajes/enviar")
async def enviar_mensaje(request: Request):
    body = await request.json()
    MenUsuCod = body.get("MenUsuCod")
    MenUsuBCod = body.get("MenUsuBCod")
    MenCon = body.get("MenCon")
    MenFecHor = body.get("MenFecHor")  # formato YYYY-MM-DD

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO MENSAJE_CHAT (MenUsuCod, MenUsuBCod, MenCon, MenFecHor, MenEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (MenUsuCod, MenUsuBCod, MenCon, MenFecHor))
    conn.commit()
    MenCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"MenCod": MenCod}
@router.get("/chat/mensajes/conversacion/{usuario_id}")
def obtener_conversacion(usuario_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM MENSAJE_CHAT
        WHERE (MenUsuCod = %s OR MenUsuBCod = %s)
        AND MenEstReg = 'A'
        ORDER BY MenFecHor ASC
    """, (usuario_id, usuario_id))
    mensajes = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"mensajes": mensajes}
@router.post("/anotaciones/crear")
async def crear_anotacion(request: Request):
    body = await request.json()
    AnoCapCod = body.get("AnoCapCod")
    AnoUsuCod = body.get("AnoUsuCod")
    AnoCom = body.get("AnoCom")
    AnoFec = body.get("AnoFec")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ANOTACION_TECNICO (AnoCapCod, AnoUsuCod, AnoCom, AnoFec, AnoEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (AnoCapCod, AnoUsuCod, AnoCom, AnoFec))
    conn.commit()
    AnoCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"AnoCod": AnoCod}
@router.get("/anotaciones/captura/{id}")
def obtener_anotaciones(id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM ANOTACION_TECNICO
        WHERE AnoCapCod = %s AND AnoEstReg = 'A'
        ORDER BY AnoFec DESC
    """, (id,))
    anotaciones = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"anotaciones": anotaciones}
@router.get("/capturas/usuario")
def obtener_capturas_api(UsuCod: int, ApiCla: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM API_KEY
        WHERE ApiCla = %s AND ApiUsuCod = %s AND ApiEstReg = 'A'
    """, (ApiCla, UsuCod))
    apikey = cursor.fetchone()

    if not apikey:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=403, detail="API Key inválida")

    # JOIN para incluir ruta de imagen
    cursor.execute("""
        SELECT C.CapCod, C.CapFec, C.CapNot, I.ImaUrl
        FROM CAPTURA C
        JOIN IMAGEN I ON C.CapImaCod = I.ImaCod
        WHERE C.CapUsuCod = %s AND C.CapEstReg = 'A'
        ORDER BY C.CapFec DESC
    """, (UsuCod,))
    capturas = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"capturas": capturas}

@router.get("/diagnosticos/usuario")
def diagnosticos_usuario(UsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT D.* FROM DIAGNOSTICO D
        JOIN CAPTURA C ON D.DiaCapCod = C.CapCod
        WHERE C.CapUsuCod = %s AND D.DiaEstReg = 'A'
        ORDER BY D.DiaFec DESC
    """, (UsuCod,))
    diagnosticos = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"diagnosticos": diagnosticos}
@router.post("/informes/exportar")
async def exportar_informe(request: Request):
    body = await request.json()
    UsoApiKeyCod = body.get("UsoApiKeyCod")
    UsoFecHor = body.get("UsoFecHor")
    UsoEnd = body.get("UsoEnd")
    UsoExi = body.get("UsoExi")
    UsoMenRes = body.get("UsoMenRes")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO USO_API_LOG (UsoApiKeyCod, UsoFecHor, UsoEnd, UsoExi, UsoMenRes, UsoEstReg)
        VALUES (%s, %s, %s, %s, %s, 'A')
    """, (UsoApiKeyCod, UsoFecHor, UsoEnd, UsoExi, UsoMenRes))
    conn.commit()
    UsoCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"UsoCod": UsoCod}
@router.get("/informes/historial")
def historial_informes(UsoApiKeyCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM USO_API_LOG
        WHERE UsoApiKeyCod = %s AND UsoEstReg = 'A'
        ORDER BY UsoFecHor DESC
    """, (UsoApiKeyCod,))
    logs = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"historial": logs}
@router.post("/eventos/registrar")
async def registrar_evento(request: Request):
    body = await request.json()
    EveUsuCod = body.get("EveUsuCod")
    EveAcc = body.get("EveAcc")
    EveFecHor = body.get("EveFecHor")
    EveDet = body.get("EveDet")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO EVENTO_USUARIO (EveUsuCod, EveAcc, EveFecHor, EveDet, EveEstReg)
        VALUES (%s, %s, %s, %s, 'A')
    """, (EveUsuCod, EveAcc, EveFecHor, EveDet))
    conn.commit()
    EveCod = cursor.lastrowid
    cursor.close()
    conn.close()

    return {"EveCod": EveCod}
@router.get("/eventos/usuario")
def eventos_usuario(EveUsuCod: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM EVENTO_USUARIO
        WHERE EveUsuCod = %s AND EveEstReg = 'A'
        ORDER BY EveFecHor DESC
    """, (EveUsuCod,))
    eventos = cursor.fetchall()
    cursor.close()
    conn.close()

    return {"eventos": eventos}

