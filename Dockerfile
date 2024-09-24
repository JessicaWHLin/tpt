# syntax = docker/dockerfile:1.4

FROM python:3.12

WORKDIR /app


COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt


COPY . .


CMD ["uvicorn", "app:app","--host","0.0.0.0", "--port","8000"]


