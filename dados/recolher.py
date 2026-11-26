# Recolhe os anúncios da Protrade no Standvirtual (fichas + fotos). python -I recolher.py
import re,json,urllib.request,os,time,html
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40).read()
inv=open('raw/inventory.html',encoding='utf-8',errors='ignore').read()
urls=sorted(set(re.findall(r'https://www\.standvirtual\.com/carros/anuncio/[^"\ ]+\.html',inv)))
carros=[]
for u in urls:
    slug=u.rsplit('/',1)[1][:-5]
    p=f'raw/{slug}.html'
    if not os.path.exists(p): open(p,'wb').write(get(u)); time.sleep(1)
    s=open(p,encoding='utf-8',errors='ignore').read()
    nd=json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',s,re.S).group(1))
    open(f'raw/{slug}.json','w',encoding='utf-8').write(json.dumps(nd,ensure_ascii=False))
    carros.append({'slug':slug,'url':u})
json.dump(carros,open('urls.json','w',encoding='utf-8'),indent=1)
print(len(carros))
