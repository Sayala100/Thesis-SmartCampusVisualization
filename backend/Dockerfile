#
FROM python:3.12

#
WORKDIR /backend/

#
COPY ./requirements.txt /backend/requirements.txt

#
RUN pip install --no-cache-dir --upgrade -r /backend/requirements.txt

#
COPY ./app /backend/app
COPY ./code /backend/code
COPY ./data /backend/data

RUN ls -la ./app

#
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]