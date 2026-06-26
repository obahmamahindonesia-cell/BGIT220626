#!/bin/bash
# Deploy only to mr-dom02/bgit-220626
cd "$(dirname "$0")"
npx vercel deploy --prod --token="$VERCEL_TOKEN"
