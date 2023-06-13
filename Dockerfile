FROM debian:latest

# Create the bot's directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY . /usr/src/bot

# install dependencies
RUN apt-get update
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs python3 python3-pip python3-venv git
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install git+https://github.com/R0rt1z2/realme-ota
RUN npm install -g nodemon
RUN corepack enable
RUN yarn
RUN yarn install

# Start the bot.
CMD ["yarn", "start"]
