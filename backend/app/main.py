from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os, sys
module_path = os.path.abspath(os.path.join('..', 'code'))
if module_path not in sys.path:
    sys.path.append(module_path)
import utils

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/procesar_entradas_edificio")
async def process_csv():
    data = utils.process_csv('../data/entradas_edificio_hora_completos.csv')
    return data

@app.post("/get_ocupacion_piso")
#Data looks like this: {"data": {"Building": "ML", "Floor": 1}}
async def visualize(data: dict = Body(...)):
    keys = list(data.keys()) # edificio
    return utils.get_piso(keys[0], data[keys[0]])
    #Return an image from the ../assets/out folder

