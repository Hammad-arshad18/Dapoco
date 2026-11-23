import json, os, sys, urllib.request
out = sys.argv[1]; ids = sys.argv[2:]
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'dapoco-site-build'})) as r: return r.read()
for i in ids:
    files = json.loads(get(f'https://api.polyhaven.com/files/{i}'))
    g = files['gltf']['1k']['gltf']
    d = os.path.join(out, i); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, os.path.basename(g['url'])), 'wb').write(get(g['url']))
    for rel, meta in g.get('include', {}).items():
        p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'wb').write(get(meta['url']))
    print('ok', i, flush=True)
