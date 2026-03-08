# ─── STAGE 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências primeiro (melhor uso de cache)
COPY package*.json ./
RUN npm install

# Copia o restante do projeto e builda
COPY . .
RUN npm run build

# ─── STAGE 2: Servir com Nginx ────────────────────────────
FROM nginx:alpine AS production

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia config customizada para React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
