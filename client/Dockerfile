# Use the official Nginx base image
FROM nginx:latest

# Install OpenSSL for certificate validation
RUN apt-get update && apt-get install -y openssl && apt-get clean

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate a self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=$HOST_IP" && \
    ls -l /etc/nginx/ssl


# Copy your custom nginx configuration file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy your HTML, CSS, and JS files into the appropriate directories
COPY ./HTML /usr/share/nginx/html
COPY ./CSS-Bootstrap /usr/share/nginx/html/css
COPY ./JS /usr/share/nginx/html/js
RUN mkdir /usr/share/nginx/html/Assets
COPY ./Assets /usr/share/nginx/html/Assets

# Start Nginx and validate SSL certificate
CMD ["/bin/bash", "-c", "openssl x509 -in /etc/nginx/ssl/nginx.crt -text -noout || (echo 'SSL certificate validation failed!' && exit 1) && sed -i 's/localhost/'$HOST_IP'/g' /usr/share/nginx/html/js/appconfig.js && nginx -g 'daemon off;'"]
