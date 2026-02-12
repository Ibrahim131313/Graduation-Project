# Nginx API Gateway Dockerfile
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy SSL certificates
COPY ssl/fullchain.crt /etc/nginx/ssl/
COPY ssl/server.key /etc/nginx/ssl/

# Set proper permissions for SSL files
RUN chmod 600 /etc/nginx/ssl/server.key

# Expose ports 80 and 443
EXPOSE 80
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
