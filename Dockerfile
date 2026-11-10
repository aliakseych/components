# Gallery + MCP server. Build: docker build -t components . Run: docker run -p 8080:8080 components
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.33.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm prune --prod

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json categories.json tags.json llms.txt ./
COPY catalog ./catalog
COPY components ./components
COPY templates ./templates
COPY blocks ./blocks
COPY mcp ./mcp
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "mcp/server.mjs", "--http"]
