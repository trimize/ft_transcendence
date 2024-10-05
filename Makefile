# Define variables
DB_IMAGE_NAME=my-postgres-db
DB_CONTAINER_NAME=my-postgres-container
DB_PORT=5432
SERVER_DIR=server/tcd_back

.PHONY: all clean compose-up compose-down

all: clean compose-up

clean:
	-docker rm -f $(shell docker ps -aq)
	-docker rmi -f $(shell docker images -q)

compose-up:
	docker-compose up --build -d

compose-down:
	docker-compose down