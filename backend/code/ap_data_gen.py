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
edificios = ["ML", "SD", "LL", "RGD", "Au" ,"C","O","Tx"]

pesos_pisos = [
    ("ML_1",2),
    ("ML_5",3),
    ("ML_6",2),
    ("LL_1",1),
    ("LL_2",1),
    ("LL_3",2),
    ("Rgd_0000",2),
    ("Rgd_000",2),
    ("Rgd_1",3),
    ("Rgd_2",2),
    ("Rgd_3",2),
    ("Sd_2",1),
    ("Sd_3",2),
    ("Sd_4",1),
    ("Sd_7",3),
    ("Sd_8",3),
    ("Au_1",3),
    ("Au_2",1),
    ("Au_3",2),
    ("Au_4",2),
    ("C_1",3),
    ("C_2",2),
    ("C_3",1),
    ("O_1",3),
    ("O_2",2),
    ("O_3",2),
    ("O_4",1),
    ("Tx_6",2)
]

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

def crear_fila2(capacidad,salon ):
    for i in pesos_pisos:
        if i[0] in salon:
            peso = i[1]
            break
        else:
            peso = 0
    

    num_dispositivos = random.randint(1, capacidad//2)*peso
    hora = crear_hora()
    mac = fake.mac_address()
    ap_name = fake.bothify(text="AP-###")
    return [num_dispositivos, ap_name, mac, hora]
# %%
# Generar los datos
salones.dropna(inplace=True)
salones.reset_index(drop=True, inplace=True)
for index, row in salones.iterrows():
    capacidad = row["Capacidad"]
    salon = salones["Salon"][index] 
    num_aps = capacidad // 25
    if num_aps == 0:
        num_aps = 1

    if num_aps ==1:
        data = crear_fila2(capacidad, salon)
        salones.at[index, "Dispositivos conectados"] = data[0]
        salones.at[index, "Nombre AP"] = data[1]
        salones.at[index, "MAC"] = data[2]
        salones.at[index, "Hora"] = data[3]
    else:
        for j in range(num_aps):
            data = crear_fila2(capacidad, salon)
        
            # Create a new row with the same structure as `salones`
            new_row = row.copy()  # Copy the current row data
            new_row["Dispositivos conectados"] = data[0]
            new_row["Nombre AP"] = data[1]
            new_row["MAC"] = data[2]
            new_row["Hora"] = data[3]
            
            # Append the new row to the DataFrame
            salones = pd.concat([salones, pd.DataFrame([new_row])], axis=0, ignore_index=True)
#%%
salones.sample(10)
# %%
salones.to_csv('../data/AP_data.csv', sep=';', index=False)
