/* Лилия · RMRNM. Local-only portfolio interactions; no analytics or order API. */
(()=>{
 'use strict';
 const products=window.LILIA_PRODUCTS||[];
 const find=id=>products.find(p=>p.id===id);
 const $=(s,root=document)=>root.querySelector(s);
 const $$=(s,root=document)=>[...root.querySelectorAll(s)];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
 const sizes={S:{label:'Небольшой',delta:-800},M:{label:'Стандартный',delta:0},L:{label:'Пышный',delta:1400}};
 const price=(p,size='M')=>p.price+(sizes[size]||sizes.M).delta;
 const svg=(name)=>`<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',plus:'<path d="M5 12h14M12 5v14"/>',minus:'<path d="M5 12h14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',flower:'<path d="M12 22V11m0 6c-5 0-7-3-7-5 4 0 7 2 7 5Zm0-6C6 11 2 6 3 3c4 0 7 2 9 8Zm0 0c6 0 10-5 9-8-4 0-7 2-9 8Zm0-1C9 7 10 3 12 1c2 2 3 6 0 9Z"/>'})[name]||''}</svg>`;
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 let storageAvailable=true;
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{storageAvailable=false;}};
 let favorites=read('rmrnm-lilia-favorites',[]);
 if(!Array.isArray(favorites))favorites=[];
 favorites=[...new Set(favorites.filter(id=>typeof id==='string'&&find(id)))];
 let cart=read('rmrnm-lilia-cart',[]);
 if(!Array.isArray(cart))cart=[];
 cart=cart.filter(i=>i&&find(i.id)&&Object.hasOwn(sizes,i.size)&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=20).slice(0,18);
 let selectedSize='M';
 let toastTimer;
 const toast=(message,link=false)=>{
  const box=$('#toast');
  if(!box)return;
  clearTimeout(toastTimer);
  box.innerHTML=`<span>${escape(message)}</span>${link?'<a href="cart.html">В корзину</a>':''}`;
  box.hidden=false;
  toastTimer=setTimeout(()=>{box.hidden=true;},5500);
 };
 const counters=()=>{
  const qty=cart.reduce((sum,i)=>sum+i.qty,0);
  $$('[data-cart-count]').forEach(el=>{el.textContent=qty;el.hidden=!qty;});
  $$('[data-favorites-count]').forEach(el=>{el.textContent=favorites.length;el.hidden=!favorites.length;});
  $$('[data-save]').forEach(el=>{const p=find(el.dataset.save);if(!p)return;const saved=favorites.includes(p.id);el.setAttribute('aria-pressed',String(saved));el.setAttribute('aria-label',(saved?'Убрать из избранного':'Сохранить')+' букет «'+p.name+'»');});
 };
 const add=(id,size='M')=>{
  const p=find(id);if(!p||!Object.hasOwn(sizes,size))return;
  const existing=cart.find(i=>i.id===id&&i.size===size);
  if(existing&&existing.qty>=20){toast('В одном варианте можно выбрать до 20 букетов');return;}
  if(existing)existing.qty++;else cart.push({id,size,qty:1});
  write('rmrnm-lilia-cart',cart);counters();
  toast('«'+p.name+'» — в вашей корзине'+(storageAvailable?'':' · только до закрытия страницы'),true);
 };
 const productCard=p=>`<article class="product-card" data-product="${p.id}"><div class="product-photo watermarked"><a href="bouquet-${p.id}.html" tabindex="-1" aria-hidden="true"><img src="assets/${p.image}.webp" srcset="assets/${p.image}-small.webp 520w, assets/${p.image}.webp 1000w" sizes="(max-width:600px) 48vw, (max-width:1000px) 33vw, 25vw" width="1000" height="1250" alt="${escape(p.name+' — '+p.stems)}" loading="lazy" decoding="async"></a><span class="product-tag">${p.tag}</span><button class="save-button icon-button" type="button" data-save="${p.id}" aria-label="Сохранить букет «${p.name}»" aria-pressed="false">${svg('heart')}</button></div><div class="product-info"><div><p class="product-kind">${p.label}</p><h3><a href="bouquet-${p.id}.html">${p.name}</a></h3><p class="product-price">${money(p.price)}</p></div><button class="add-button icon-button" type="button" data-add="${p.id}" aria-label="Добавить букет «${p.name}» в корзину">${svg('plus')}</button></div></article>`;
 const empty=(title,text,button='Выбрать цветы',href='catalog.html',reset=false)=>`<div class="empty-state">${svg('flower')}<h2>${title}</h2><p>${text}</p>${reset?`<button type="button" class="button" data-reset>${button}</button>`:`<a class="button" href="${href}">${button}</a>`}</div>`;
 const renderFavorites=()=>{const el=$('#favorites-grid');if(!el)return;el.innerHTML=favorites.length?products.filter(p=>favorites.includes(p.id)).map(productCard).join(''):empty('Сохраните то, что откликнулось.','Нажмите на сердечко у букета — и он будет ждать вас здесь.');counters();};
 const nav=$('#main-nav');
 const menu=$('.menu-toggle');
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu){menu.setAttribute('aria-expanded','false');nav?.classList.remove('open');}});
 document.addEventListener('click',e=>{
  const target=e.target.closest('button,a');if(!target)return;
  if(target.dataset.open){const dialog=document.getElementById(target.dataset.open);if(dialog instanceof HTMLDialogElement){dialog.showModal();nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}}
  if(target.hasAttribute('data-close'))target.closest('dialog')?.close();
  if(target.dataset.add)add(target.dataset.add);
  if(target.dataset.save){const id=target.dataset.save,p=find(id);if(!p)return;const exists=favorites.includes(id);favorites=exists?favorites.filter(x=>x!==id):[...favorites,id];write('rmrnm-lilia-favorites',favorites);renderFavorites();counters();toast(exists?'Букет убран из избранного':'Букет сохранён в избранном');}
 });
 $$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
 // Catalogue: URL-backed, validated filters and removable selections.
 const filterForm=$('#catalog-filters');
 if(filterForm){
  const params=new URLSearchParams(location.search);
  let search=(params.get('q')||'').slice(0,80).trim();
  let sort=params.get('sort')||'curated';
  if(!['curated','price-up','price-down','name'].includes(sort))sort='curated';
  const sortSelect=$('#catalog-sort');sortSelect.value=sort;
  for(const select of $$('select',filterForm)){const v=params.get(select.name)||'';select.value=[...select.options].some(o=>o.value===v)?v:'';}
  const labels={type:'Цветы',budget:'Бюджет',color:'Палитра',occasion:'Повод'};
  const values=()=>Object.fromEntries(new FormData(filterForm));
  const normalize=s=>s.toLowerCase().replace(/ё/g,'е');
  const render=(sync=false)=>{
   const v=values();
   let result=products.filter(p=>(!v.type||p.type===v.type)&&(!v.budget||p.price<=Number(v.budget))&&(!v.color||p.color===v.color)&&(!v.occasion||p.occasions.includes(v.occasion))&&(!search||normalize([p.name,p.label,p.stems,p.description].join(' ')).includes(normalize(search))));
   if(sort==='price-up')result.sort((a,b)=>a.price-b.price);
   if(sort==='price-down')result.sort((a,b)=>b.price-a.price);
   if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
   const count=result.length;
   $('#results-count').textContent=`${count} ${count===1?'букет':count>1&&count<5?'букета':'букетов'}`;
   $('#catalog-grid').innerHTML=result.length?result.map(productCard).join(''):empty('Пока не нашлось совпадений.','Попробуйте другой оттенок или уберите пару пожеланий.','Сбросить фильтры','',true);
   let tokens=Object.entries(v).filter(([,value])=>value).map(([key])=>{const s=filterForm.elements.namedItem(key);return `<button type="button" class="filter-token" data-clear="${key}" aria-label="Убрать фильтр ${labels[key]}">${escape(s.options[s.selectedIndex].text)} ${svg('close')}</button>`;}).join('');
   if(search)tokens+=`<button type="button" class="filter-token" data-clear="q" aria-label="Убрать поисковый запрос">Поиск: ${escape(search)} ${svg('close')}</button>`;
   $('#selected-filters').innerHTML=tokens;
   counters();
   if(sync){const next=new URLSearchParams();Object.entries(v).forEach(([k,value])=>{if(value)next.set(k,value);});if(search)next.set('q',search);if(sort!=='curated')next.set('sort',sort);history.replaceState(null,'',location.pathname+(next.size?'?'+next:''));}
  };
  const reset=()=>{filterForm.reset();search='';sort='curated';sortSelect.value=sort;render(true);};
  filterForm.addEventListener('change',()=>render(true));
  filterForm.addEventListener('submit',e=>{e.preventDefault();render(true);});
  sortSelect.addEventListener('change',()=>{sort=sortSelect.value;render(true);});
  $('#reset-filters').addEventListener('click',reset);
  document.addEventListener('click',e=>{const clear=e.target.closest('[data-clear]');if(clear){if(clear.dataset.clear==='q')search='';else filterForm.elements.namedItem(clear.dataset.clear).value='';render(true);}if(e.target.closest('[data-reset]'))reset();});
  render();
 }
 // Product sizes update price, diameter, and the exact cart variant.
 const detail=$('[data-detail]');
 if(detail){
  const p=find(detail.dataset.detail);
  $$('[data-size]',detail).forEach(button=>button.addEventListener('click',()=>{
   selectedSize=button.dataset.size;
   $$('[data-size]',detail).forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
   $('#detail-price').textContent=money(price(p,selectedSize));
   $('#size-description').textContent=selectedSize==='M'?`Диаметр ${p.size}. Размер показан на фотографии.`:selectedSize==='S'?'Диаметр примерно 25–30 см. Более компактная композиция.':'Диаметр примерно 45–50 см. Больше цветов и объёма.';
  }));
  $('#detail-add').addEventListener('click',()=>add(p.id,selectedSize));
 }
 // Cart is local to this browser; no personal data or payment is requested.
 const cartItems=$('#cart-items');
 const deliveryForm=$('#delivery-options');
 const totals=()=>{const subtotal=cart.reduce((sum,i)=>sum+price(find(i.id),i.size)*i.qty,0);const pickup=$('input[name="delivery"]:checked',deliveryForm)?.value==='pickup';return {subtotal,shipping:pickup||subtotal>=7000?0:450,pickup};};
 const updateTotals=()=>{
  if(!cartItems)return;
  const {subtotal,shipping,pickup}=totals();
  $('#cart-subtotal').textContent=money(subtotal);
  $('#cart-shipping').textContent=shipping?money(shipping):'Бесплатно';
  $('#cart-total').textContent=money(subtotal+shipping);
  $('#shipping-note').textContent=pickup?'Самовывоз: без доплаты за доставку.':subtotal>=7000?'Бережная доставка — за наш счёт.':`До бесплатной доставки осталось ${money(7000-subtotal)}.`;
 };
 const renderCart=()=>{
  if(!cartItems)return;
  $('.cart-layout').classList.toggle('is-empty',!cart.length);
  if(!cart.length){cartItems.innerHTML=empty('Пока ни одного цветка.','Выберите букет — и здесь начнётся маленький праздник.');counters();return;}
  cartItems.innerHTML=cart.map((item,index)=>{const p=find(item.id);return `<article class="cart-item"><a class="cart-item-photo watermarked" href="bouquet-${p.id}.html" tabindex="-1" aria-hidden="true"><img src="assets/${p.image}-small.webp" width="100" height="125" alt="${p.name}"></a><div><h3><a href="bouquet-${p.id}.html">${p.name}</a></h3><p>${p.label} · ${sizes[item.size].label}</p><p class="item-price">${money(price(p,item.size)*item.qty)}</p></div><div class="cart-item-controls"><div class="quantity-control"><button type="button" data-quantity="${index}" data-delta="-1" aria-label="Уменьшить количество букета «${p.name}»" ${item.qty<=1?'disabled':''}>${svg('minus')}</button><output aria-label="Количество">${item.qty}</output><button type="button" data-quantity="${index}" data-delta="1" aria-label="Увеличить количество букета «${p.name}»" ${item.qty>=20?'disabled':''}>${svg('plus')}</button></div><button class="remove-item" type="button" data-remove="${index}" aria-label="Удалить букет «${p.name}» из корзины">Убрать</button></div></article>`;}).join('');
  updateTotals();counters();
 };
 if(cartItems){
  const date=$('#delivery-date');
  const today=new Date();
  const localDay=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
  date.min=localDay;date.value=localDay;
  deliveryForm.addEventListener('change',updateTotals);
  cartItems.addEventListener('click',e=>{
   const quantity=e.target.closest('[data-quantity]'),remove=e.target.closest('[data-remove]');
   if(quantity){const i=Number(quantity.dataset.quantity);if(!cart[i])return;cart[i].qty=Math.max(1,Math.min(20,cart[i].qty+Number(quantity.dataset.delta)));}
   if(remove){const i=Number(remove.dataset.remove);if(!cart[i])return;cart.splice(i,1);toast('Букет убран из корзины');}
   if(quantity||remove){write('rmrnm-lilia-cart',cart);renderCart();}
  });
  deliveryForm.addEventListener('submit',e=>{
   e.preventDefault();if(!cart.length)return;if(!deliveryForm.reportValidity())return;
   const {subtotal,shipping,pickup}=totals();
   const data=new FormData(deliveryForm);
   const displayDate=new Date(String(data.get('date'))+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
   const message=String(data.get('message')||'').trim().slice(0,180);
   $('#order-summary').innerHTML=`<p>${cart.map(i=>escape(find(i.id).name)+' · '+escape(sizes[i.size].label)+' · '+i.qty+' шт.').join('<br>')}</p><p>${pickup?'Самовывоз':'Доставка'}: ${escape(displayDate)}, ${escape(data.get('time'))}</p>${message?'<p>В открытке: «'+escape(message)+'»</p>':''}<p class="order-total">Примерная сумма: ${money(subtotal+shipping)}</p>`;
   $('#order-dialog').showModal();
  });
  renderCart();
 }
 renderFavorites();counters();
 window.addEventListener('storage',e=>{if(e.key==='rmrnm-lilia-cart'||e.key==='rmrnm-lilia-favorites')location.reload();});
})();
