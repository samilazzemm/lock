# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose your server port
EXPOSE 5000

# Run your server
CMD ["node", "server.js"]
