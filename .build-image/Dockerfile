FROM ubuntu:26.04
ARG JAVA_PACKAGE='bellsoft-java25'
ARG USERNAME=ubuntu

RUN apt-get update && \
    apt-get install -yq curl wget gnupg && \
    mkdir -m 0755 -p /etc/apt/keyrings/ && \
    wget -q -O - https://download.bell-sw.com/pki/GPG-KEY-bellsoft | gpg --dearmor | tee /etc/apt/keyrings/GPG-KEY-bellsoft.gpg > /dev/null && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/GPG-KEY-bellsoft.gpg] https://apt.bell-sw.com/ stable main" |  tee /etc/apt/sources.list.d/bellsoft.list && \
    curl -sL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get update && \
    apt-get install -yq nodejs $JAVA_PACKAGE && \
    npx playwright install-deps && \
    corepack enable && corepack prepare pnpm@latest --activate && \
    apt-get clean



USER $USERNAME:$USERNAME

