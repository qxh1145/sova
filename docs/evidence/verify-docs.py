"""Validate planning artifacts and prove the source files remained unchanged.
Run from target root: rtk proxy python3 docs/evidence/verify-docs.py
Only writes verification.json alongside this script; never writes source.
"""
from pathlib import Path
import json, hashlib, csv, re
E=Path(__file__).resolve().parent;D=E.parent;T=D.parent;S=T.parent/'eras-clone'
with (E/'source-files.csv').open() as f:before={r['source']:r['sha256'] for r in csv.DictReader(f)}
after={str(p.relative_to(S)):hashlib.sha256(p.read_bytes()).hexdigest() for p in S.rglob('*') if p.is_file() and '.git' not in p.parts}
changed=[p for p in before if p in after and before[p]!=after[p]];added=sorted(set(after)-set(before));removed=sorted(set(before)-set(after))
r=json.loads((E/'routes.json').read_text());p=json.loads((E/'pages.json').read_text());checks={}
required=['ROUTE_MAP','COMPONENT_MAP','COMPONENT_REUSE_MAP','DATA_MODEL','CLIENT_BOUNDARIES','ASSET_MAP','MIGRATION_PLAN','PROPOSED_FOLDER_STRUCTURE']
checks['required_documents']=all((D/(n+'.md')).is_file() for n in required)
checks['unique_routes']=len(r)==len(set(v['route'] for v in r))==163
checks['retained_routes']=sum(v['disposition']=='retained' for v in r)==147
checks['excluded_routes']=sum(v['disposition']=='excluded' for v in r)==16
checks['project_details']=sum(v['composition']=='project-detail' for v in r)==62
checks['post_details']=sum(v['composition']=='post-detail' for v in r)==27
checks['all_routes_in_markdown']=all('`'+v['route']+'`' in (D/'ROUTE_MAP.md').read_text() for v in r)
checks['all_route_sources_exist']=all((S/v['source']).is_file() for v in r)
checks['extra_snapshots_accounted']=len(p)==169 and len([z for z in p if not z['route']])==6
with (E/'assets.csv').open() as f:a=list(csv.DictReader(f))
checks['all_assets_mapped']=len(a)==1289 and all(v['proposed_destination']=='public/'+v['source'] for v in a)
checks['all_asset_hashes_match']=all(hashlib.sha256((S/v['source']).read_bytes()).hexdigest()==v['sha256'] for v in a)
missing_links=[]
for f in [T/'README.md',*D.glob('*.md')]:
 prose=re.sub(r'```.*?```','',f.read_text(),flags=re.S)
 for link in re.findall(r'\]\(([^)]+)\)',prose):
  if link.startswith(('https://','http://','#')):continue
  target=(f.parent/link.split('#')[0]).resolve()
  if not target.exists() and target.name!='verification.json':missing_links.append([str(f),link])
checks['local_document_links']=not missing_links
checks['no_application_scaffold']=not any((T/f).exists() for f in ['src','public','package.json','node_modules'])
checks['source_unchanged']=not changed and not added and not removed
cms=json.loads((E/'admin-content-routes.json').read_text())
from collections import Counter
checks['cms_route_coverage']=len(cms)==164 and len({v['route'] for v in cms})==164 and {v['route'] for v in r}<={v['route'] for v in cms}
checks['cms_classification_counts']=Counter(v['cmsKind'] for v in cms)=={'collection':89,'structured-page':36,'derived-listing':20,'utility':3,'excluded':16}
checks['cms_exclusions_match']=all((v['disposition']=='excluded')==(next(c for c in cms if c['route']==v['route'])['cmsKind']=='excluded') for v in r)
checks['mock_ui_planning_documents']=all((D/n).exists() for n in ['MOCK_UI_PLAN.md','ADMIN_CONTENT_MAP.md'])
result=dict(checks=checks,source_changed=changed,source_added=added,source_removed=removed,missing_document_links=missing_links,source_files_before=len(before),source_files_after=len(after),validation_scope='Documentation coverage, references, SHA-256. No Next build/browser/visual QA: planning only.')
(E/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(0 if all(checks.values()) else 1)
