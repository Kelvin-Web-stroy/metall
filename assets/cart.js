function esc(s){
  return (s||'').toString()
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");
}
function fmt(n){
  return (n==null||n==='' ? '' : new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n));
}

function buildText(items, meta){
  const lines=[];
  lines.push('Заявка с сайта ГераМеталл');
  if(meta.name) lines.push('Имя: '+meta.name);
  if(meta.phone) lines.push('Телефон: '+meta.phone);
  if(meta.comment) lines.push('Комментарий: '+meta.comment);
  lines.push('');
  lines.push('Позиции:');
  items.forEach((it,i)=>{
    const title=[it.profile,it.size].filter(Boolean).join(' ');
    lines.push(`${i+1}) ${title} — ${it.qty} шт/ед. (Группа: ${it.category || '-'})`);
  });
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
          <th>Товар</th><th>Группа</th><th>Кол-во</th><th></th>
        </tr></thead>
        <tbody>
          ${items.map(it=>{
            const title=[it.profile,it.size].filter(Boolean).join(' ');
            return `
              <tr>
                <td><b>${esc(title)}</b></td>
                <td>${esc(it.category||'')}</td>
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
    const title=[it.profile,it.size].filter(Boolean).join(' ');
    return `
      <div class="cart-card">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:950">${esc(title)}</div>
            <div class="small" style="color:var(--muted);margin-top:6px">${esc(it.category||'')}</div>
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

document.addEventListener('DOMContentLoaded', ()=>{
  render();

  document.getElementById('clearCart').addEventListener('click', ()=>{
    cartClear(); render();
  });

  const getMeta = ()=>({
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    comment: document.getElementById('comment').value.trim()
  });

  const getText = ()=>buildText(cartLoad(), getMeta());

  document.getElementById('copyRequest').addEventListener('click', async (e)=>{
    try{
      await navigator.clipboard.writeText(getText());
      e.target.textContent='Скопировано ✅';
      setTimeout(()=>e.target.textContent='Скопировать заявку',1200);
    }catch(err){
      alert('Не удалось скопировать.');
    }
  });

  document.getElementById('mailRequest').addEventListener('click', ()=>{
    const to = 'sales@ВАШ_ДОМЕН.ru'; // поменяй
    location.href = `mailto:${to}?subject=${encodeURIComponent('Заявка с сайта')}&body=${encodeURIComponent(getText())}`;
  });

  document.getElementById('waRequest').addEventListener('click', ()=>{
    const waPhone = '79XXXXXXXXX'; // поменяй (без +)
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(getText())}`, '_blank');
  });
});