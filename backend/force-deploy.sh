#!/bin/bash
echo "Deployment trigger script"
echo "Current time: $(date)"
echo "Commit hash: $(git rev-parse HEAD)"
echo "This file forces a Render deployment"
