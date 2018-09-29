####################################
# Core Aggregator Image
# Author: BenSmith(CuriousBen)
####################################

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Load the environmental variables
ARG NPM_PACKAGE
ARG NPM_PACKAGE_VERSION

#----INFO: Labeling the image
LABEL version=${NPM_PACKAGE_VERSION} \
      maintainer="benjamindsmith3@gmail.com"

#----INFO:Coping local tarball of RedisMQ client
COPY ${NPM_PACKAGE} /tmp/

#----INFO:Update package indices with the udate to date source and installing basic utilities
RUN apk update --no-cache \

#----INFO:Installing the npm package for production globally
  && npm install /tmp/${NPM_PACKAGE} --production --global \

#----INFO:INFO: Linking the RedisMQ library so any program can use it
 && npm link aggregator \

#----INFO:Remove the tarball of RedisMQ
  && rm /tmp/${NPM_PACKAGE} \

#----INFO: Verifies that the npm cache is indexed properly and collects any garbage
  && npm cache verify