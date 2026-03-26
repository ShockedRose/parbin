# Match playwright npm version in package.json for browser compatibility.
FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json sources.json ./
COPY src ./src

ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
