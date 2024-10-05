# Define variables
DB_IMAGE_NAME=my-postgres-db
DB_CONTAINER_NAME=my-postgres-container
DB_PORT=5432
SERVER_DIR=server/tcd_back

.PHONY: all build-db run-db migrate runserver

all: build-db run-db migrate runserver

build-db:
    cd database && docker build -t $(DB_IMAGE_NAME) .

run-db:
    docker run -d --name $(DB_CONTAINER_NAME) -p $(DB_PORT):$(DB_PORT) $(DB_IMAGE_NAME)

migrate:
    cd $(SERVER_DIR) && python3 manage.py makemigrations && python3 manage.py migrate

runserver:
    cd $(SERVER_DIR) && python3 manage.py runserver