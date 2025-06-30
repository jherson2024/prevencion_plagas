CREATE TABLE usuario (
    usucoduCod INT AUTO_INCREMENT PRIMARY KEY,
    usunomuNom VARCHAR(80),
    usucoruCor VARCHAR(130) UNIQUE NOT NULL,
    usuconuCon VARCHAR(130),
    usufecregcReg DATE,
    usuestregtReg CHAR(1)
)

CREATE TABLE rol (
    rolcodlCod INT AUTO_INCREMENT PRIMARY KEY,
    rolnomlNom VARCHAR(40) UNIQUE NOT NULL,
    roldeslDes VARCHAR(160),
    rolestregtReg CHAR(1)
)

CREATE TABLE plaga (
    placodaCod INT AUTO_INCREMENT PRIMARY KEY,
    planomaNom VARCHAR(80) UNIQUE NOT NULL,
    pladesaDes VARCHAR(160),
    platipaTip VARCHAR(40),
    plagraaGra VARCHAR(40),
    plaestregtReg CHAR(1)
)

CREATE TABLE modelo (
    modcoddCod INT AUTO_INCREMENT PRIMARY KEY,
    modnomdNom VARCHAR(40) NOT NULL,
    modverdVer DECIMAL,
    modfecentcEnt DATE,
    modtipmodpMod VARCHAR(40) UNIQUE,
    modestregtReg CHAR(1)
)

CREATE TABLE zona_geografica (
    zoncodnCod INT AUTO_INCREMENT PRIMARY KEY,
    zonnomnNom VARCHAR(80) UNIQUE NOT NULL,
    zontipzonpZon VARCHAR(40),
    zonregnReg VARCHAR(80),
    zonestregtReg CHAR(1)
)

CREATE TABLE imagen (
    imacodaCod INT AUTO_INCREMENT PRIMARY KEY,
    imaurlaUrl VARCHAR(130) UNIQUE NOT NULL,
    imatamaTam INT,
    imaresaRes VARCHAR(40),
    imafeccapcCap DATE,
    imaproaPro VARCHAR(40),
    imatipimapIma VARCHAR(40),
    imaestregtReg CHAR(1)
)

CREATE TABLE alerta (
    alecodeCod INT AUTO_INCREMENT PRIMARY KEY,
    aletipeTip VARCHAR(40) NOT NULL,
    alemeneMen VARCHAR(160),
    alegraeGra VARCHAR(40),
    alefecgencGen DATE,
    aleestregtReg CHAR(1)
)

CREATE TABLE mensaje_chat (
    mencodnCod INT AUTO_INCREMENT PRIMARY KEY,
    menusucoduCod INT,
    menusubcodBCod INT,
    menconnCon VARCHAR(160) NOT NULL,
    menfechorcHor DATE,
    menestregtReg CHAR(1),
    FOREIGN KEY (MenUsuBCod) REFERENCES usuario(UsuCod)
)

CREATE TABLE datos_offline_buffer (
    datcodtCod INT AUTO_INCREMENT PRIMARY KEY,
    datusucoduCod INT,
    dattipdatpDat VARCHAR(40),
    datcontCon VARCHAR(160) NOT NULL,
    datfeccrecCre DATE,
    datsintSin VARCHAR(40),
    datestregtReg CHAR(1),
    FOREIGN KEY (DatUsuCod) REFERENCES usuario(UsuCod)
)

CREATE TABLE sync_log (
    syncodnCod INT AUTO_INCREMENT PRIMARY KEY,
    synusucoduCod INT,
    synfecnFec DATE NOT NULL,
    syntipsinpSin VARCHAR(40),
    synresnRes VARCHAR(40),
    synestregtReg CHAR(1),
    FOREIGN KEY (SynUsuCod) REFERENCES usuario(UsuCod)
)

CREATE TABLE usuario_rol (
    usucoduCod INT AUTO_INCREMENT PRIMARY KEY,
    usuusucoduCod INT,
    usurolcodlCod INT,
    usuestregtReg CHAR(1),
    FOREIGN KEY (UsuUsuCod) REFERENCES usuario(UsuCod),
    FOREIGN KEY (UsuRolCod) REFERENCES rol(RolCod)
)

CREATE TABLE recomendacion (
    reccodcCod INT AUTO_INCREMENT PRIMARY KEY,
    recplacodaCod INT,
    recnomculmCul VARCHAR(80) NOT NULL,
    recnivdañvDañ DECIMAL,
    recaccsugcSug VARCHAR(160) NOT NULL,
    recestregtReg CHAR(1),
    FOREIGN KEY (RecPlaCod) REFERENCES plaga(PlaCod)
)

CREATE TABLE mapa_parcela (
    mapcodpCod INT AUTO_INCREMENT PRIMARY KEY,
    mapusucoduCod INT,
    mapzongeocodoCod INT,
    mapimamapaMap VARCHAR(130) UNIQUE,
    mapancpAnc INT NOT NULL,
    mapaltpAlt INT NOT NULL,
    mapfecsubcSub DATE,
    mapnompNom VARCHAR(80) NOT NULL,
    mapcompCom VARCHAR(160),
    mapestregtReg CHAR(1),
    FOREIGN KEY (MapUsuCod) REFERENCES usuario(UsuCod),
    FOREIGN KEY (MapZonGeoCod) REFERENCES zona_geografica(ZonCod)
)

