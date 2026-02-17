FROM ubuntu:24.04

ARG USERNAME=develop
ARG USER_UID=1000
ARG USER_GID=1001

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
    apt-get install -yq curl wget gnupg  libz-dev zip unzip build-essential && \
    curl -sL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get update && \
    apt-get install -yq nodejs
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get clean

RUN usermod -l $USERNAME ubuntu

USER $USERNAME:$USERNAME
