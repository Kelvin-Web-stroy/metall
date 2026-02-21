function esc(s){
  return (s||'').toString()
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");
}

function buildRequestText(items, meta){
  const lines = [];
  lines.push('Заявка с сайта ГераМеталл');
  if(meta?.name) lines.push('Имя: ' + meta.name);
  if(meta?.phone) lines.push('Телефон: ' + meta.phone);
  if(meta?.comment) lines.push('Комментарий: ' + meta.comment);
  lines.push('');
  lines.push('Товары:');
  items.forEach((it, i) => {
    const head = [it.product].filter(Boolean).join(' ');
    const metaParts = [
      it.main ? ('Направление: ' + it.main) : '',
      it.sub ? ('Подкатегория: ' + it.sub) : '',
      it.gost ? ('ГОСТ: ' + it.gost) : '',
    ].filter(Boolean).join(', ');
    lines.push(`${i+1}) ${head} — кол-во: ${it.qty}` + (metaParts ? ` (${metaParts})` : ''));
    if(it.description) lines.push('   ' + it.description);
  });
  lines.push('');
  lines.push('Источник: корзина сайта');
  return lines.join('\n');
}

function render(){
  const items = cartLoad();
  document.getElementById('cartCount').textContent = items.reduce((s,i)=>s+(Number(i.qty)||0),0);

  const out=document.getElementById('cartOut');
  const cards=document.getElementById('cartCards');

  if(items.length===0){
    out.innerHTML = `<div class="notice"><b>Корзина пуста.</b> Перейдите в каталог и добавьте позиции.</div>`;
    cards.innerHTML='';
    return;
  }

  out.innerHTML = `
    <div class="cart-list">
      <table class="cart-table">
        <thead><tr>
          <th>Товар</th><th>Направление</th><th>Подкатегория</th><th>Кол-во</th><th></th>
        </tr></thead>
        <tbody>
          ${items.map(it=>{
            return `
              <tr>
                <td>
                  <b>${esc(it.product||'')}</b>
                  ${it.description ? `<div class="small" style="color:var(--muted);margin-top:6px">${esc(it.description)}</div>`:''}
                  ${it.gost ? `<div class="small" style="color:var(--muted)">${esc('ГОСТ: '+it.gost)}</div>`:''}
                </td>
                <td>${esc(it.main||'')}</td>
                <td>${esc(it.sub||'')}</td>
                <td><input class="qty" type="number" min="1" value="${it.qty}" data-qty="${it.id}"></td>
                <td><button class="remove" data-remove="${it.id}">Удалить</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  cards.innerHTML = items.map(it=>{
    return `
      <div class="cart-card">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:950">${esc(it.product||'')}</div>
            <div class="small" style="color:var(--muted);margin-top:6px">${esc([it.main,it.sub].filter(Boolean).join(' • '))}</div>
            ${it.description ? `<div class="small" style="color:var(--muted);margin-top:6px">${esc(it.description)}</div>`:''}
          </div>
          <button class="remove" data-remove="${it.id}">Удалить</button>
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-top:10px">
          <span class="small" style="color:var(--muted);font-weight:900">Кол-во</span>
          <input class="qty" type="number" min="1" value="${it.qty}" data-qty="${it.id}">
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      cartRemove(btn.getAttribute('data-remove'));
      render();
    });
  });
  document.querySelectorAll('[data-qty]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      cartSetQty(inp.getAttribute('data-qty'), inp.value);
      render();
    });
  });
}

function initActions(){
  document.getElementById('clearCart').addEventListener('click', ()=>{
    cartClear();
    render();
  });

  const copyBtn = document.getElementById('copyRequest');
  const mailBtn = document.getElementById('mailRequest');
  const waBtn = document.getElementById('waRequest');

  function getMeta(){
    return {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      comment: document.getElementById('comment').value.trim(),
    };
  }

  function getText(){
    const items = cartLoad();
    return buildRequestText(items, getMeta());
  }

  copyBtn.addEventListener('click', async ()=>{
    const text = getText();
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Скопировано ✅';
      setTimeout(()=>copyBtn.textContent='Скопировать заявку', 1200);
    }catch(e){
      alert('Не удалось скопировать. Выделите текст вручную и скопируйте.');
    }
  });

  mailBtn.addEventListener('click', ()=>{
    const subject = encodeURIComponent('Заявка с сайта ГераМеталл');
    const body = encodeURIComponent(getText());
    const to = 'sales@gerametal.ru';
    location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });

  waBtn.addEventListener('click', ()=>{
    const text = encodeURIComponent(getText());
    const waPhone = '79000000000';
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  render();
  initActions();
});
