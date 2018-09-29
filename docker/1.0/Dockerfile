####################################
# Aggregator Image
# Author: BenSmith(CuriousBen)
####################################

#----INFO: Image to run test suite
FROM curiousben/redismq-nodejs-amd:latest

COPY ./aggregator.testSuite.tar.gz /tmp/

#----INFO: Installing the Aggregator testing Suite App and testing the microservice
RUN apk update --no-cache \
  && tar -xzvf /tmp/aggregator.testSuite.tar.gz -C /opt/ \
  && cd /opt/aggregator \
  && npm install --only=dev \
  && rm /tmp/aggregator.testSuite.tar.gz \
  && npm test

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Setting the environment to production
ENV NODE_ENV=production \
  MICROSERVICE=Aggregator

#----INFO: Copying the local tarball into the tmp directory
COPY ./aggregator.tar.gz /tmp/

#----INFO: Updating package manager and installing packages and installs the Aggregator App
RUN apk update --no-cache \
  && tar -xzvf /tmp/aggregator.tar.gz -C /opt/ \
  && cd /opt/aggregator \
  && npm install \
  && rm /tmp/aggregator.tar.gz \
  && npm cache verify

#----INFO: Where users enter into the container will be located within the file system
WORKDIR /opt/aggregator/

#----INFO: Process supervisor to handle the terminate signals that Linux sends to PID 1
ENTRYPOINT ["dumb-init","--"]

#----INFO: Actual Command that intializes the microservice
CMD ["npm","start"]

#----INFO: Example docker run command
#---- $ docker run -d --name aggregator -v <path/to/config/directory>:/etc/opt/aggregator/ curiousben/aggregator
