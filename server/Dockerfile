# Use Node base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the server
CMD ["npm", "run", "dev"]
