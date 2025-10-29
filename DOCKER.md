# Docker Setup Guide

This guide explains how to run Etho-DV using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher

## Quick Start

### 1. Environment Setup

Copy the environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. At minimum, set:
- `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- `JWT_SECRET` (same as NEXTAUTH_SECRET or generate separately)
- Other required OAuth and storage credentials

### 2. Build and Run with Docker Compose

```bash
# Build and start all services (app + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

The application will be available at `http://localhost:3000`

### 3. Build Docker Image Only

If you want to build just the Docker image without docker-compose:

```bash
# Build the image
docker build -t etho-dv:latest .

# Run the container (requires external MongoDB)
docker run -d \
  -p 3000:3000 \
  --env-file .env.local \
  -e MONGODB_URI=mongodb://your-mongodb-host:27017/etho-dv \
  --name etho-dv-app \
  etho-dv:latest
```

## Docker Compose Services

### App Service
- **Container name**: `etho-dv-app`
- **Port**: 3000 (mapped to host 3000)
- **Environment**: Loaded from `.env.local`
- **Volume**: `./public/uploads` for local file storage

### MongoDB Service
- **Container name**: `etho-dv-mongodb`
- **Port**: 27017 (mapped to host 27017)
- **Database**: `etho-dv`
- **Data persistence**: `mongodb_data` volume

## Development vs Production

### Development
The docker-compose setup is suitable for development and testing. It:
- Uses local MongoDB in a container
- Mounts `./public/uploads` for file storage
- Exposes MongoDB port for direct access

### Production
For production deployments:

1. Use external MongoDB (MongoDB Atlas or managed instance)
2. Use DigitalOcean Spaces for file storage (not local filesystem)
3. Configure all OAuth credentials properly
4. Set strong secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`
5. Configure proper domain in `NEXTAUTH_URL`
6. Consider using Docker secrets instead of environment files
7. Use reverse proxy (nginx/traefik) for SSL termination

Example production docker run:

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=$MONGODB_URI \
  -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  -e NEXTAUTH_URL=https://yourdomain.com \
  -e DO_SPACES_ENDPOINT=$DO_SPACES_ENDPOINT \
  -e DO_SPACES_KEY=$DO_SPACES_KEY \
  -e DO_SPACES_SECRET=$DO_SPACES_SECRET \
  -e DO_SPACES_BUCKET=$DO_SPACES_BUCKET \
  -e DO_SPACES_REGION=$DO_SPACES_REGION \
  --name etho-dv-app \
  --restart unless-stopped \
  etho-dv:latest
```

## Useful Commands

```bash
# View app logs
docker-compose logs -f app

# View MongoDB logs
docker-compose logs -f mongodb

# Restart app service
docker-compose restart app

# Execute bash in app container
docker-compose exec app sh

# Access MongoDB shell
docker-compose exec mongodb mongosh etho-dv

# Check container status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

## Troubleshooting

### Application won't start
- Check logs: `docker-compose logs -f app`
- Verify `.env.local` has all required variables
- Ensure MongoDB is running: `docker-compose ps mongodb`

### MongoDB connection issues
- Check if MongoDB container is running: `docker ps`
- Verify MONGODB_URI in environment uses `mongodb://mongodb:27017/etho-dv`
- Check network connectivity: `docker network inspect etho-dv_etho-dv-network`

### File upload issues
- Verify `./public/uploads` directory exists and has write permissions
- For production, ensure DO_SPACES credentials are configured
- Check container logs for storage-related errors

### Port conflicts
- If port 3000 or 27017 is already in use, modify the ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Maps host port 3001 to container port 3000
  ```
