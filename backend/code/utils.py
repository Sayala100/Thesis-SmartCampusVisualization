import pandas as pd
import random
import csv
import os
from collections import defaultdict

def load_data(route):
    data =  pd.read_csv(route)
    return data

def process_csv(file_path):
    # Diccionario para almacenar los resultados
    buildings = defaultdict(lambda: defaultdict(int))

    # Leer el archivo CSV
    with open(file_path, mode='r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        # Procesar cada fila
        for row in csv_reader:
            edificio = row['Edificio'].strip()
            rango_horas = row['Rango de Horas'].strip()
            entradas = float(row['Inscritos'].strip())

            # Sumar las entradas al rango de horas correspondiente
            buildings[edificio][rango_horas] += entradas

    return buildings


def get_piso(edificio, piso, day = "I"):
    time_ranges = [round(x * 0.5, 1) for x in range(12, 42)]  # 6:00 to 21:00 in half-hour intervals
    standard_times = [f"{time}-{time+0.5}" for time in time_ranges[:-1]]  # Generate time ranges like '6-6.5', '6.5-7', ...

    data_path = os.path.join(os.path.dirname(__file__), '../data/processed_courses.csv')

    data = load_data(data_path)
    #Replace dictionary for Edificio
    replacements = {
        ".Edif. Henry Yerly (O)":"O",
        ".Bloque C":"C",
        ".Edif. Carlos Pacheco Devia(W)":"W",
        ".Edif. Mario Laserna (ML)": "ML",
        ".Edif. Gata Golosa(GA)": "GA",
        ".centro cívico":"RGD",
        ".Edif. Aulas": "Aulas",
        ".Bloque TX":"TX",
        ".Edif. Alberto Lleras (LL)": "LL",
        ".Edif. J.M.Santodomingo (SD)": "SD"
    }
    data['Edificio'] = data['Edificio'].replace(replacements)
    data = data[data['Edificio'] == edificio]

    def extract_floor(salon):
        if f'.{edificio}_' in salon:
            return salon.split(f'.{edificio}_')[1].split()[0][0]

        elif "GA" == salon:
            return salon



    data['Floor'] = data['Salón'].apply(lambda x: extract_floor(x))
    data.dropna(inplace=True)
    data['Salón'] = data['Salón'].str.replace('.', '', regex=False)
    data['Salón'] = data['Salón'].str.replace('_', '-', regex=False)

    def split_salon(salon):
        if len(salon.split('-')) == 3:
            base_salon = '-'.join(salon.split('-')[:2])
            extra_salon = salon.split('-')[2]
            return [f"{base_salon[:-1]}{extra_salon}", base_salon]
        return [salon]


    expanded_data = []
    for _, row in data.iterrows():
        salones = split_salon(row['Salón'])
        for salon in salones:
            new_row = row.copy()
            new_row['Salón'] = salon
            expanded_data.append(new_row)
    data = pd.DataFrame(expanded_data)
    
    data.drop(columns=['Periodo'], inplace=True)
    if edificio!="GA":
        data = data[data["Floor"]==str(piso)]

    data = data[data['Días'] == day]
    data = data.groupby(['Salón','Horas'], as_index=False)['Inscritos'].agg('sum')

    # Apply the transformation to the dataframe
    
    data[['start_time', 'end_time']] = data['Horas'].apply(time_to_numeric).apply(pd.Series)

    # Create a list to store results for standardized time ranges
    standardized_ranges = []

    # For each row, map the hours to standardized half-hour ranges
    for _, row in data.iterrows():
        ranges = map_to_standard_range(row['start_time'], row['end_time'])
        for time_range in ranges:
            standardized_ranges.append([row['Salón'], time_range, row['Inscritos']])

    # Convert back to a DataFrame
    standardized_data = pd.DataFrame(standardized_ranges, columns=['Salón', 'Standardized_Hours', 'Inscritos'])

    # Now, group by 'Salón' and 'Standardized_Hours' and sum 'Inscritos'
    final_data = standardized_data.groupby(['Salón', 'Standardized_Hours']).agg({'Inscritos': 'sum'}).reset_index()

    # Ensure that all standardized time ranges are covered
    full_ranges = pd.DataFrame([(salon, time) for salon in data['Salón'].unique() for time in standard_times], columns=['Salón', 'Standardized_Hours'])
    final_data = full_ranges.merge(final_data, on=['Salón', 'Standardized_Hours'], how='left').fillna({'Inscritos': 0})


    result = {
        salon: {
                row['Standardized_Hours']: row['Inscritos']
            for _, row in salon_df.iterrows()}
        for salon, salon_df in final_data.groupby('Salón')
    }
    
    return result



# Convert time range string to numeric values (in hours)
def time_to_numeric(time_str):
    start, end = time_str.split('-')
    start_hour = int(start[:2]) + int(start[2:]) / 60
    end_hour = int(end[:2]) + int(end[2:]) / 60
    return start_hour, end_hour

def map_to_standard_range(start, end):
    ranges = []
    while start < end:
        # Find the next half-hour interval
        next_range = round(start * 2) / 2
        if next_range + 0.5 <= end:
            ranges.append(f"{next_range}-{next_range + 0.5}")
        start = next_range + 0.5
    return ranges

def create_index(rol):
    if rol == "PROFESOR":
        return random.randint(0, 4999)
    elif rol == "ESTUDIANTE":
        return random.randint(5000, 14999)
    elif rol == "CONTRATISTA":
        return random.randint(14999, 15999)
    elif rol == "ASEO":
        return random.randint(15999, 16999)
    elif rol == "EGRESADO":
        return random.randint(16999, 17499)
    elif rol == "EMPLEADO":
        return random.randint(17499, 18999)
    elif rol == "VIGILANCIA":
        return random.randint(19000, 19999)    
