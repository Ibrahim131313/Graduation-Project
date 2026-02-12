# Backend Dockerfile (Node.js)

FROM node:18

WORKDIR /app

# Copy package files first to not repeat installing dependencies every time
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the code that is changed peridocally
COPY . .

# Expose the backend port (express + socket.io)
EXPOSE 5000

#Run app
CMD ["node" , "app.js"]
