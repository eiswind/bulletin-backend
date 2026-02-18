FROM ubuntu:24.04
ARG JAVA_PACKAGE='bellsoft-java25'

ARG USERNAME=develop
ARG USER_UID=1000
ARG USER_GID=1001

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
    apt-get install -yq curl wget gnupg  libz-dev zip unzip build-essential && \
    wget -q -O - https://download.bell-sw.com/pki/GPG-KEY-bellsoft | apt-key add - && \
    echo "deb [arch=amd64] https://apt.bell-sw.com/ stable main" | tee /etc/apt/sources.list.d/bellsoft.list && \
    curl -sL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get update && \
    apt-get install -yq nodejs $JAVA_PACKAGE &&
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get clean

RUN usermod -l $USERNAME ubuntu

USER $USERNAME:$USERNAME
