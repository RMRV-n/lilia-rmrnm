import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist/assets');
const url='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Manrope:wght@400;500;600&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}});
if(!response.ok)throw new Error('Font CSS: '+response.status);
const css=await response.text();
const wanted=[];
for(const match of css.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)){
 if(['cyrillic','latin'].includes(match[1].trim()))wanted.push(match[2]);
}
if(!wanted.length)throw new Error('No font subsets were returned');
const files=new Map();let output=[];
for(let rule of wanted){const remote=rule.match(/url\((https:[^)]+)\)/)?.[1];if(!remote)continue;let filename=files.get(remote);if(!filename){filename='font-'+(files.size+1)+'.woff2';const r=await fetch(remote);if(!r.ok)throw new Error('Font: '+r.status);await fs.writeFile(path.join(root,filename),Buffer.from(await r.arrayBuffer()));files.set(remote,filename);}output.push(rule.replace(remote,filename));}
await fs.writeFile(path.join(root,'fonts.css'),'/* Google Fonts · Cormorant Garamond + Manrope · local Cyrillic and Latin subsets */\n'+output.join('\n'));
await fs.mkdir(path.join(root,'licenses'),{recursive:true});
for(const family of ['cormorantgaramond','manrope']){
 const license=await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt');
 if(!license.ok)throw new Error('Font license: '+license.status);
 await fs.writeFile(path.join(root,'licenses',family+'-OFL.txt'),await license.text());
}
console.log('Saved '+files.size+' local font subsets.');
