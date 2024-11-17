#%%cell
import csv
import random
from faker import Faker
from datetime import datetime
import pandas as pd
import numpy as np
#AP = access point

fake = Faker()

# Leer salones 
#archivo_salones = open('../data/listado_salones.csv', 'r')
#salones = list(csv.reader(archivo_salones))
#archivo_salones.close()
#print(salones)
edificios = ["ML", "SD", "LL", "RGD"]

salones = pd.read_csv('../data/salones.csv', sep=';')
salones = salones[salones["Bloque"].isin(edificios)]
salones.sample(10)
# Un salon tiene 1 AP por cada 25 dispositivos

##Nombre | Numero de dispositivos | MAC | Edificio | Piso | Salon | Rango de hora |
## AP-001 | 10 | 00:00:00:00:00:00 | ML | 1 | 101 | 8:00-9:00 |

# %%

# Genera la hora de acceso de manera ponderada
def generar_hora_ponderada(before_17=False, after_5=False):
    if before_17:
        hours = [i for i in range(17)]  # Antes de las 5pm
        weights = [0.3]*5 + [5]*12
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
def crear_fila(capacidad):
    num_aps = capacidad // 25
    num_dispositivos = random.randint(1, capacidad)

    aps = []

    for i in range(num_aps):
        hora = crear_hora()
        mac = fake.mac_address()
        ap_name = fake.bothify(text="AP-###")
        aps.append([ap_name, mac, hora])
   
    return [num_dispositivos, aps]

def crear_fila2(capacidad):
    num_dispositivos = random.randint(1, capacidad)
    hora = crear_hora()
    mac = fake.mac_address()
    ap_name = fake.bothify(text="AP-###")
    return [num_dispositivos, ap_name, mac, hora]
# %%
# Generar los datos
for i in salones.index:
    capacidad = salones["Capacidad"][i]
    num_aps = capacidad // 25
    if num_aps == 0:
        num_aps = 1

    for j in range(num_aps):
        data = crear_fila2(capacidad)
        salones.at[i, "Dispositivos conectados"] = data[0]
        salones.at[i, "Nombre AP"] = data[1]
        salones.at[i, "MAC"] = data[2]
        salones.at[i, "Hora"] = data[3]

#%%
salones.sample(10)
# %%
salones.to_csv('../data/AP_data.csv', sep=';', index=False)
