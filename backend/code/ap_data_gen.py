#%%cell
import csv
import random
from faker import Faker
from datetime import datetime
import pandas as pd
#AP = access point

fake = Faker()

# Leer salones 
#archivo_salones = open('../data/listado_salones.csv', 'r')
#salones = list(csv.reader(archivo_salones))
#archivo_salones.close()
#print(salones)
edificios = ["ML", "Sd", "LL", "RGD"]

salones = pd.read_csv('../data/salones.csv', sep=';')
salones = salones[salones["Bloque"].isin(edificios)]
salones.sample(10)
# Un salon puede tener entre 1 y 2 APs 

# %%
