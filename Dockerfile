FROM debian:sid

RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    git \
    --no-install-recommends \
  && curl -sSL https://deb.nodesource.com/setup_10.x | bash - \
  && curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends \
    nodejs \
  && apt-get purge --auto-remove -y curl gnupg \
  && rm -rf /var/lib/apt/lists/*

# Cloning Lighthouse wrapper files 
RUN git clone https://github.com/Kuzarek/lighthouse-graphite.git

WORKDIR /lighthouse-graphite

ARG CACHEBUST=1

RUN npm install
RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
    && mkdir -p /home/chrome/reports && chown -R chrome:chrome /home/chrome

VOLUME /lighthouse-graphite

# Run Chrome non-privileged
USER chrome

# Drop to cli
CMD ["/bin/bash"]