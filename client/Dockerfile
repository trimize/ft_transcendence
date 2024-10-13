# Use the official Nginx base image
FROM nginx:latest

# Copy your custom nginx configuration file into the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy your HTML, CSS, and JS files into the appropriate directories
COPY ./HTML /usr/share/nginx/html
COPY ./CSS-Bootstrap /usr/share/nginx/html/css
COPY ./JS /usr/share/nginx/html/js
RUN mkdir /usr/share/nginx/html/Assets
COPY ./Assets /usr/share/nginx/html/Assets

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
