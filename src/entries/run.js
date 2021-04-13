#!/bin/sh
":" //# comment; exec /usr/bin/env node --no-warnings --experimental-loader=.hack/build/src/entries/NodeLoader.mjs "$0" "$@"
