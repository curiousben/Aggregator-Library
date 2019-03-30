#!/usr/local/env bash
docker run --name ble-aggregator -v /Users/neveroddoreven/Repos/Custom/Aggregator-Library/services/ble-aggregator/config/:/opt/MQClient/config/ --link some-rabbit:amqp-service aggregator-ble-amd 
