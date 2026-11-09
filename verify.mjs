import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const pages=(await fs.readdir(root)).filter(p=>p.endsWith('.html'));
const errors=[];
let references=0;
for(const page of pages){
 const html=await fs.readFile(path.join(root,page),'utf8');
 if(!html.includes('lang="ru"')||!html.includes('RMRNM'))errors.push(page+': missing language or author');
 if((html.match(/<h1[\s>]/g)||[]).length!==1)errors.push(page+': expected one h1');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(page+': duplicate id');
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(/^(https?:|mailto:|tel:|data:|#)/.test(value))continue;
  if(value.startsWith('/'))errors.push(page+': root-relative path '+value);
  const clean=value.split(/[?#]/)[0];if(!clean)continue;
  references++;
  try{await fs.access(path.join(root,clean));}catch{errors.push(page+': missing '+clean);}
 }
}
const fonts=await fs.readFile(path.join(root,'assets/fonts.css'),'utf8');
for(const match of fonts.matchAll(/url\(([^)]+)\)/g)){try{await fs.access(path.join(root,'assets',match[1]));}catch{errors.push('Missing local font '+match[1]);}}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Verified ${pages.length} pages, ${references} local references, unique IDs, headings, authorship and local fonts.`);
