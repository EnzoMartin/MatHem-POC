#### BUILD IMAGE ####
FROM node:9 AS Build

ARG NODE_ENV

# Enables color output
ENV FORCE_COLOR=true \
    TERM=xterm \
    CI=true

# Create app directory
WORKDIR /usr/src/app/

COPY ./package.json ./
COPY ./package-lock.json ./

# Install dependencies
RUN npm i --quiet

# Copy over the application
COPY . ./

# Linting
RUN npm run lint

# Tests
RUN npm run test

# Compile React application
#RUN npm run build

# Remove dev modules
RUN npm prune --production

#### RUNTIME IMAGE ####
FROM node:9-alpine AS Runtime

# Run under node user to lockdown permissions
USER node

WORKDIR /usr/src/app/

# Copy built modules
COPY --from=Build /usr/src/app/node_modules/ ./node_modules

# Copy files
COPY ./package.json ./
COPY ./config.js ./
COPY ./app.js ./
COPY ./database.json ./

# Copy application directories
COPY ./populate/ ./populate
COPY ./migrations/ ./migrations
COPY --from=Build /usr/src/app/service/ ./service

# Ready to go
CMD [ "node", "service/start.js" ]
