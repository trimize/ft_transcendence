# Define variables
DB_IMAGE_NAME=my-postgres-db
DB_CONTAINER_NAME=my-postgres-container
DB_PORT=5432
SERVER_DIR=server/tcd_back

.PHONY: all clean compose-up compose-down fclean re front

all: compose-up

clean:
	@if [ ! -z "$(shell docker ps -aq)" ]; then docker rm -f $(shell docker ps -aq); else echo "No containers to remove"; fi
	@if [ ! -z "$(shell docker images -q)" ]; then docker rmi -f $(shell docker images -q); else echo "No images to remove"; fi
compose-up:
	docker compose up --build -d

compose-down:
	docker compose down

fclean: compose-down clean
	@if [ ! -z "$(shell docker volume ls -q)" ]; then docker volume rm -f $(shell docker volume ls -q); else echo "No volumes to remove"; fi
	@$(shell rm -rf $(SERVER_DIR)/api/migrations)

re: fclean compose-up

front: clean compose-up