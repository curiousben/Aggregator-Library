#!/bin/bash

set -eo pipefail

./node_modules/.bin/mocha --recursive ./test
./node_modules/.bin/eslint ./test
