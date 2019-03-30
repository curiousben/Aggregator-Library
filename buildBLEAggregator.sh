#!/usr/bin/env bash
set -eo

DOCKER_IMAGE_NAME="aggregator-ble-amd"
VERISON="1.0.0"

docker build -t "${DOCKER_IMAGE_NAME}" -f docker/1.0/Dockerfile . --no-cache
docker tag ${DOCKER_IMAGE_NAME} ${DOCKER_IMAGE_NAME}:${VERISON}
