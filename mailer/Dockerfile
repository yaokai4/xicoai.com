FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY index.mjs ./
# Container-internal port; host maps 25 → this.
EXPOSE 2525
CMD ["node", "index.mjs"]
