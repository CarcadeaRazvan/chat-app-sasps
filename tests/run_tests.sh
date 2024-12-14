#!/bin/bash
set -e

echo "Running WebSocket Test..."
npx artillery run artillery-websockets.yml > results/websocket-results.txt

echo "Running Pub/Sub Test..."
npx artillery run artillery-pubsub.yml > results/pubsub-results.txt

echo "Tests completed."
echo "Check websocket-results.txt and pubsub-results.txt for results."
