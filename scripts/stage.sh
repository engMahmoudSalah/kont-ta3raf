#!/bin/bash
# deploy current source to the throwaway staging worker (own KV), for audits
set -e
export CLOUDFLARE_API_TOKEN=$(cat /home/sandbox/.vault/cloudflare-api-token-677521/password)
rm -rf /tmp/stage && mkdir -p /tmp/stage && cd ~/work/kont && cp -r worker.js seed.js kidsdata.js integrations.js public /tmp/stage/ && cd /tmp/stage
sed -e 's/^name = .*/name = "kont-ta3raf-stage"/' ~/work/kont/wrangler.toml | sed -e "s/id = \".*\"/id = \"$(cat ~/.stage_kv)\"/" > wrangler.toml
npx wrangler deploy 2>&1 | grep -E 'ERROR|https' || true
