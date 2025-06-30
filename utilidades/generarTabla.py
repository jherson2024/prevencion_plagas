import pandas as pd

# Ruta de entrada y salida
csv_path = "estructura_tablas.csv"
excel_path = "estructura_tablas.xlsx"

# Leer el CSV
df = pd.read_csv(csv_path)

# Convertir a Excel (sin el índice numérico a la izquierda)
df.to_excel(excel_path, index=False)

print(f"Conversión completada: {excel_path}")
