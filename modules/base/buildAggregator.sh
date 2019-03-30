#!/usr/bin/env bash
set -eo

npm pack

CPU_ARCH="amd"
NPM_PACKAGE_VERSION=`npm run getVersion -s`
NPM_PACKAGE_NAME=`npm run getName -s`
NPM_PACKAGE_FILE="${NPM_PACKAGE_NAME}-${NPM_PACKAGE_VERSION}.tgz"
DOCKER_IMAGE_NAME="mqclient-${NPM_PACKAGE_NAME}-${CPU_ARCH}"

docker build -t curiousben/${DOCKER_IMAGE_NAME} --build-arg NPM_PACKAGE_NAME=${NPM_PACKAGE_NAME} --build-arg NPM_PACKAGE_VERSION=${NPM_PACKAGE_VERSION} --build-arg NPM_PACKAGE_FILE=${NPM_PACKAGE_FILE} . --no-cache
docker tag curiousben/${DOCKER_IMAGE_NAME} curiousben/${DOCKER_IMAGE_NAME}:${NPM_PACKAGE_VERSION}

rm ${NPM_PACKAGE_FILE}
