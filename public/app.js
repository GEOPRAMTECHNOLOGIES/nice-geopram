async function fetchServices(){
  const res = await fetch('/api/services');
  return res.json();
}
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display='block';
  setTimeout(()=>t.style.display='none',3000);
}

function renderServices(list){
  const container = document.getElementById('list');
  container.innerHTML='';
  list.forEach(s=>{
    const el = document.createElement('div'); el.className='service';
    el.innerHTML = `<img src="${s.image||'https://kenyamycountry.com/lion.png'}" alt=""><div><h3>${s.title}</h3><p>${s.description||''}</p><p>Price: ${s.price}</p><button class="btn">Order</button></div>`;
    el.querySelector('button').addEventListener('click', ()=>openOrder(s));
    container.appendChild(el);
  });
}

function openOrder(s){
  document.getElementById('orderModal').style.display='block';
  document.getElementById('svcTitle').textContent = s.title + ' — KES ' + s.price;
  document.getElementById('serviceId').value = s._id;
}

document.getElementById('closeBtn').addEventListener('click', ()=>{ document.getElementById('orderModal').style.display='none'; });

document.getElementById('orderForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const serviceId = document.getElementById('serviceId').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const res = await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({serviceId,name,email,phone})});
  const data = await res.json();
  if(!data.ok){ showToast('Order failed'); return; }
  // simulate payment
  const sim = await fetch('/api/payments/simulate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId:data.orderId})});
  const simRes = await sim.json();
  if(simRes.ok){ showToast('Payment successful — Thank you!'); document.getElementById('orderModal').style.display='none'; }
  else showToast('Payment simulation failed');
});

(async function(){
  const services = await fetchServices();
  if(services.length===0){
    // create sample services client-side via a quick request to serverless seed if available
    try{
      await fetch('/seed-sample',{method:'POST'});
    }catch(e){}
    const s2 = await fetchServices(); renderServices(s2);
  } else renderServices(services);
})();
