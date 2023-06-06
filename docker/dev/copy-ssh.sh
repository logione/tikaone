#!/bin/sh
set -e

cp -R /tmp/.ssh /root/.ssh
chown -R root:root /root/.ssh
chmod 700 /root/.ssh
chmod 644 /root/.ssh/id_rsa.pub
chmod 600 /root/.ssh/id_rsa

sleep infinity