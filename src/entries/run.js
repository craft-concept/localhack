#!/bin/sh
":" //# comment; exec /usr/bin/env node --no-warnings --experimental-loader=.hack/build/entries/NodeLoader.mjs "$0" "$@"
