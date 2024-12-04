from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../code'))
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
    data_path = os.path.join(os.path.dirname(__file__), '../data/entradas_edificio_hora_completos.csv')
    data = utils.process_csv(data_path)
    return data

@app.post("/get_ocupacion_piso")
#Data looks like this: {"data": {"Building": "ML", "Floor": 1}}
async def visualize(data: dict = Body(...)):
    edificio = data['Edificio'] 
    piso = data['Piso']
    return utils.get_piso(edificio, piso)
    #Return an image from the ../assets/out folder

@app.get("/get_salones")
async def get_salones():
    return utils.get_salones()

