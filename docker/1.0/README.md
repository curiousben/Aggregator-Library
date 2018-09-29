# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/Aggregator/base/docker/1.0/Dockerfile)

# Quick reference

- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/curiousben/Room-Infrastructure/issues](https://github.com/curiousben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/42656e/) (A message based microservice middleware engineer)

- **Supported architectures**: `armv8`

- **Source of this description**:  
  [The `/README.md` in the root directory](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/Aggregator/base/docker/1.0/README.md)
  
# What is Aggregator?

This microservice enables a BLE device (node) to detect any BLE device by using the host's BLE detection module. Once BLE signals have been detected this microservice sends the data using [curiousben's](https://hub.docker.com/u/curiousben/) redisMQ. The compatibility of this microservice is dependent on the host's BLE capabilities and access to a redis instance.

# How to use this image

## Running this microservice


## Building this images from source

To build this image from scratch clone the git repo `$ git clone https://github.com/curiousben/Room-Infrastructure.git` and navigate to the directory located at `Room-Infrastructure/microservices/Aggregator` in this root directory there is located a package script that creates the image from the `redismq-amd` image.

## Configuration

```js
```
Notes:

- Notes

## Payload sent

The message payload for the BLERelay is as follows:

```js
```

## Usage:

