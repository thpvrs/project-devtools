# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --force

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the application will be running on
EXPOSE 3000

# Start the application with the 'npm run serve' command
CMD ["npm", "run", "serve"]