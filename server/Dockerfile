FROM tiangolo/uwsgi-nginx-flask:python3.7


ENV PYTHONPATH /usr/lib/python3/dist-packages
## install dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y netcat-openbsd gcc postgresql-client libgeos-dev python3-opencv python3-pandas libsm6 libxext6 tesseract-ocr && \
    apt-get clean


## set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app


## add user
RUN addgroup --system user && adduser --system --no-create-home --group user
RUN chown -R user:user /app && chmod -R 755 /app

# install dependencies (skip "pip install -U pip": breaks on Debian-patched pip in this base)
COPY ./requirements.txt /app/requirements.txt
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# copy project
COPY . /app/
