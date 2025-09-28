FROM oven/bun:1

COPY package.json bun.lock ./

RUN bun install

COPY . .

ENTRYPOINT ["bun", "run", "start"]