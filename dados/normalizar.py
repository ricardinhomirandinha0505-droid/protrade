# raw/*.json -> carros.json + fotos/<slug>/NN.jpg (resolução máxima do portal). python -I normalizar.py
import json,glob,os,re,html,urllib.request,time
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36'}
out=[]
for f in sorted(glob.glob('raw/*-ID*.json')):
    ad=json.load(open(f,encoding='utf-8'))['props']['pageProps']['advert']
    slug=os.path.basename(f)[:-5]
    det={d['key']:d['value'] for d in ad['details']}
    lab={d['label']:d['value'] for d in ad['details']}
    eq=[{'grupo':g['label'],'itens':[v['label'] for v in g['values']]} for g in ad.get('equipment',[])]
    desc=html.unescape(re.sub(r'<li>','\n• ',ad.get('description') or ''));desc=re.sub(r'</p>|<br>','\n',desc);desc=re.sub(r'<[^>]+>','',desc);desc=re.sub(r'\n{2,}','\n',desc).strip()
    fotos=[p['url'] for p in ad['images']['photos']]
    os.makedirs(f'fotos/{slug}',exist_ok=True)
    loc=[]
    for i,u in enumerate(fotos):
        p=f'fotos/{slug}/{i:02d}.jpg'
        if not os.path.exists(p):
            for s in (';s=2048x1536',';s=1600x1200',''):
                try: open(p,'wb').write(urllib.request.urlopen(urllib.request.Request(u+s,headers=UA),timeout=40).read()); break
                except Exception as e: err=e
            time.sleep(.2)
        loc.append(p)
    out.append({'slug':slug,'id':ad['id'],'url':ad['url'],'titulo':ad['title'],'preco':int(float(ad['price']['value'])),
      'negociavel':'ad-page-negotiable-tag' in (ad['price'].get('labels') or []),'principais':ad['mainFeatures'],
      'detalhes':lab,'chaves':det,'equipamento':eq,'descricao':desc,'fotos':loc,'criado':ad['createdAt']})
json.dump(out,open('carros.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
for c in out: print(c['preco'],c['titulo'],'|',' · '.join(c['principais']),'|',len(c['fotos']),'fotos')
