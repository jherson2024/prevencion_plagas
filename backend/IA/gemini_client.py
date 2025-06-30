# gemini_client.py

# gemini_client.py

import google.generativeai as genai
from PIL import Image
import json
import re

# Configura tu API KEY de Gemini
genai.configure(api_key="API_KEY")  # Reemplaza con tu API real

# Define el modelo
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

def analizar_imagen_con_gemini(ruta_imagen: str) -> dict:
    """
    Analiza una imagen de cultivo usando Gemini y retorna datos estandarizados.

    Parameters:
        ruta_imagen (str): Ruta local a la imagen.

    Returns:
        dict: Resultado del análisis con los campos esperados por el sistema.
    """
    try:
        image = Image.open(ruta_imagen)

        prompt = """
        Analiza esta imagen de una planta o cultivo y responde lo siguiente en formato JSON:
        Solo responde con el JSON. No agregues texto adicional.
        {
          "plaga_detectada": bool,
          "nombre_plaga": string | null,
          "severidad": string | null,
          "acciones_recomendadas": string | null
        }
        """

        response = model.generate_content([prompt, image])
        texto = response.text.strip()
        print("respuesta gemini")
        print(texto)

        match = re.search(r'\{[\s\S]*\}', texto)
        if match:
            json_text = match.group(0)
            resultado = json.loads(json_text)

            # Mapeo de severidad a nivel de daño estimado (puedes ajustar según tus reglas)
            severidad = (resultado.get("severidad") or "").lower()
            nivel_dano = {
                "leve": 25,
                "moderada": 50,
                "alta": 75,
                "severa": 90
            }.get(severidad, 50)

            return {
                "plaga_id": 2 if resultado.get("plaga_detectada") else 0,
                "nivel_dano": nivel_dano,
                "confianza": 0.92,  # Simulado por ahora
                "detalle": f"Plaga identificada: {resultado.get('nombre_plaga') or 'Ninguna'} con severidad {resultado.get('severidad') or 'desconocida'}."
            }
        else:
            return {
                "plaga_id": 0,
                "nivel_dano": 0,
                "confianza": 0.0,
                "detalle": "No se pudo interpretar la respuesta del modelo."
            }

    except Exception as e:
        print("error")
        print(e)
        return {
            "plaga_id": 0,
            "nivel_dano": 0,
            "confianza": 0.0,
            "detalle": f"Error al analizar la imagen: {str(e)}"
        }
