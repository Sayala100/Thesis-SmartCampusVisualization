import json
import pandas as pd

# Load the JSON file
with open('no_formatted_cards_data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Prepare a list to hold the structured data
structured_data = []

# Process each entry
for entry in data:
    text = entry['text']
    # Split the text into lines
    lines = text.split('\n')
    print(lines)

    # Create a dictionary for the formatted data
    if lines[2] != "Sin cupo":
        
        formatted_data = {
            'Course Code': lines[0].split()[0],
            'Course Name': ' '.join(lines[0].split()[1:]),
            'Cupo': lines[2].strip(),
            'NRC': lines[3].split(": ")[1],
            'Sección': lines[4].split(": ")[1],
            'Créditos': lines[5].split(": ")[1],
            'Periodo': lines[6].split(": ")[1],
            'Parte de Periodo': lines[7].split(": ")[1],
            'Instructor Principal': lines[8].split(": ")[1],
            'Campus': lines[9].split(": ")[1],
            'Días y Horas': lines[10].strip(),
            'Fecha Inicio': lines[11].strip(),
            'Fecha Fin': lines[12].strip(),
            'Edificio': lines[13].strip(),
            'Cupos Ofrecidos': lines[-1].split()[1],
            'Cupos Inscritos': lines[-1].split()[2],
            'Cupos Disponibles': lines[-1].split()[3]
        }
    else:
        formatted_data = {
            'Course Code': lines[0].split()[0],
            'Course Name': ' '.join(lines[0].split()[1:]),
            'Cupo': lines[2].strip(),
            'NRC': lines[3].split(": ")[1],
            'Sección': lines[5].split(": ")[1],
            'Créditos': lines[6].split(": ")[1],
            'Periodo': lines[7].split(": ")[1],
            'Parte de Periodo': lines[8].split(": ")[1],
            'Instructor Principal': lines[9].split(": ")[1],
            'Campus': lines[10].split(": ")[1],
            'Días y Horas': lines[11].strip(),
            'Fecha Inicio': lines[12].strip(),
            'Fecha Fin': lines[13].strip(),
            'Edificio': lines[14].strip(),
            'Cupos Ofrecidos': lines[-1].split()[1],
            'Cupos Inscritos': lines[-1].split()[2],
            'Cupos Disponibles': lines[-1].split()[3]
        }
        

    # Append the formatted data to the structured data list
    structured_data.append(formatted_data)

# Convert the structured data to a pandas DataFrame
df = pd.DataFrame(structured_data)

# Display the DataFrame (or export it to a file if needed)
print(df)