CREATE TABLE estadistica_agregada (
    estcodtCod INT AUTO_INCREMENT PRIMARY KEY,
    estfectFec DATE NOT NULL,
    estzongeocodoCod INT,
    estnomculmCul VARCHAR(80) NOT NULL,
    estplacodaCod INT,
    esttotcastCas INT,
    estmeddañdDañ DECIMAL,
    estestregtReg CHAR(1),
    FOREIGN KEY (EstPlaCod) REFERENCES plaga(PlaCod),
    FOREIGN KEY (EstZonGeoCod) REFERENCES zona_geografica(ZonCod)
)

CREATE TABLE clima (
    clicodiCod INT AUTO_INCREMENT PRIMARY KEY,
    clifeciFec DATE NOT NULL,
    clizongeocodoCod INT,
    clitemiTem DECIMAL,
    clihumiHum DECIMAL,
    clilluiLlu DECIMAL,
    clifueiFue VARCHAR(40),
    cliestregtReg CHAR(1),
    FOREIGN KEY (CliZonGeoCod) REFERENCES zona_geografica(ZonCod)
)

CREATE TABLE prediccion (
    precodeCod INT AUTO_INCREMENT PRIMARY KEY,
    preplacodaCod INT,
    prezongeocodoCod INT,
    prefecestcEst DATE NOT NULL,
    preproePro DECIMAL,
    premodcoddCod INT,
    preestregtReg CHAR(1),
    FOREIGN KEY (PrePlaCod) REFERENCES plaga(PlaCod),
    FOREIGN KEY (PreModCod) REFERENCES modelo(ModCod),
    FOREIGN KEY (PreZonGeoCod) REFERENCES zona_geografica(ZonCod)
)

CREATE TABLE usuario_alerta (
    usucoduCod INT AUTO_INCREMENT PRIMARY KEY,
    usuusucoduCod INT,
    usualecodeCod INT,
    usuleiuLei VARCHAR(40),
    usufecleccLec DATE,
    usuestregtReg CHAR(1),
    FOREIGN KEY (UsuUsuCod) REFERENCES usuario(UsuCod),
    FOREIGN KEY (UsuAleCod) REFERENCES alerta(AleCod)
)

CREATE TABLE cultivo_parcela (
    culcodlCod INT AUTO_INCREMENT PRIMARY KEY,
    culmapparcodrCod INT,
    culnomculmCul VARCHAR(80) NOT NULL,
    culfecinicIni DATE,
    culfecfincFin DATE,
    culobslObs VARCHAR(160),
    culestregtReg CHAR(1),
    FOREIGN KEY (CulMapParCod) REFERENCES mapa_parcela(MapCod)
)

CREATE TABLE acceso_parcela (
    acccodcCod INT AUTO_INCREMENT PRIMARY KEY,
    accusucoduCod INT,
    accmapparcodrCod INT,
    accrolacclAcc VARCHAR(40),
    accpercPer VARCHAR(160),
    accfecasicAsi DATE NOT NULL,
    accestregtReg CHAR(1),
    FOREIGN KEY (AccMapParCod) REFERENCES mapa_parcela(MapCod),
    FOREIGN KEY (AccUsuCod) REFERENCES usuario(UsuCod)
)

CREATE TABLE ubicacion (
    ubicodiCod INT AUTO_INCREMENT PRIMARY KEY,
    ubimapparcodrCod INT,
    ubicooiCoo DECIMAL,
    ubicoobCooB DECIMAL,
    ubicomiCom VARCHAR(160),
    ubiestregtReg CHAR(1),
    FOREIGN KEY (UbiMapParCod) REFERENCES mapa_parcela(MapCod)
)

CREATE TABLE captura (
    capcodpCod INT AUTO_INCREMENT PRIMARY KEY,
    capusucoduCod INT,
    capimacodaCod INT,
    capubicodiCod INT,
    capfecpFec DATE NOT NULL,
    capnotpNot VARCHAR(160),
    capestregtReg CHAR(1),
    FOREIGN KEY (CapUbiCod) REFERENCES ubicacion(UbiCod),
    FOREIGN KEY (CapUsuCod) REFERENCES usuario(UsuCod),
    FOREIGN KEY (CapImaCod) REFERENCES imagen(ImaCod)
)

CREATE TABLE diagnostico (
    diacodaCod INT AUTO_INCREMENT PRIMARY KEY,
    diacapcodpCod INT,
    diaplacodaCod INT,
    dianivdañvDañ DECIMAL,
    diaconaCon DECIMAL NOT NULL,
    diamodcoddCod INT,
    diafecaFec DATE,
    diaestregtReg CHAR(1),
    FOREIGN KEY (DiaPlaCod) REFERENCES plaga(PlaCod),
    FOREIGN KEY (DiaModCod) REFERENCES modelo(ModCod),
    FOREIGN KEY (DiaCapCod) REFERENCES captura(CapCod)
)

CREATE TABLE etiqueta_manual (
    eticodiCod INT AUTO_INCREMENT PRIMARY KEY,
    etidiacodaCod INT,
    etiusucoduCod INT,
    etiplacoraCor VARCHAR(80),
    etiobsiObs VARCHAR(160) NOT NULL,
    etifeciFec DATE,
    etiestregtReg CHAR(1),
    FOREIGN KEY (EtiDiaCod) REFERENCES diagnostico(DiaCod),
    FOREIGN KEY (EtiUsuCod) REFERENCES usuario(UsuCod)
);