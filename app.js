const KEY='usaha_ikan_db_v1';
const navItems=[
 ['dashboard','📊 Dashboard'],['ikan','🐟 Stok Ikan'],['pakan','🌾 Stok Pakan'],
 ['pembelian','📥 Pembelian'],['penjualan','📤 Penjualan'],['hutang','💳 Hutang-Piutang'],
 ['laporan','📈 Laporan'],['pengaturan','⚙️ Pengaturan']
];
let db=loadDB(), page='dashboard';

function loadDB(){
 try{return JSON.parse(localStorage.getItem(KEY))||seed()}catch(e){return seed()}
}
function seed(){
 const x={settings:{store:'Usaha Ikan',address:'',phone:'',footer:'Terima kasih'},fish:[],feed:[],purchases:[],sales:[],debts:[],expenses:[],stockMoves:[]};
 localStorage.setItem(KEY,JSON.stringify(x));return x;
}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function rupiah(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0)}
function num(n){return Number(n)||0}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function dateNow(){return new Date().toISOString().slice(0,10)}
function id(prefix){return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)}
function toast(s){const t=document.getElementById('toast');t.textContent=s;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function setPage(p){page=p;render()}
function money(v){return `<span>${rupiah(v)}</span>`}
function fishStock(){return db.fish.reduce((a,f)=>a+num(f.qty),0)}
function feedStock(){return db.feed.reduce((a,f)=>a+num(f.qty),0)}
function totalStockValue(){return db.fish.reduce((a,f)=>a+num(f.qty)*num(f.cost),0)}
function periodTotals(month){
 const sales=db.sales.filter(x=>x.date.startsWith(month));
 const purchases=db.purchases.filter(x=>x.date.startsWith(month));
 const expenses=db.expenses.filter(x=>x.date.startsWith(month));
 const omzet=sales.reduce((a,x)=>a+num(x.total),0);
 const cogs=sales.reduce((a,x)=>a+num(x.cogs),0);
 const buy=purchases.reduce((a,x)=>a+num(x.total),0);
 const exp=expenses.reduce((a,x)=>a+num(x.amount),0);
 return {sales,curchases:purchases,expenses,omzet,cogs,buy,exp,profit:omzet-cogs-exp};
}
function nav(){
 const html=navItems.map(([k,l])=>`<button class="${page===k?'active':''}" onclick="setPage('${k}')">${l}</button>`).join('');
 document.getElementById('sideNav').innerHTML=html;
 document.getElementById('mobileNav').innerHTML=html;
}
function render(){nav();const a=document.getElementById('app');({dashboard,ikan,pakan,pembelian,penjualan,hutang,laporan,pengaturan}[page]||dashboard)(a)}

function dashboard(a){
 const m=new Date().toISOString().slice(0,7), t=periodTotals(m);
 const piutang=db.debts.filter(x=>x.type==='piutang'&&x.status!=='lunas').reduce((s,x)=>s+num(x.remaining),0);
 const hutang=db.debts.filter(x=>x.type==='hutang'&&x.status!=='lunas').reduce((s,x)=>s+num(x.remaining),0);
 a.innerHTML=`<div class="top"><h1>Dashboard</h1><div class="actions"><button class="btn primary" onclick="setPage('penjualan')">+ Penjualan</button><button class="btn" onclick="setPage('pembelian')">+ Pembelian</button></div></div>
 <div class="grid g4 section">
  <div class="card metric"><div class="label">Omzet bulan ini</div><div class="value">${rupiah(t.omzet)}</div></div>
  <div class="card metric"><div class="label">Laba bersih bulan ini</div><div class="value ${t.profit<0?'bad':'ok'}">${rupiah(t.profit)}</div></div>
  <div class="card metric"><div class="label">Stok ikan</div><div class="value">${fishStock()} ekor</div><small>${rupiah(totalStockValue())} nilai modal</small></div>
  <div class="card metric"><div class="label">Stok pakan</div><div class="value">${feedStock()}</div><small>unit sesuai satuan</small></div>
 </div>
 <div class="grid g3 section">
  <div class="card"><b>Arus bulan ini</b><hr><div>Penjualan <strong style="float:right">${rupiah(t.omzet)}</strong></div><div>HPP/COGS <strong style="float:right">${rupiah(t.cogs)}</strong></div><div>Biaya operasional <strong style="float:right">${rupiah(t.exp)}</strong></div><hr><div>Laba bersih <strong style="float:right">${rupiah(t.profit)}</strong></div></div>
  <div class="card"><b>Piutang berjalan</b><div class="value ok" style="margin-top:8px">${rupiah(piutang)}</div><button class="btn sm" onclick="setPage('hutang')">Kelola</button></div>
  <div class="card"><b>Hutang berjalan</b><div class="value bad" style="margin-top:8px">${rupiah(hutang)}</div><button class="btn sm" onclick="setPage('hutang')">Kelola</button></div>
 </div>
 <div class="card"><div class="toolbar"><b>Transaksi terbaru</b><button class="btn sm" onclick="setPage('laporan')">Lihat laporan</button></div>${recentTable()}</div>`;
}
function recentTable(){
 const rows=[
  ...db.sales.map(x=>({...x,_t:'Penjualan',_sign:1})),
  ...db.purchases.map(x=>({...x,_t:'Pembelian',_sign:-1}))
 ].sort((a,b)=>(b.date+b.id).localeCompare(a.date+a.id)).slice(0,8);
 if(!rows.length)return '<div class="empty">Belum ada transaksi.</div>';
 return `<div class="scroll"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Nama</th><th class="num">Total</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${x.date}</td><td>${x._t}</td><td>${esc(x.customer||x.supplier||'-')}</td><td class="num">${rupiah(x.total)}</td></tr>`).join('')}</tbody></table></div>`
}

function ikan(a){
 a.innerHTML=`<div class="top"><h1>Stok Ikan</h1><button class="btn primary" onclick="fishForm()">+ Tambah ikan</button></div>
 <div class="card section"><div class="toolbar"><span>Setiap jenis ikan menyimpan jumlah ekor dan modal rata-rata per ekor.</span><div class="right"><button class="btn sm" onclick="adjustFish()">Penyesuaian stok</button></div></div>
 <div class="scroll"><table><thead><tr><th>Jenis</th><th>Ukuran/Varian</th><th class="num">Stok (ekor)</th><th class="num">Modal/ekor</th><th class="num">Nilai stok</th><th></th></tr></thead><tbody>${db.fish.length?db.fish.map(f=>`<tr><td><b>${esc(f.name)}</b></td><td>${esc(f.variant||'-')}</td><td class="num">${f.qty}</td><td class="num">${rupiah(f.cost)}</td><td class="num">${rupiah(f.qty*f.cost)}</td><td><button class="btn sm" onclick="fishForm('${f.id}')">Edit</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty">Belum ada stok ikan.</td></tr>`}</tbody></table></div></div>`;
}
function fishForm(fid){
 const f=db.fish.find(x=>x.id===fid)||{name:'',variant:'',qty:0,cost:0};
 const name=prompt('Nama/jenis ikan:',f.name); if(name===null)return;
 const variant=prompt('Ukuran/varian (opsional):',f.variant||''); if(variant===null)return;
 const qty=prompt('Jumlah stok (ekor):',f.qty); if(qty===null)return;
 const cost=prompt('Modal rata-rata per ekor:',f.cost); if(cost===null)return;
 if(!name.trim())return toast('Nama ikan wajib diisi');
 if(fid)Object.assign(f,{name:name.trim(),variant:variant.trim(),qty:num(qty),cost:num(cost)});
 else db.fish.push({id:id('fish'),name:name.trim(),variant:variant.trim(),qty:num(qty),cost:num(cost)});
 save();render();toast('Stok ikan disimpan');
}
function adjustFish(){
 const f=db.fish[0]; if(!f)return toast('Tambahkan ikan dulu');
 const name=prompt('Masukkan nama ikan yang akan disesuaikan:',f.name);if(name===null)return;
 const x=db.fish.find(v=>v.name.toLowerCase()===name.toLowerCase());if(!x)return toast('Ikan tidak ditemukan');
 const q=prompt(`Stok baru untuk ${x.name} (ekor):`,x.qty);if(q===null)return;
 x.qty=Math.max(0,num(q));save();render();toast('Stok disesuaikan');
}

function pakan(a){
 a.innerHTML=`<div class="top"><h1>Stok Pakan</h1><button class="btn primary" onclick="feedForm()">+ Tambah pakan</button></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Nama pakan</th><th>Satuan</th><th class="num">Stok</th><th class="num">Harga modal/satuan</th><th class="num">Nilai stok</th><th></th></tr></thead><tbody>${db.feed.length?db.feed.map(f=>`<tr><td>${esc(f.name)}</td><td>${esc(f.unit)}</td><td class="num">${f.qty}</td><td class="num">${rupiah(f.cost)}</td><td class="num">${rupiah(f.qty*f.cost)}</td><td><button class="btn sm" onclick="feedForm('${f.id}')">Edit</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty">Belum ada pakan.</td></tr>`}</tbody></table></div></div>`;
}
function feedForm(fid){
 const f=db.feed.find(x=>x.id===fid)||{name:'',unit:'kg',qty:0,cost:0};
 const name=prompt('Nama pakan:',f.name);if(name===null)return;
 const unit=prompt('Satuan (kg, sak, karung, dll):',f.unit);if(unit===null)return;
 const qty=prompt('Jumlah stok:',f.qty);if(qty===null)return;
 const cost=prompt('Harga modal per satuan:',f.cost);if(cost===null)return;
 if(!name.trim())return toast('Nama wajib diisi');
 if(fid)Object.assign(f,{name:name.trim(),unit:unit.trim(),qty:num(qty),cost:num(cost)});
 else db.feed.push({id:id('feed'),name:name.trim(),unit:unit.trim(),qty:num(qty),cost:num(cost)});
 save();render();toast('Pakan disimpan');
}

function pembelian(a){
 a.innerHTML=`<div class="top"><h1>Pembelian Ikan</h1><button class="btn primary" onclick="purchaseForm()">+ Catat pembelian</button></div>
 <div class="card"><p style="color:var(--muted)">Pembelian ikan otomatis menambah stok ikan dan menjadi dasar modal/COGS rata-rata.</p>
 <div class="scroll"><table><thead><tr><th>Tanggal</th><th>Supplier</th><th>Ikan</th><th class="num">Ekor</th><th class="num">Harga/ekor</th><th class="num">Total</th></tr></thead><tbody>${db.purchases.length?[...db.purchases].reverse().map(x=>`<tr><td>${x.date}</td><td>${esc(x.supplier||'-')}</td><td>${esc(x.fish)}</td><td class="num">${x.qty}</td><td class="num">${rupiah(x.price)}</td><td class="num">${rupiah(x.total)}</td></tr>`).join(''):`<tr><td colspan="6" class="empty">Belum ada pembelian.</td></tr>`}</tbody></table></div></div>`;
}
function purchaseForm(){
 const fish=prompt('Jenis ikan:');if(fish===null)return;
 const variant=prompt('Ukuran/varian (opsional):','');if(variant===null)return;
 const qty=prompt('Jumlah ekor:','1');if(qty===null)return;
 const price=prompt('Harga modal per ekor:','0');if(price===null)return;
 const supplier=prompt('Supplier (opsional):','');if(supplier===null)return;
 const date=prompt('Tanggal YYYY-MM-DD:',dateNow());if(date===null)return;
 let f=db.fish.find(x=>x.name.toLowerCase()===fish.toLowerCase()&&x.variant===variant);
 if(!f){f={id:id('fish'),name:fish.trim(),variant:variant.trim(),qty:0,cost:num(price)};db.fish.push(f)}
 const oldQty=num(f.qty), oldVal=oldQty*num(f.cost), newQty=num(qty), newVal=newQty*num(price);
 f.qty=oldQty+newQty; f.cost=f.qty?(oldVal+newVal)/f.qty:num(price);
 const p={id:id('pur'),date,supplier: supplier.trim(),fish:fish.trim(),variant:variant.trim(),qty:newQty,price:num(price),total:newQty*num(price)};
 db.purchases.push(p);save();render();toast('Pembelian tercatat & stok bertambah');
}

function penjualan(a){
 a.innerHTML=`<div class="top"><h1>Penjualan Ikan</h1><button class="btn primary" onclick="saleForm()">+ Catat penjualan</button></div>
 <div class="card"><p style="color:var(--muted)">Penjualan otomatis mengurangi stok, menghitung HPP berdasarkan modal rata-rata, dan menghitung laba kotor.</p>
 <div class="scroll"><table><thead><tr><th>Nota</th><th>Tanggal</th><th>Pelanggan</th><th>Ikan</th><th class="num">Ekor</th><th class="num">Harga/ekor</th><th class="num">Total</th><th class="num">Laba kotor</th><th></th></tr></thead><tbody>${db.sales.length?[...db.sales].reverse().map(x=>`<tr><td>${x.invoice}</td><td>${x.date}</td><td>${esc(x.customer||'Umum')}</td><td>${esc(x.fish)}</td><td class="num">${x.qty}</td><td class="num">${rupiah(x.price)}</td><td class="num">${rupiah(x.total)}</td><td class="num ${x.profit<0?'bad':'ok'}">${rupiah(x.profit)}</td><td><button class="btn sm" onclick="printReceipt('${x.id}')">Nota</button></td></tr>`).join(''):`<tr><td colspan="9" class="empty">Belum ada penjualan.</td></tr>`}</tbody></table></div></div>`;
}
function saleForm(){
 const fish=prompt('Jenis ikan yang dijual:');if(fish===null)return;
 const variant=prompt('Ukuran/varian (opsional):','');if(variant===null)return;
 const f=db.fish.find(x=>x.name.toLowerCase()===fish.toLowerCase()&&x.variant===variant);
 if(!f)return toast('Stok ikan tidak ditemukan');
 const qty=prompt(`Jumlah ekor (stok ${f.qty}):`,'1');if(qty===null)return;
 const q=num(qty);if(q<=0||q>f.qty)return toast('Jumlah melebihi stok');
 const price=prompt('Harga jual per ekor:','0');if(price===null)return;
 const customer=prompt('Nama pelanggan (opsional):','Umum');if(customer===null)return;
 const date=prompt('Tanggal YYYY-MM-DD:',dateNow());if(date===null)return;
 const total=q*num(price),cogs=q*num(f.cost),profit=total-cogs;
 f.qty-=q;
 const s={id:id('sal'),invoice:'INV-'+new Date().getFullYear()+'-'+String(db.sales.length+1).padStart(4,'0'),date,customer:customer.trim()||'Umum',fish:f.name,variant:f.variant,qty:q,price:num(price),total,cogs,profit};
 db.sales.push(s);save();render();toast('Penjualan tercatat & stok berkurang');
 if(confirm('Penjualan tersimpan. Cetak nota sekarang?'))printReceipt(s.id);
}

function hutang(a){
 a.innerHTML=`<div class="top"><h1>Hutang-Piutang</h1><button class="btn primary" onclick="debtForm()">+ Tambah</button></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Jenis</th><th>Nama</th><th>Jatuh tempo</th><th class="num">Nominal</th><th class="num">Sisa</th><th>Status</th><th></th></tr></thead><tbody>${db.debts.length?db.debts.map(x=>`<tr><td>${x.type}</td><td>${esc(x.name)}</td><td>${x.due||'-'}</td><td class="num">${rupiah(x.amount)}</td><td class="num">${rupiah(x.remaining)}</td><td><span class="badge ${x.status==='lunas'?'ok':'bad'}">${x.status}</span></td><td><button class="btn sm" onclick="payDebt('${x.id}')">Bayar</button></td></tr>`).join(''):`<tr><td colspan="7" class="empty">Belum ada hutang/piutang.</td></tr>`}</tbody></table></div></div>`;
}
function debtForm(){
 const type=prompt('Ketik "hutang" atau "piutang":','piutang');if(type===null)return;
 if(!['hutang','piutang'].includes(type.toLowerCase()))return toast('Jenis tidak valid');
 const name=prompt('Nama pihak:');if(name===null)return;
 const amount=prompt('Nominal:','0');if(amount===null)return;
 const due=prompt('Jatuh tempo YYYY-MM-DD (opsional):','');if(due===null)return;
 db.debts.push({id:id('debt'),type:type.toLowerCase(),name:name.trim(),amount:num(amount),remaining:num(amount),due,status:'belum lunas'});
 save();render();toast('Hutang/piutang disimpan');
}
function payDebt(did){
 const d=db.debts.find(x=>x.id===did);if(!d)return;
 const p=prompt(`Pembayaran untuk ${d.name}. Sisa ${rupiah(d.remaining)}:`,'0');if(p===null)return;
 d.remaining=Math.max(0,d.remaining-num(p));d.status=d.remaining===0?'lunas':'belum lunas';save();render();toast('Pembayaran dicatat');
}

function laporan(a){
 const month=window.reportMonth||new Date().toISOString().slice(0,7), t=periodTotals(month);
 const expenses=db.expenses.filter(x=>x.date.startsWith(month));
 a.innerHTML=`<div class="top"><h1>Laporan</h1><div class="actions"><button class="btn" onclick="window.print()">Cetak laporan</button><button class="btn primary" onclick="expenseForm()">+ Biaya operasional</button></div></div>
 <div class="card section"><div class="toolbar"><div><b>Periode</b> <input type="month" value="${month}" onchange="window.reportMonth=this.value;render()"></div></div>
 <div class="grid g4"><div class="metric"><div class="label">Omzet</div><div class="value">${rupiah(t.omzet)}</div></div><div class="metric"><div class="label">HPP / COGS</div><div class="value">${rupiah(t.cogs)}</div></div><div class="metric"><div class="label">Biaya</div><div class="value">${rupiah(t.exp)}</div></div><div class="metric"><div class="label">Laba bersih</div><div class="value ${t.profit<0?'bad':'ok'}">${rupiah(t.profit)}</div></div></div></div>
 <div class="grid g2"><div class="card"><h2>Penjualan</h2><div class="scroll"><table><thead><tr><th>Tanggal</th><th>Ikan</th><th class="num">Omzet</th><th class="num">Laba</th></tr></thead><tbody>${t.sales.length?t.sales.map(x=>`<tr><td>${x.date}</td><td>${esc(x.fish)} (${x.qty})</td><td class="num">${rupiah(x.total)}</td><td class="num">${rupiah(x.profit)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Tidak ada data.</td></tr>'}</tbody></table></div></div>
 <div class="card"><h2>Biaya operasional</h2><div class="scroll"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="num">Jumlah</th></tr></thead><tbody>${expenses.length?expenses.map(x=>`<tr><td>${x.date}</td><td>${esc(x.note)}</td><td class="num">${rupiah(x.amount)}</td></tr>`).join(''):'<tr><td colspan="3" class="empty">Tidak ada biaya.</td></tr>'}</tbody></table></div></div></div>`;
}
function expenseForm(){
 const note=prompt('Keterangan biaya:');if(note===null)return;
 const amount=prompt('Jumlah biaya:','0');if(amount===null)return;
 const date=prompt('Tanggal YYYY-MM-DD:',dateNow());if(date===null)return;
 db.expenses.push({id:id('exp'),date,note:note.trim(),amount:num(amount)});save();render();toast('Biaya dicatat');
}

function pengaturan(a){
 a.innerHTML=`<div class="top"><h1>Pengaturan</h1><button class="btn primary" onclick="saveSettings()">Simpan</button></div>
 <div class="card form"><div class="field"><label>Nama usaha</label><input id="s_store" value="${esc(db.settings.store)}"></div><div class="field"><label>Alamat</label><textarea id="s_address">${esc(db.settings.address)}</textarea></div><div class="field"><label>No. telepon</label><input id="s_phone" value="${esc(db.settings.phone)}"></div><div class="field"><label>Catatan kaki nota</label><input id="s_footer" value="${esc(db.settings.footer)}"></div>
 <hr><div class="actions"><button class="btn" onclick="backup()">Backup data</button><button class="btn" onclick="restore()">Restore data</button><button class="btn danger" onclick="resetData()">Hapus semua data</button></div>
 <p style="color:var(--muted)">Data aplikasi ini tersimpan di perangkat/browser. Backup secara berkala agar data aman.</p></div>`;
}
function saveSettings(){
 db.settings.store=document.getElementById('s_store').value;db.settings.address=document.getElementById('s_address').value;db.settings.phone=document.getElementById('s_phone').value;db.settings.footer=document.getElementById('s_footer').value;save();toast('Pengaturan tersimpan');
}
function backup(){
 const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='backup-usaha-ikan-'+dateNow()+'.json';a.click();URL.revokeObjectURL(u);
}
function restore(){
 const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=()=>{const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();render();toast('Data berhasil dipulihkan')}catch(e){toast('File backup tidak valid')}};r.readAsText(i.files[0])};i.click();
}
function resetData(){if(confirm('Yakin menghapus seluruh data? Backup dulu jika diperlukan.')){db=seed();render();toast('Data dihapus')}}
function printReceipt(sid){
 const s=db.sales.find(x=>x.id===sid);if(!s)return;
 const w=window.open('','_blank','width=420,height=650');if(!w)return toast('Izinkan pop-up untuk mencetak nota');
 w.document.write(`<!doctype html><html><head><title>${s.invoice}</title><style>body{font:13px monospace;width:72mm;margin:0 auto;padding:8px}h2{text-align:center;font-size:16px;margin:4px 0}p{margin:3px 0}hr{border:0;border-top:1px dashed #000}.r{display:flex;justify-content:space-between}.center{text-align:center}</style></head><body>
 <h2>${esc(db.settings.store)}</h2><div class="center">${esc(db.settings.address)}<br>${esc(db.settings.phone)}</div><hr>
 <p>No: ${s.invoice}</p><p>Tanggal: ${s.date}</p><p>Pelanggan: ${esc(s.customer)}</p><hr>
 <div class="r"><span>${esc(s.fish)} x ${s.qty}</span><span>${rupiah(s.total)}</span></div>
 <div class="r"><span>Harga/ekor</span><span>${rupiah(s.price)}</span></div><hr>
 <div class="r"><b>TOTAL</b><b>${rupiah(s.total)}</b></div><p class="center">${esc(db.settings.footer)}</p><script>window.onload=()=>window.print()<\/script></body></html>`);
 w.document.close();
}
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
