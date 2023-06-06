FROM docker/dev-environments-default:stable-1

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - \
    && apt-get update && apt-get install nodejs -y

# Install gcloud
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg  add - \
    && apt-get update -y && apt-get install google-cloud-sdk -y

# Activate docker plugin
RUN sed -i 's/plugins=(git)/plugins=(git docker)/g' /root/.zshrc

# Add copy-ssh.sh
COPY copy-ssh.sh /copy-ssh.sh
RUN chmod +x /copy-ssh.sh