# SmartCampus - Visualization

## Proyecto de grado - Ingeniería de Sistemas y computación

## Backend
### API
El framework utilizado fue fastAPI, con el que se consiguió exponer los servicios específicos de analítica necesarios para la obtención y procesamiento de datos.
### Extraccion de datos
Como fuente de datos externa se tiene la oferta de cursos de la página uniandes. Actualmente en el directorio `/scrap` se encuentran las utilidades para realizar webscraping y obtener en un archivo .json la oferta de cursos
Los datos correspondientes a Access Points y torniquetes fueron generados por medio de mocks, debido a restricciones principalmente éticas al momento de la obtención de los datos. La generación de estos mock se encuentra dentro de `/backend/code`
como `$(tipo_dato)_gen.py`
### Procesamiento y analítica
El procesado de datos fue generado usando pandas principalmente y los archivos referentes al mismo se encuentran tanto en /notebooks como en `/code/processing.py` en donde se limpian los datos, eliminan columnas innecesrias y generan archivos .csv en `/data`,
para luego generar los datos finales y almacenarlos en el directorio `/backend/data`

## Frontend
El frontend consiste de 2 partes: 
### Modelo 3D

Vista principal de la aplicación, es lo que se puede encontrar al abrir el sitio web. Muestra el comportamiento de movimiento de los estudiantes durante un día en la universidad. Desarrollado con threeJS, el archivo `/frontend/src/components/edificio/edificios.js` contiene la lógica que importa los modelos, genera luces y actualiza los colores dinámicamente tras obtener datos desde el endpoint `procesar_entradas_edificio`.

La creación de un modelo se lleva a cabo en el software [Maya](https://www.autodesk.com/latam/products/maya/overview). Y la exportación de cada uno se hace con el plugin [Maya2glTF](https://github.com/iimachines/Maya2glTF). Sobre el mismo archivo se realizan todos los modelos, luego se selecciona el que se quiere exportar y con ayuda del plugin se obtiene un archivo gltf y .bin, que se agregan al directorio `/frontend/public/imports` (Es importante **no** cambiar el nombre de los archivos generados)

Importar dicho modelo en maya se realiza en `/frontend/src/components/edificio/edificios.js` agregando una nueva entrada a la variable modelFiles. 

Por último agregar las luces para el nuevo modelo consiste en acceder a la consola, y tomar las dimensiones y posición del modelo. Esto se hace automaticamente con `logModelDimensions`, función que está declarada al final del archivo. Al momento de agregar un nuevo modelo, es necesario asegurarse que se está haciendo un llamado a esta en el bucle de carga (`modelFiles.forEach...`) 

### Detalle en 2D
Vista complementaria de cada edificio, permite ver la ocupación durante un día de los salones de un piso de un edificio determinado. Se llega a esta vista por medio del seleccionador en el navbar principal, o cambiando el piso seleccionado en la URL `http://localhost:4813/detail?building=${EDIFICIO}&floor=${PISO}}` donde EDIFICIO y PISO son los parametros que determinan lo que se busca. 

Dentro de `/frontend/src/components/detailedView` se encuentra la lógica que dibuja los rectángulos que representan cada salón (Las dimensiones y coordenadas se encuentran en `dimension.json`) y el cambio dinámico de colores (Que sucede en `detailedView.jsx`). En caso de querer agregar un nuevo edificio o salón hay que crear nuevos rectángulos en el archivo `dimensions.json` siguiendo el siguiente estandar: 

```json
{
  "EDIFICIO": {
    "PISO": {
      "EDIFICIO-CODIGO_SALON": {
        "width": ANCHO,
        "height": ALTO,
        "positionx": COORDENADA_X,
        "positiony": COORDENADA_Y
      }
    }
  }
}
```

## Despliegue
La solución fue dockerizada para permitir un acceso rápido y eficiente. Dentro de `/frontend` y `/backend` es posible encontrar un Dockerfile, que especifica las versiones de tecnologías a ser usadas, junto con las dependencias y el comando que se usará para la ejecución. Para ejecutar ambos frontend y backend al mismo tiempo, es posible encontrar a `/docker-compose.yml`, un archivo que condensa las dos apps en un solo archivo, define los puertos y ejecuta el código.

En caso de querer desplegar la solución y ejecutarla desde 

### Requerimientos
* WSL2 si el SO es windows.
* Docker (Desktop o engine).

### Ejecucion
En la raiz del repositorio, ejecutar
> docker-compose up -d --build

El frontend se puede acceder desde `localhost:4813`

El backend está en `localhost:2604`

En caso de querer cambiar los puertos, se puede hacer desde `/docker.compose.yml`