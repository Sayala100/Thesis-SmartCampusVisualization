#%%
import pandas as pd
import json

# Function to extract days and schedule details
def parse_schedule_line(line):
    tokens = line.split()
    days = []
    index = 0
    # Extract all day abbreviations at the start of the line
    while index < len(tokens) and tokens[index] in ["L", "M", "I", "J", "V", "S"]:
        days.append(tokens[index])
        index += 1
    # The rest are schedule details
    if len(tokens) - index < 5:
        raise ValueError(f"Invalid schedule line format: {line}")
    horas = tokens[index]
    salon = tokens[index + 1]
    fecha_inicio = tokens[index + 2]
    fecha_fin = tokens[index + 3]
    edificio = ' '.join(tokens[index + 4:])  # Join the remaining tokens for 'Edificio'
    schedule_details = {
        "Horas": horas,
        "Salón": salon,
        "Fecha inicio": fecha_inicio,
        "Fecha fin": fecha_fin,
        "Edificio": edificio
    }
    return days, schedule_details

# Input text
file = open("../data/salones_sin_formatear.json", "r", encoding="utf-8")
data_json = json.loads(file.read())

courses = pd.DataFrame()
for materia in data_json:

    # Split text into lines and strip any leading/trailing whitespace
    lines = [line.strip() for line in materia['text'].splitlines()]
    lines = [line for line in lines if "Atributos" not in line]
    campus_index=0
    for i in range(len(lines)):
        line = lines[i]
        if "Campus:" in line:
            campus_index = i
            break
    # Remove lines that dont have colon and are before campus_index

    lines = [line for line in lines if ":" in line or lines.index(line) > campus_index or lines.index(line) <= 4 ] 

    # Extract schedule lines by identifying lines containing '.Edif.'
    schedule_lines = [line for line in lines if ".Edif." in line]

    # Define schedule keys
    horario_keys = ["Días", "Horas", "Salón", "Fecha inicio", "Fecha fin", "Edificio"]
    horarios = []



    # Parse each schedule line
    for schedule in schedule_lines:
        try:
            days, schedule_details = parse_schedule_line(schedule)
            for day in days:
                horario_entry = {"Días": day}
                horario_entry.update(schedule_details)
                horarios.append(horario_entry)
        except ValueError as ve:
            print(ve)


    desplazamiento=0
    if "NRC" in lines[2]: 
        desplazamiento = 1
        cupo = ""
    else: cupo = lines[2]

    extra_despl=0
    if "Campus" in lines[8-desplazamiento]:
        extra_despl = 1


    # Extract other relevant details
    course_data = {
        "Curso": lines[0],
        "Cupo": cupo,
        "NRC": lines[3-desplazamiento].split(":")[1].strip(),
        "Sección": lines[4-desplazamiento].split(":")[1].strip(),
        "Créditos": int(lines[5-desplazamiento].split(":")[1].strip()),
        "Periodo": lines[6-desplazamiento].split(":")[1].strip(),
        "Parte de Periodo": lines[7-desplazamiento].split(":")[1].strip(),
        "Instructor Principal": lines[8-desplazamiento].split(":")[1].strip(),
        "Campus": lines[9-desplazamiento-extra_despl].split(":")[1].strip(),
        "Horario": horarios,
        # Extract the "Ofrecidos", "Inscritos", and "Disponibles" row (last line)
        "Ofrecidos": int(lines[-1].split()[1]),
        "Inscritos": int(lines[-1].split()[2]),
        "Disponibles": int(lines[-1].split()[3]),
    }

    # Convert to DataFrame
    df = pd.DataFrame([course_data])

    # To better visualize the 'Horario' field, we can expand it
    # Create separate rows for each schedule entry
    df_expanded = df.explode('Horario').reset_index(drop=True)

    # Normalize the 'Horario' dictionaries into separate columns
    horario_df = pd.json_normalize(df_expanded['Horario'])

    # Combine with the main DataFrame
    final_df = pd.concat([df_expanded.drop(columns=['Horario']), horario_df], axis=1)

    courses = pd.concat([courses, final_df], ignore_index=True)

courses.to_csv("../data/courses.csv", index=False)


# %%
