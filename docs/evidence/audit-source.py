from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
from collections import Counter,defaultdict
import re,json,hashlib
import argparse
ap=argparse.ArgumentParser(description='Read-only static site audit; output outside source')
ap.add_argument('--source',type=Path,default=Path('/Users/quan/HocTap/Vibecode/eras-clone'))
ap.add_argument('--output',type=Path,default=Path(__file__).resolve().parent/'raw-audit')
args=ap.parse_args();ROOT=args.source.resolve();OUT=args.output.resolve()
if OUT==ROOT or ROOT in OUT.parents:raise SystemExit('Output must be outside source')
OUT.mkdir(parents=True,exist_ok=True)
VOID=set('area base br col embed hr img input link meta param source track wbr'.split())
class Node:
 def __init__(self,tag='root',a=None,line=0,parent=None): self.tag=tag;self.a=a or {};self.line=line;self.parent=parent;self.children=[]
 def text(self): return re.sub(r'\s+',' ',''.join(c if isinstance(c,str) else c.text()+' ' for c in self.children)).strip()
 def visible(self): return re.sub(r'\s+',' ',''.join(c if isinstance(c,str) else ('' if c.tag in ['style','script'] else c.visible()+' ') for c in self.children)).strip()
 def all(self):
  for c in self.children:
   if isinstance(c,Node): yield c;yield from c.all()
 def cls(self,c): return c in self.a.get('class','').split()
 def within(self,tag=None,cls=None,id=None):
  n=self
  while n:
   if (tag and n.tag==tag) or (cls and n.cls(cls)) or (id and n.a.get('id')==id):return True
   n=n.parent
  return False
class Parser(HTMLParser):
 def __init__(self,t): super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(t)
 def handle_starttag(self,t,a):
  n=Node(t,dict(a),self.getpos()[0],self.stack[-1]);self.stack[-1].children.append(n)
  if t not in VOID:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,d):self.stack[-1].children.append(d)

def local(u,f):
 if not u or u.startswith(('data:','javascript:','mailto:','tel:','#','blob:')):return None
 p=urlsplit(urljoin('https://erasvietnam.vn/'+f,u))
 if p.hostname not in ['erasvietnam.vn','www.erasvietnam.vn']:return None
 return unquote(p.path).lstrip('/')
def group(path,body):
 if 'tuyen-dung' in path.split('/') or 'giai-phap-truyen-thong-so' in path or 'digital-communications-solutions' in path:return 'EXCLUDED'
 if 'single-featured_item' in body:return 'project-detail'
 if 'single-post' in body:return 'post-detail'
 if path in ['index.html','en/home/index.html']:return 'home'
 if path.startswith(('featured_item/','featured_item_category/')) or path in ['du-an/index.html','en/our-project/index.html']:return 'projects'
 if any(x in body for x in ['blog','category']):return 'blog'
 if path.split('/')[0]=='login-eras':return 'login'
 if 'about-us' in path or path=='gioi-thieu/index.html':return 'about'
 if any('/'+x+'/' in '/'+path for x in ['thiet-ke-website','thiet-ke-app-mobile','seo-tu-khoa-website','ui-ux-branding-design','e-mail-doanh-nghiep','giai-phap-luu-tru','hosting-doanh-nghiep','vps-doanh-nghiep','website-development','app-mobile-development','website-keyword-seo','ui-ux-branding-design-2','business-e-mail','storage-solution','business-hosting','business-vps']):return 'services'
 if any(x in path for x in ['lien-he/','contact-us/']):return 'contact'
 if any(x in path for x in ['cau-hoi-thuong-gap/','/faq/']):return 'faq'
 return 'content'
