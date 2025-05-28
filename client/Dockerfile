FROM node:20

WORKDIR /app

COPY package*.json ./
# Install dependencies with legacy peer deps flag
RUN npm install --legacy-peer-deps

COPY . .

# Expose Vite port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]





