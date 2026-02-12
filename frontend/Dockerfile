# Frontend Dockerfile (React+Vite)
# Bild stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build 

# Serve Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# This command run nginx as a foreground to be on always but by default for backend (node.js) work in foreground
CMD ["nginx", "-g", "daemon off;"]