files=sorted(p for p in ROOT.rglob('*') if p.is_file() and p.relative_to(ROOT).parts[0] not in ['dist','.git','.netlify','.omc'])
html=[p for p in files if p.suffix=='.html' and not p.relative_to(ROOT).parts[0].startswith(('Trang','_mirror'))]
pages=[]; links=[]; refs=defaultdict(set); css=[]; scripts=[];faqs=[]; raw={}
for p in html:
 f=str(p.relative_to(ROOT)); t=p.read_text(errors='replace'); root=Parser(t).root;nodes=list(root.all());body=next((n.a.get('class','') for n in nodes if n.tag=='body'),'');g=group(f,body);raw[f]=t
 main=next((n for n in nodes if n.tag=='main'),root); mn=list(main.all());
 headings=[dict(tag=n.tag,text=n.text(),line=n.line) for n in mn if n.tag in ['h1','h2','h3','h4'] and not n.within(id='footer')]
 sections=[dict(tag=n.tag,id=n.a.get('id'),cls=n.a.get('class'),line=n.line,headings=[x.text() for x in n.all() if x.tag in ['h1','h2','h3','h4']][:8]) for n in mn if n.tag=='section' and not n.within(tag='footer')]
 forms=[dict(line=n.line,action=n.a.get('action'),method=n.a.get('method'),id=n.a.get('id'),fields=[dict(tag=x.tag,**x.a) for x in n.all() if x.tag in ['input','select','textarea','button']]) for n in nodes if n.tag=='form']
 markers={c:sum(n.cls(c) for n in mn) for c in ['banner-service','ss-decor','ss-kh','ss-target','ss-ndv','accordion','accordion-item','slider','tabbed-content','portfolio-box','box-blog-post','count-up','cs-moving_text','ss-last','ss-footer','row-isotope','ss-duan']}
 sliders=[dict(line=n.line,options=n.a.get('data-flickity-options'),cls=n.a.get('class')) for n in mn if n.cls('slider')]
 for n in nodes:
  if n.tag=='a' and n.a.get('href'):links.append(dict(source=f,line=n.line,label=n.text()[:150],url=n.a['href'],local=local(n.a['href'],f)))
  urls=[]
  for key in ['src','href','poster','data-src','data-bg','data-video','data-background-image','data-pdf','data-source']:
   if n.a.get(key):urls.append(n.a[key])
  for key in ['srcset','data-srcset']:
   if n.a.get(key):urls.extend(x.strip().split(' ')[0] for x in n.a[key].split(','))
  urls+=re.findall(r'url\([\"\']?([^\)\"\']+)',n.a.get('style',''))
  for u in urls:
   a=local(u,f)
   if a:refs[a].add(f)
  if n.tag=='script':
   scripts.append(dict(source=f,line=n.line,src=n.a.get('src'),text=n.text() if not n.a.get('src') else None))
  if n.tag=='style':css.append(dict(source=f,line=n.line,text=n.text()))
  if n.cls('accordion-item') and n.within(tag='main'):
   title=next((x for x in n.all() if x.cls('accordion-title')),None);answer=next((x for x in n.all() if x.cls('accordion-inner')),None)
   if title and answer:faqs.append(dict(source=f,line=n.line,q=title.visible(),answer=answer.visible()))
 pages.append(dict(source=f,route=('/'+f.removesuffix('index.html')) if p.name=='index.html' else None,kind=g,body=body,title=next((n.text() for n in nodes if n.tag=='title'),''),headings=headings,sections=sections,forms=forms,markers=markers,sliders=sliders,header=sum(n.a.get('id')=='header' for n in nodes),footer=sum(n.a.get('id')=='footer' for n in nodes),iframes=[dict(line=n.line,**n.a) for n in mn if n.tag=='iframe'],videos=[dict(line=n.line,**n.a) for n in mn if n.tag in ['video','source']]))
# Scan all local CSS, script and HTML URL literals, including CSS dependencies.
for p in files:
 f=str(p.relative_to(ROOT)); ext=p.suffix.lower()
 if ext in ['.css','.js','.html'] or p.name in ['css','css2','sf-pro-display']:
  t=p.read_text(errors='replace')
  for u in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',t)+re.findall(r'https?://[^\s\"\'<>\\]+',t):
   a=local(u,f)
   if a:refs[a].add(f)
  if ext=='.css' or p.name in ['css','css2','sf-pro-display']:css.append(dict(source=f,line=1,text=t))
assets=[];hashes=defaultdict(list)
for p in files:
 f=str(p.relative_to(ROOT));top=p.relative_to(ROOT).parts[0]
 if top not in ['wp-content','wp-includes'] and not top.endswith('_files'):continue
 h=hashlib.sha256(p.read_bytes()).hexdigest();hashes[h].append(f)
 consumers=sorted(refs.get(f,set()));families=sorted(set(group(x,next((z['body'] for z in pages if z['source']==x),'')) for x in consumers if x.endswith('.html') and not x.startswith('Trang')))
 assets.append(dict(source=f,bytes=p.stat().st_size,sha256=h,consumers=consumers,families=families,proposed='public/'+f,status='referenced' if consumers else 'unproven-use'))
result=dict(pages=pages,links=links,assets=assets,duplicates=[v for v in hashes.values() if len(v)>1],faqs=faqs,css=css,scripts=scripts)
(OUT/'audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print('HTML',len(pages),'index.html',sum(x['source'].endswith('/index.html') or x['source']=='index.html' for x in pages));print('KINDS',Counter(x['kind'] for x in pages));print('ASSETS',len(assets),'DUPLICATE GROUPS',len(result['duplicates']),'UNPROVEN',sum(x['status']=='unproven-use' for x in assets));print('EXTENSIONS',Counter(Path(x['source']).suffix for x in assets));print('FAQ entries',len(faqs))
for p in pages:
 if p['kind'] in ['home','about','services','contact','faq','content','projects'] and not p['source'].startswith('en/') and p['route']:
  print('\n',p['source'],'H/F',p['header'],p['footer'],'markers', {k:v for k,v in p['markers'].items() if v});print([(s['line'],s['cls'],s['headings']) for s in p['sections']]);print('HEAD',[(h['line'],h['text']) for h in p['headings'] if h['tag'] in ['h1','h2']][:24])
