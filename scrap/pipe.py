import json
import pandas as pd


# Function to verify if the line has the required information
def Verify_sides(line,index,criteria):
    prev = line[index-1]
    nexto = line[index+1]
    if prev.startswith(criteria):
        return (True,prev)
    elif nexto.startswith(criteria):
        return (True,nexto)
    else:
        return (False,"No info")

# Load the JSON file
with open('no_formatted_cards_data.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Prepare a list to hold the structured data
structured_data = []
guardian = False

for entry in data:
    text = entry['text']
    lines = text.split('\n')

    # Create a dictionary for the formatted data
    formatted_data = {
        'Course Code': lines[0].split()[0],
        'Course Name': ' '.join(lines[0].split()[1:])
    }

    # Handling "Cupo:" value (checking for missing or empty values)
    if lines[2].strip() != "Cupo:" and "NRC" not in lines[2].strip():  # Ensure it's not empty and not just "Cupo:"
        formatted_data['Cupo'] = lines[2].strip()
    else:
        formatted_data['Cupo'] = "No info"
        guardian = True

    # Process other fields, ensuring each field has a fallback value ("No info")
    try:
        if guardian:
            formatted_data['NRC'] = lines[2].split(": ")[1] if len(lines[2].split(": ")) > 1 else "No info"
            formatted_data['Sección'] = lines[3].split(": ")[1] if len(lines[3].split(": ")) > 1 else "No info"
            formatted_data['Créditos'] = lines[4].split(": ")[1] if len(lines[4].split(": ")) > 1 else "No info"
            formatted_data['Periodo'] = lines[5].split(": ")[1] if len(lines[5].split(": ")) > 1 else "No info"
            formatted_data['Parte de Periodo'] = lines[6].split(": ")[1] if "Parte de Periodo" in lines[6] else Verify_sides(lines,6,"Parte de Periodo:")[1].split(": ")[1]
            guardian = False
        else:
            formatted_data['NRC'] = lines[3].split(": ")[1] if len(lines[3].split(": ")) > 1 else "No info"
            formatted_data['Sección'] = lines[4].split(": ")[1] if len(lines[4].split(": ")) > 1 else "No info"
            formatted_data['Créditos'] = lines[5].split(": ")[1] if len(lines[5].split(": ")) > 1 else "No info"
            formatted_data['Periodo'] = lines[6].split(": ")[1] if len(lines[6].split(": ")) > 1  else Verify_sides(lines,6,"Periodo:")[1].split(": ")[1]
            formatted_data['Parte de Periodo'] = lines[7].split(": ")[1] if "Parte de Periodo" in lines[7] else Verify_sides(lines,7,"Parte de Periodo:")[1].split(": ")[1]

        # Check for "Campus:" and ensure it has a value, default to "No info"
        if "Campus:" in lines[9]:
            formatted_data['Campus'] = lines[9].split(": ")[1] #if len(lines[9].split(": ")) > 1 else "No info"
        else:
            formatted_data['Campus'] = Verify_sides(lines,9,"Campus:")[1].split(": ")[1]

    except IndexError:
        print(f"Warning: Missing data in entry: {entry}")
        formatted_data['NRC'] = "No info"
        formatted_data['Sección'] = "No info"
        formatted_data['Créditos'] = "No info"
        formatted_data['Periodo'] = "No info"
        formatted_data['Parte de Periodo'] = "No info"
        formatted_data['Campus'] = "No info"

    # Find the index of "Días Horas Salón Fecha inicio Fecha fin Edificio" line
    try:
        horarios_index = lines.index("Días Horas Salón Fecha inicio Fecha fin Edificio")
    except ValueError:
        print(f"Warning: Missing 'Días Horas Salón Fecha inicio Fecha fin Edificio' in entry: {entry}")
        formatted_data['Días y Horas'] = "No info"
        formatted_data['Fecha Inicio'] = "No info"
        formatted_data['Fecha Fin'] = "No info"
        formatted_data['Edificio'] = "No info"
        continue

    # Initialize a list to store the schedule table
    schedule_table = []

    # Collect all lines between "Días Horas..." and "Cupos:"
    for i in range(horarios_index + 1, len(lines)):
        line = lines[i].strip()

        if line.startswith("Cupos:"):
            break  # Once "Cupos:" is found, stop processing the schedule lines
        else:
            schedule_parts = line.split()
            if len(schedule_parts) >= 6:
                schedule_data = {
                    'Día': schedule_parts[0],
                    'Hora': schedule_parts[1],
                    'Salón': schedule_parts[2],
                    'Fecha Inicio': schedule_parts[3],
                    'Fecha Fin': schedule_parts[4],
                    'Edificio': ' '.join(schedule_parts[5:])
                }
                # Add the schedule_data dictionary to the schedule_table list
                schedule_table.append(schedule_data)
            else:
                # Handle cases with insufficient parts by filling missing fields with "No info"
                schedule_data = {
                    'Día': schedule_parts[0] if len(schedule_parts) > 0 else "No info",
                    'Hora': schedule_parts[1] if len(schedule_parts) > 1 else "No info",
                    'Salón': schedule_parts[2] if len(schedule_parts) > 2 else "No info",
                    'Fecha Inicio': schedule_parts[3] if len(schedule_parts) > 3 else "No info",
                    'Fecha Fin': schedule_parts[4] if len(schedule_parts) > 4 else "No info",
                    'Edificio': ' '.join(schedule_parts[5:]) if len(schedule_parts) > 5 else "No info"
                }
                schedule_table.append(schedule_data)

    # Add the schedule table to the formatted data
    formatted_data['Schedule Table'] = schedule_table
    
    # Handle "Cupos" and its related fields
    try:
        cupos_index = lines.index("Cupos:") + 2  # Skipping the empty line after "Cupos:"
        formatted_data['Cupos Ofrecidos'] = lines[-1].split()[1] if len(lines[-1].split()) > 1 else "No info"
        formatted_data['Cupos Inscritos'] = lines[-1].split()[2] if len(lines[-1].split()) > 2 else "No info"
        formatted_data['Cupos Disponibles'] = lines[-1].split()[3] if len(lines[-1].split()) > 3 else "No info"
    except IndexError:
        formatted_data['Cupos Ofrecidos'] = "No info"
        formatted_data['Cupos Inscritos'] = "No info"
        formatted_data['Cupos Disponibles'] = "No info"

    # Add the formatted data to the structured data list
    structured_data.append(formatted_data)

# Convert the structured data to a pandas DataFrame
df = pd.DataFrame(structured_data)
#print(df)
df.to_csv("formatted_data.csv", index=False)
#df.to_csv("ISIS_formatted_data.csv", index=False)