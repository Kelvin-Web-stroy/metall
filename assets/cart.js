// assets/cart.js
(function(){
  const fmtInt = (n) => (n===null || n===undefined || n==="" ? "" : new Intl.NumberFormat('ru-RU').format(n));
  const fmtMoney = (n) => (n===null || n===undefined || n==="" ? "" : new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(n));

  function dirLabel(d){ return d==='black' ? 'Черная металлургия' : 'Цветная металлургия'; }

  function unitFor(d){ return d==='black' ? '₽/т' : '₽/кг'; }

  function lineFor(item){
    const p = item.product || {};
    const unit = unitFor(p.metallurgy);
    const price = p.price_ton_to_0_3 ?? p.price_ton_0_3_1 ?? p.price_ton_1_5 ?? p.price_piece_rub;
    const priceStr = (price===null||price===undefined) ? '' : (fmtInt(price) + ' ' + unit);
    return [
      `• ${p.profile || ''} ${p.size || ''}`.trim(),
      p.steel ? `марка: ${p.steel}` : '',
      p.gost ? `ГОСТ/ТУ: ${p.gost}` : '',
      p.category ? `группа: ${p.category}` : '',
      `кол-во: ${item.qty || 1}`,
      priceStr ? `цена: ${priceStr}` : ''
    ].filter(Boolean).join(' | ');
  }

  function render(){
    const list = window.cartGet ? window.cartGet() : [];
    const out = document.getElementById('cartOut');
    const cnt = document.getElementById('cartCount');
    if(cnt) cnt.textContent = String(list.length);

    if(!out) return;
    if(!list.length){
      out.innerHTML = `<div class="notice">Корзина пустая. Перейдите в <a href="catalog.html">каталог</a> и добавьте позиции.</div>`;
      return;
    }

    out.innerHTML = list.map(it=>{
      const p=it.product||{};
      const unit=unitFor(p.metallurgy);
      const price1 = p.price_ton_to_0_3 ?? '';
      return `
        <div class="cart-item">
          <div class="cart-row">
            <div>
              <div class="cart-title">${(p.profile||'Позиция')} <span class="muted">${p.size||''}</span></div>
              <div class="cart-sub">
                <span class="pill">${dirLabel(p.metallurgy)}</span>
                ${p.category ? `<span class="pill">${p.category}</span>`:''}
                ${p.steel ? `<span class="pill">Марка: ${p.steel}</span>`:''}
                ${p.gost ? `<span class="pill">ГОСТ: ${p.gost}</span>`:''}
              </div>
            </div>
            <button class="btn" data-remove="${it.id}">Удалить</button>
          </div>

          <div class="cart-row" style="margin-top:10px">
            <div class="muted">Базовая цена: <b>${fmtInt(price1) || '—'}</b> ${unit}</div>
            <div class="qty">
              <button class="btn" data-dec="${it.id}">−</button>
              <input class="field qty-inp" value="${it.qty||1}" inputmode="numeric" data-qty="${it.id}"/>
              <button class="btn" data-inc="${it.id}">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    out.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click', ()=>{
      cartRemove(b.getAttribute('data-remove'));
      render();
    }));
    out.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click', ()=>{
      const id=b.getAttribute('data-inc');
      const list=cartGet();
      const it=list.find(x=>x.id===id);
      cartSetQty(id, (it?.qty||1)+1);
      render();
    }));
    out.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click', ()=>{
      const id=b.getAttribute('data-dec');
      const list=cartGet();
      const it=list.find(x=>x.id===id);
      cartSetQty(id, Math.max(1,(it?.qty||1)-1));
      render();
    }));
    out.querySelectorAll('[data-qty]').forEach(inp=>inp.addEventListener('input', ()=>{
      const id=inp.getAttribute('data-qty');
      const v=parseInt((inp.value||'').replace(/\D/g,''),10)||1;
      cartSetQty(id,v);
      cartUpdateBadges();
    }));
  }

  function send(){
    const name = (document.getElementById('name')?.value||'').trim();
    const phone = (document.getElementById('phone')?.value||'').trim();
    const msg = (document.getElementById('msg')?.value||'').trim();
    const list = cartGet();

    const lines = [
      'Заявка с сайта ГераМеталл',
      '',
      name ? ('Имя: '+name) : '',
      phone ? ('Телефон: '+phone) : '',
      msg ? ('Комментарий: '+msg) : '',
      '',
      'Позиции:',
      ...list.map(lineFor)
    ].filter(Boolean);

    const subject = encodeURIComponent('Заявка с сайта ГераМеталл — корзина');
    const body = encodeURIComponent(lines.join('\n'));
    location.href = 'mailto:sales@gerametal.ru?subject='+subject+'&body='+body;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    render();
    document.getElementById('sendCart')?.addEventListener('click', send);
    document.getElementById('clearCart')?.addEventListener('click', ()=>{
      cartClear(); render();
    });
  });
})();
