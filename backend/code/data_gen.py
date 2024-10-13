import csv
import random
from faker import Faker
from datetime import datetime

fake = Faker()

# Edificios a generar
buildings = ["ML", "SD", "LL", "CD", "RGD"]

# Pesos de los roles
roles_with_weights = [
    ("EMPLEADO", 5),
    ("VIGILANCIA", 4),
    ("PROFESOR", 3),
    ("ESTUDIANTE", 4),
    ("CONTRATISTA", 1),
    ("ASEO", 5),
    ("EGRESADO", 2)
]

# Genera una puerta aleatoria
def generar_puerta():
    if random.random() > 0.5:
        building = random.choice(buildings)
        return f"{building}{random.randint(1, 12)}-MOL{random.randint(1, 7)}-{random.choice(['IN', 'OUT'])}-T{random.randint(1, 13)}"
    else:
        veh_building = random.choice(["ML", "SD"])
        return f"{veh_building}-VEHICULAR-{veh_building}-T{random.randint(1, 13)}"

# Genera la hora de acceso de manera ponderada
def generar_hora_ponderada(before_17=False, after_5=False):
    if before_17:
        hours = [i for i in range(17)]  # Antes de las 5pm
        weights = [1]*5 + [5]*12
    elif after_5:
        hours = [i for i in range(5, 24)]  # Despues de las 5am
        weights = [5]*12 + [3]*4 + [2]*3
    else:
        hours = [i for i in range(24)]
        weights = [1]*5 + [5]*12 + [3]*4 + [2]*3
    return random.choices(hours, weights=weights, k=1)[0]

# Genera la hora random
def crear_hora(before_17=False, after_5=False):
    hour = generar_hora_ponderada(before_17, after_5)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return datetime(2024, 10, 1, hour, minute, second).strftime('%Y/%m/%d %H:%M:%S')

# Generar una fila
def crear_fila():
    # Selecciona el rol dependiendo de los pesos
    role, _ = random.choices(roles_with_weights, weights=[role[1] for role in roles_with_weights], k=1)[0]
    
    if role == "ASEO":
        timestamp = crear_hora(before_17=True)
    elif role == "ESTUDIANTE":
        timestamp = crear_hora(after_5=True)
    else:
        timestamp = crear_hora()
    
    return [
        "Acceso concedido",  # Evento
        generar_puerta(),   # Puerta
        timestamp,           # FechaHora
        role                 # Rol
    ]


def create_data(num_rows: int = 100):
    
    output_file = "../data/output.csv"

    with open(output_file, mode="w", newline="") as file:
        writer = csv.writer(file)

        writer.writerow(["Evento", "Puerta", "FechaHora", "Rol"])

        for _ in range(num_rows):
            writer.writerow(crear_fila())

    print(f"CSV file '{output_file}' generated with {num_rows} rows.")


create_data(100000)