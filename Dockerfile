FROM node:24
ENTRYPOINT ["node", "/usr/src/app/dist/server.js"]
EXPOSE 3000

RUN mkdir -p /usr/arc/app

COPY ./node_modules/ /usr/src/app/node_modules/
COPY ./dist/ /usr/src/app/dist/
COPY ./drizzle/ /usr/src/app/drizzle/



