FROM node:latest

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY ["package.json", "tsconfig.json", "src", "./"]

RUN npm install -g typescript --silent
RUN npm install --silent
RUN tsc -p .

RUN mkdir -p /usr/src/app/dist/assets
COPY ["src/assets", "./dist/assets"]

EXPOSE 8000 8001

CMD ["node", "dist/app.js"]
