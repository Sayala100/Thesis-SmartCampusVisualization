# SmartCampus - Visualization

## Proyecto de grado - Ingeniería de Sistemas y computación

Este proyecto consiste de 2 partes principales

## Backend
### API
El framework utilizado fue fastAPI, con el que se consiguió exponer los servicios específicos de analítica necesarios para la obtención y procesamiento de datos.
### Extraccion de datos
Como fuente de datos externa se tiene la oferta de cursos de la página uniandes. Actualmente en el directorio /scrap se encuentran las utilidades para realizar webscraping y obtener en un archivo .json la oferta de cursos
Los datos correspondientes a Access Points y torniquetes fueron generados por medio de mocks, debido a restricciones principalmente éticas al momento de la obtención de los datos. La generación de estos mock se encuentra dentro de /backend/code
como $(tipo_dato)_gen.py
### Procesamiento y analítica
El procesado de datos fue generado usando pandas principalmente y los archivos referentes al mismo se encuentran tanto en /notebooks como en /code/processing.py en donde se limpian los datos, eliminan columnas innecesrias y generan archivos .csv en /data,
para luego generar los datos finales y almacenarlos en el directorio /backend/data
### Despliegue


## Frontend
