# Use the official Node.js 22 LTS image (Slim variant - Debian-based) as the base
# The slim variant often has a lower vulnerability count than the Alpine variant
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Security best practice: Update all installed packages using apt-get (Debian's package manager)
# This mitigates known vulnerabilities in the base image's underlying OS (Debian).
RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Copy the package.json and package-lock.json (or npm-shrinkwrap.json) files first.
# This step is cached by Docker. If these files don't change, subsequent builds will be much faster.
COPY package*.json ./

# Install project dependencies
# We install them here so that the node_modules directory is available inside the container
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the default port for React development (3000)
EXPOSE 3000

# Default command to run the application in development mode
# This assumes your package.json has a "start" script that runs the dev server.
CMD ["npm", "start"]
