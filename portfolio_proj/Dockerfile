# Dockerfile.prod
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY my-react-app/package.json my-react-app/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY my-react-app/ ./

# Build the app
RUN npm run build

# Install Firebase CLI
RUN npm install -g firebase-tools

# Production nginx stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]