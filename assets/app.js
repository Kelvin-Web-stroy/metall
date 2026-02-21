/* ===== Shared cart utils ===== */
const CART_KEY = 'gerametal_cart_v2';

function cartLoad(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch(e){ return []; }
}
function cartSave(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items || []));
  cartUpdateBadges();
}
function cartCount(){
  const items = cartLoad();
  return items.reduce((s,i)=> s + (Number(i.qty)||0), 0);
}
function cartUpdateBadges(){
  const n = cartCount();
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    el.textContent = n;
    el.style.display = n>0 ? 'flex' : 'none';
  });
}
function cartItemId(p){
  // Universal ID (works for new catalog schema)
  const raw = [p.main, p.sub, p.product, p.gost, p.description].join('|');
  let h=0;
  for(let i=0;i<raw.length;i++){ h=((h<<5)-h)+raw.charCodeAt(i); h|=0; }
  return 'i'+Math.abs(h);
}
function cartAdd(p){
  const items = cartLoad();
  const id = cartItemId(p);
  const idx = items.findIndex(x=>x.id===id);
  if(idx>=0){
    items[idx].qty = (Number(items[idx].qty)||0) + 1;
  }else{
    items.push({
      id,
      qty: 1,
      main: p.main || '',
      sub: p.sub || '',
      product: p.product || '',
      description: p.description || '',
      gost: p.gost || '',
    });
  }
  cartSave(items);
}
function cartRemove(id){
  cartSave(cartLoad().filter(x=>x.id!==id));
}
function cartSetQty(id, qty){
  qty = Math.max(1, Number(qty)||1);
  const items = cartLoad();
  const it = items.find(x=>x.id===id);
  if(it){ it.qty = qty; cartSave(items); }
}
function cartClear(){
  cartSave([]);
}

document.addEventListener('DOMContentLoaded', cartUpdateBadges);
