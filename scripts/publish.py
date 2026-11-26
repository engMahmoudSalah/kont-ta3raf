#!/usr/bin/env python3
"""Publish/upsert an episode on the site. Usage: publish.py episode.json
JSON fields: id,title,summary,body,cat,type,ep,youtube,short,tiktok,cover,tags,minutes,featured,credit,
status (published|draft), publishAt (ms epoch, optional; item stays hidden until then).
Key: ~/.kont_publish_key (rotate with: wrangler secret put PUBLISH_KEY)."""
import json, sys, os, urllib.request
U = 'https://kont-ta3raf.mahmodsalah.workers.dev/api/publish'
key = open(os.path.expanduser('~/.kont_publish_key')).read().strip()
d = json.load(open(sys.argv[1]))
r = urllib.request.Request(U, json.dumps(d).encode(), {'content-type': 'application/json', 'x-publish-key': key, 'user-agent': 'kont-publish/1'})
out = json.load(urllib.request.urlopen(r))
print({k: out.get(k) for k in ('id', 'title', 'ep', 'status', 'publishAt', 'youtube', 'cover')})
