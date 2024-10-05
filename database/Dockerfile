# Use the official PostgreSQL image from the Docker Hub
FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=transcendence
ENV POSTGRES_PASSWORD=123456
ENV POSTGRES_DB=tcd_db

# Expose the PostgreSQL port
EXPOSE 5432

# Add a custom initialization script if needed
# COPY init.sql /docker-entrypoint-initdb.d/

# The official PostgreSQL image automatically runs any scripts in /docker-entrypoint-initdb.d/