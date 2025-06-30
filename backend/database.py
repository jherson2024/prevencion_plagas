import mysql.connector
from mysql.connector import Error

def get_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',         # Cambia si tu host no es localhost
            database='ppac',     # Cambia por el nombre de tu base de datos
            user='root',     # Tu usuario
            password='1234',     # Tu contraseña
            charset='utf8mb4'
        )
        return connection
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None
