####################################
# Aggregator  Image
# Author: BenSmith(CuriousBen)
####################################

#----INFO: Image to run test suite
FROM curiousben/mqclient-aggregator-amd:latest

#----INFO: Pass the actual configurations into the container
COPY ./bin/mqApp.js /opt/MQClient/
COPY ./bin/logger.config /opt/MQClient/config/
COPY ./bin/mqclient.config /opt/MQClient/config/
COPY ./bin/aggregtor.config /opt/MQClient/config/
COPY ./bin/aggregtorCallbackClass.js /opt/MQClient/callbackClass.js

#----INFO: Installing the Aggregator testing Suite App and testing the microservice
RUN apk update --no-cache

#----INFO: Process supervisor to handle the terminate signals that Linux sends to PID 1
ENTRYPOINT ["dumb-init","--"]

#----INFO: Actual Command that intializes the microservice
CMD ["./runMQClient.sh"]

#----INFO: Example docker run command
#---- $ docker run -d --name aggregator -v <path/to/config/directory>:/etc/opt/aggregator/ curiousben/aggregator
