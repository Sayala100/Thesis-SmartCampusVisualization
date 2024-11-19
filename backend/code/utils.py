import pandas as pd
import random
import cv2
def load_data(route):
    data =  pd.read_csv(route)
    return data

import os
import cv2

def load_images(route):
    images = []
    valid_extensions = {'.jpg', '.png'}
    for file_name in os.listdir(route):
        _, ext = os.path.splitext(file_name)

        if ext.lower() in valid_extensions:

            file_path = os.path.join(route, file_name)

            image = cv2.imread(file_path)
            if image is not None: 
                images.append(image)
    
    return images

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