import re
import unicodedata

def normalizar(nombre):
    # Quita tildes, pasa a mayúsculas, quita espacios
    nfkd = unicodedata.normalize('NFKD', nombre)
    return ''.join([c for c in nfkd if not unicodedata.combining(c)]).upper().replace(" ", "")

def obtener_tipo(tipo_raw):
    if tipo_raw == 'n':
        return 'int'
    elif tipo_raw == 'd':
        return 'date'
    elif re.match(r'^\d+\.\d+$', tipo_raw):
        return 'double'
    elif re.match(r'^\d+$', tipo_raw):
        return 'string'
    else:
        return tipo_raw

def parse_line(line, nombres_tablas):
    tabla, atributos_raw = line.split(":", 1)
    atributos = [a.strip() for a in atributos_raw.split(",")]
    campos = []

    tabla = tabla.strip().upper()
    tabla_norm = normalizar(tabla)

    campos.append({
        "clave": "pk",
        "nombre": "id",
        "tipo": "",
        "unique": False
    })

    for attr in atributos:
        match = re.match(r"([\w\sáéíóúÁÉÍÓÚñÑ]+)(\*?)(\+?)\(([^)]+)\)", attr)
        if match:
            nombre, _, plus, tipo_raw = match.groups()
            nombre = nombre.strip()
            tipo = obtener_tipo(tipo_raw)
            clave = ""
            if normalizar(nombre) in nombres_tablas:
                clave = "fk"
            elif plus:
                clave = "uk"
            campos.append({
                "clave": clave,
                "nombre": nombre,
                "tipo": tipo,
                "unique": bool(plus)
            })
        elif attr:
            nombre = attr.strip()
            clave = "fk" if normalizar(nombre) in nombres_tablas else ""
            campos.append({
                "clave": clave,
                "nombre": nombre,
                "tipo": "",
                "unique": False
            })

    return tabla, campos

def generar_dot(tablas):
    lines = ['digraph ERDiagram {', '  node [shape=record fontname="Courier"];', '']

    for tabla, campos in tablas.items():
        attr_lines = []
        for campo in campos:
            clave = campo["clave"]
            nombre = campo["nombre"]
            tipo = campo["tipo"]

            prefix = f"{clave.upper():<2}" if clave else "  "
            tipo_str = f": {tipo}" if tipo else ""
            line = f"{prefix} {nombre}{tipo_str}"
            attr_lines.append(line)

        attr_str = r'\l'.join(attr_lines) + r'\l'
        lines.append(f'  "{tabla}" [label="{{{tabla}|{attr_str}}}"];')

    nombres_norm = {normalizar(n): n for n in tablas.keys()}

    # Relaciones FK con cardinalidad, en sentido inverso
    for tabla, campos in tablas.items():
        for campo in campos:
            if campo["clave"] == "fk":
                destino_norm = normalizar(campo["nombre"])
                origen = tabla
                if destino_norm in nombres_norm:
                    destino = nombres_norm[destino_norm]
                    tipo_relacion = "1:1" if campo.get("unique") else "1:N"
                    lines.append(f'  "{destino}" -> "{origen}" [label="{tipo_relacion}"];')

    lines.append('}')
    return '\n'.join(lines)

def main():
    with open("texto.txt", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip() and ":" in line]

    nombres_tablas = set()
    for line in lines:
        nombre = line.split(":", 1)[0].strip()
        nombres_tablas.add(normalizar(nombre))

    tablas = {}
    for line in lines:
        tabla, campos = parse_line(line, nombres_tablas)
        tablas[tabla] = campos

    dot_output = generar_dot(tablas)
    with open("modelo.dot", "w", encoding="utf-8") as f:
        f.write(dot_output)
    print("Archivo 'modelo.dot' generado exitosamente.")

if __name__ == "__main__":
    main()
