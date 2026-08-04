# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- Development ----------
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ---------- Build (production assets) ----------
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---------- Production (served by Nginx) ----------
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
