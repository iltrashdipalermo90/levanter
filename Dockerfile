FROM node:20
RUN git clone https://github.com/iltrashdipalermo90/levanter.git /app
WORKDIR /app
RUN yarn install
CMD ["npm", "start"]
