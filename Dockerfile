# Use the official Node.js 22 LTS image (Slim variant - Debian-based) as the base
# The slim variant often has a lower vulnerability count than the Alpine variant
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or npm-shrinkwrap.json) files first.
# This step is cached by Docker. If these files don't change, subsequent builds will be much faster.
COPY package*.json ./

# Install project dependencies
# We install them here so that the node_modules directory is available inside the container
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the configured Vite dev server port
EXPOSE 43177

# Default command to run the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]
