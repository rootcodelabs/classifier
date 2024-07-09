# Use the official Node.js image as a base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application without linting and type-checking
# Skip linting by setting NEXT_SKIP_LINT during build
# Skip type-checking by using NEXT_SKIP_TYPE_CHECK during build
RUN NEXT_SKIP_LINT=true NEXT_SKIP_TYPE_CHECK=true npm run build

# Use a smaller base image for the final stage
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --production

# Set environment variables
ENV PORT=3003
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["npm", "start"]
