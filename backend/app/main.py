from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
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

@app.post("/procesar_entradas_edificio")
async def process_csv():
    data = utils.process_csv('../data/entradas_edificio_hora.csv')
    return data

@app.post("/gen_images/")
#Data looks like this: {"data": {"Building": "ML", "Floor": 1}}
async def visualize(data: dict = Body(...)):
    print(data)
    #utils.generate_visualization(data)
    return {"status": "success"}