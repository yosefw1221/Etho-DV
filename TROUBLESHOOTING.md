# Docker Build Troubleshooting Guide

## Common Issues and Solutions

### 1. "ENOSPC: no space left on device"

**Problem:** Your disk is full, preventing Docker builds and package installations.

**Solutions:**

```bash
# Check disk space
df -h

# Clear yarn cache
yarn cache clean

# Clear npm cache
npm cache clean --force

# Remove Docker build cache and unused images
docker system prune -a

# Remove unused Docker volumes
docker volume prune

# Remove node_modules and reinstall (if needed locally)
rm -rf node_modules
yarn install
```

**Free up more space:**
- Empty trash
- Remove old Docker images: `docker image prune -a`
- Remove old containers: `docker container prune`
- Clear system logs: `sudo rm -rf /private/var/log/*`
- Clean Xcode caches (if applicable): `rm -rf ~/Library/Developer/Xcode/DerivedData/*`

### 2. Docker Build Fails During "yarn install" or "npm install"

**Problem:** Network timeout or package registry issues.

**Solutions:**

```bash
# Increase Docker memory allocation in Docker Desktop
# Settings → Resources → Memory → Increase to 4GB+

# Try building with no cache
docker build --no-cache -t etho-dv:latest .

# Use npm instead of yarn (add --network-timeout)
# Already configured in the Dockerfile
```

### 3. "Module not found" Errors During Build

**Problem:** Missing dependencies or incorrect imports.

**Solutions:**

```bash
# Ensure all dependencies are in package.json
yarn install

# Check for missing peer dependencies
yarn install --check-files

# Verify import paths use @ alias correctly
# Example: import X from '@/lib/utils' not '../../../lib/utils'
```

### 4. TypeScript Errors During Build

**Problem:** Type checking fails during Docker build.

**Solution:** The Dockerfile is configured to skip type checking during build (`ignoreBuildErrors: true` in next.config.mjs). Run type checking separately:

```bash
yarn type-check
```

Fix type errors locally before deploying.

### 5. Docker Compose Fails to Start

**Problem:** Port conflicts or environment variable issues.

**Solutions:**

```bash
# Check if ports are already in use
lsof -i :3000
lsof -i :27017

# Kill processes using those ports
kill -9 <PID>

# Or change ports in docker-compose.yml:
ports:
  - "3001:3000"  # Use port 3001 on host instead

# Ensure .env.local exists with required variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 6. MongoDB Connection Issues in Docker

**Problem:** App can't connect to MongoDB container.

**Solutions:**

```bash
# Check if MongoDB container is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Ensure MONGODB_URI uses the service name
# In docker-compose environment:
MONGODB_URI=mongodb://mongodb:27017/etho-dv
# NOT localhost!

# Test connection
docker-compose exec mongodb mongosh etho-dv
```

### 7. File Upload Issues in Docker

**Problem:** Cannot upload files or files not persisting.

**Solutions:**

```bash
# For development with local storage:
# Ensure volume is mounted in docker-compose.yml:
volumes:
  - ./public/uploads:/app/public/uploads

# For production:
# Use DigitalOcean Spaces (configure DO_SPACES_* env vars)

# Check directory permissions
docker-compose exec app ls -la /app/public/uploads
```

### 8. Build Works Locally But Fails in Docker

**Problem:** Environment differences between local and Docker.

**Solutions:**

```bash
# Ensure .dockerignore is correct (not excluding needed files)
# Check that .env variables are passed to Docker
# Verify next.config.mjs has output: 'standalone'

# Test build locally first
npm run build

# Check Docker build logs carefully
docker build -t etho-dv:latest . 2>&1 | tee build.log
```

## Performance Tips

### Speed Up Docker Builds

1. **Use BuildKit:**
   ```bash
   DOCKER_BUILDKIT=1 docker build -t etho-dv:latest .
   ```

2. **Layer Caching:**
   - The Dockerfile already uses multi-stage builds
   - Keep dependency installation before code copy

3. **Reduce Image Size:**
   - Alpine images are already used
   - Production dependencies only (`--only=production`)

### Monitor Docker Resource Usage

```bash
# Check Docker stats
docker stats

# Check image sizes
docker images etho-dv

# Check container logs
docker-compose logs -f --tail=100
```

## Getting Help

If issues persist:

1. Check Docker logs: `docker-compose logs -f`
2. Check app logs inside container: `docker-compose exec app sh` then `cat logs/*`
3. Verify environment variables: `docker-compose exec app printenv`
4. Test MongoDB connection: `docker-compose exec app nc -zv mongodb 27017`

## Useful Commands Summary

```bash
# Clean everything Docker-related
docker system prune -a --volumes

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# View all logs
docker-compose logs -f

# Execute commands inside container
docker-compose exec app sh
docker-compose exec mongodb mongosh

# Check resource usage
docker stats
df -h
```
