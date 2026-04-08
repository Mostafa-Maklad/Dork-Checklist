// popup.js — Recon Dork Checklist v2 Extension

// ============================================================
// ENGINE DEFINITIONS
// ============================================================
const ENG = {
  Google:     q => `https://www.google.com/search?q=${enc(q)}`,
  Bing:       q => `https://www.bing.com/search?q=${enc(q)}`,
  Yandex:     q => `https://yandex.com/search/?text=${enc(q)}`,
  DuckDuckGo: q => `https://duckduckgo.com/?q=${enc(q)}`,
  Shodan:     q => `https://www.shodan.io/search?query=${enc(q)}`,
  GitHub:     q => `https://github.com/search?q=${enc(q)}&type=code`,
  Censys:     q => `https://search.censys.io/search?resource=hosts&q=${enc(q)}`,
};
const EC = {
  Google:     { bg:'rgba(66,133,244,.18)', text:'#6aadff', bd:'rgba(66,133,244,.45)' },
  Bing:       { bg:'rgba(0,164,239,.18)',  text:'#4ecdf0', bd:'rgba(0,164,239,.45)' },
  Yandex:     { bg:'rgba(255,62,0,.14)',   text:'#ff8065', bd:'rgba(255,62,0,.38)' },
  DuckDuckGo: { bg:'rgba(222,88,51,.14)',  text:'#ff9a80', bd:'rgba(222,88,51,.38)' },
  Shodan:     { bg:'rgba(255,107,53,.14)', text:'#ff9e6a', bd:'rgba(255,107,53,.38)' },
  GitHub:     { bg:'rgba(139,148,158,.14)',text:'#b0bec5', bd:'rgba(139,148,158,.38)' },
  Censys:     { bg:'rgba(124,77,255,.14)', text:'#b39dff', bd:'rgba(124,77,255,.38)' },
};
function enc(s){ return encodeURIComponent(s); }

// ============================================================
// DEFAULT DORK DATA
// ============================================================
const CATS = [
  { id:'ef', emoji:'📁', name:'Exposed Files & Docs',
    tip:'HackerOne hunters found confidential docs on S3 via these. DoD disclosures confirmed.',
    engines:['Google','Bing','Yandex','DuckDuckGo'],
    dorks:[
      {id:'ef1',name:'Config/Env files',query:'site:{target} ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:git | ext:svn | ext:htpasswd | ext:htaccess | ext:json',priority:'high'},
      {id:'ef2',name:'Office docs (Word/PPT/XLS/PDF)',query:'site:{target} ext:doc | ext:docx | ext:pdf | ext:odt | ext:rtf | ext:ppt | ext:pptx | ext:pps | ext:csv | ext:xls | ext:xlsx',priority:'med'},
      {id:'ef3',name:'Confidential / internal labels',query:'site:{target} intitle:"confidential" | intitle:"internal use only" | intitle:"do not share" | intitle:"restricted"',priority:'high'},
      {id:'ef4',name:'S3 buckets – confidential/top secret',query:'site:s3.amazonaws.com "{target}" confidential | "top secret" | classified | undisclosed',priority:'high'},
      {id:'ef5',name:'NDA & contract docs',query:'site:{target} filetype:pdf intitle:"nda" | intitle:"non-disclosure" | intitle:"agreement" | intitle:"contract"',priority:'high'},
      {id:'ef6',name:'Exposed Excel spreadsheets',query:'site:{target} filetype:xls | filetype:xlsx intext:"password" | intext:"username" | intext:"confidential"',priority:'med'},
      {id:'ef7',name:'Open directory listings',query:'site:{target} intitle:"index of" inurl:/ "parent directory"',priority:'high'},
      {id:'ef8',name:'XML / WSDL service files',query:'site:{target} ext:xml | ext:wsdl | ext:wadl',priority:'med'},
      {id:'ef9',name:'Database dump files',query:'site:{target} ext:sql | ext:db | ext:dump | ext:sqlite',priority:'high'},
      {id:'ef10',name:'Exposed log files',query:'site:{target} ext:log intext:"error" | intext:"exception" | intext:"username"',priority:'high'},
    ]
  },
  { id:'cr', emoji:'🔑', name:'Credentials & Secrets',
    tip:'Hardcoded API keys in GitHub repos and .env files. Highest-value category on HackerOne.',
    engines:['Google','GitHub','Bing'],
    dorks:[
      {id:'cr1',name:'Password files',query:'site:{target} intext:"password" filetype:txt | filetype:log | filetype:env',priority:'high'},
      {id:'cr2',name:'.env files with DB creds',query:'site:{target} filetype:env intext:"DB_PASSWORD" | intext:"DB_USER" | intext:"APP_SECRET"',priority:'high'},
      {id:'cr3',name:'API keys / tokens in JSON',query:'site:{target} filetype:json intext:"api_key" | intext:"access_token" | intext:"secret_key" | intext:"client_secret"',priority:'high'},
      {id:'cr4',name:'GitHub: API keys for target',query:'"{target}" "api_key" | "apikey" | "api_secret" | "access_token" | "secret_key"',priority:'high'},
      {id:'cr5',name:'GitHub: .env committed',query:'"{target}" filename:.env "DB_PASSWORD" | "SECRET" | "API_KEY"',priority:'high'},
      {id:'cr6',name:'GitHub: AWS keys',query:'"{target}" "AKIA" "aws_access_key_id"',priority:'high'},
      {id:'cr7',name:'Exposed htpasswd',query:'site:{target} inurl:".htpasswd" | intext:"htpasswd"',priority:'high'},
      {id:'cr8',name:'Connection strings',query:'site:{target} intext:"connectionString" | intext:"jdbc:mysql" | intext:"mongodb://" | intext:"postgres://"',priority:'high'},
      {id:'cr9',name:'FTP credentials',query:'site:{target} intext:"ftp://" intext:"password"',priority:'med'},
      {id:'cr10',name:'SSH private keys',query:'"{target}" "BEGIN RSA PRIVATE KEY" | "BEGIN OPENSSH PRIVATE KEY"',priority:'high'},
    ]
  },
  { id:'ap', emoji:'🖥️', name:'Admin Panels & Login Pages',
    tip:'Admin panels with default credentials are consistently rewarded. Check non-standard ports.',
    engines:['Google','Bing','Yandex'],
    dorks:[
      {id:'ap1',name:'Generic admin login pages',query:'site:{target} inurl:"admin" | inurl:"login" | inurl:"wp-admin" | inurl:"administrator"',priority:'high'},
      {id:'ap2',name:'phpMyAdmin',query:'site:{target} inurl:"phpmyadmin" | intitle:"phpMyAdmin"',priority:'high'},
      {id:'ap3',name:'WordPress admin',query:'site:{target} inurl:"wp-admin" | inurl:"wp-login"',priority:'med'},
      {id:'ap4',name:'cPanel / WHM',query:'site:{target} inurl:":2082" | inurl:":2083" | inurl:":2086" | intitle:"cPanel"',priority:'high'},
      {id:'ap5',name:'Jenkins CI',query:'site:{target} intitle:"Dashboard [Jenkins]" | inurl:"jenkins"',priority:'high'},
      {id:'ap6',name:'Grafana dashboard',query:'site:{target} intitle:"Grafana" | inurl:"grafana"',priority:'med'},
      {id:'ap7',name:'Kibana panel',query:'site:{target} intitle:"Kibana" | inurl:"app/kibana"',priority:'med'},
      {id:'ap8',name:'Jira / Confluence',query:'site:{target} inurl:"jira" | inurl:"confluence" | intitle:"Jira"',priority:'med'},
      {id:'ap9',name:'Laravel / Framework debug',query:'site:{target} intext:"Whoops! There was an error." | intitle:"Whoops!"',priority:'high'},
    ]
  },
  { id:'db', emoji:'🗄️', name:'Exposed Databases',
    tip:'MongoDB on 27017 and Elasticsearch on 9200 are frequently found open to the internet.',
    engines:['Shodan','Censys','Google'],
    dorks:[
      {id:'db1',name:'Open MongoDB',query:'site:{target} inurl:"27017" | "mongodb" port:27017',priority:'high'},
      {id:'db2',name:'Elasticsearch open',query:'site:{target} inurl:"9200/_cat" | intitle:"Elasticsearch"',priority:'high'},
      {id:'db3',name:'Redis exposed',query:'{target} port:6379 "redis_version"',priority:'high'},
      {id:'db4',name:'MySQL exposed',query:'{target} port:3306 product:"MySQL"',priority:'high'},
      {id:'db5',name:'CouchDB admin',query:'site:{target} inurl:"/_utils/" intitle:"CouchDB"',priority:'high'},
      {id:'db6',name:'Firebase database exposed',query:'site:{target} inurl:".firebaseio.com" | "{target}.firebaseio.com"',priority:'high'},
    ]
  },
  { id:'er', emoji:'🐛', name:'Error Messages & Debug',
    tip:'Stack traces expose internal paths, tech stack, and sometimes credentials.',
    engines:['Google','Bing'],
    dorks:[
      {id:'er1',name:'SQL error messages',query:'site:{target} intext:"sql syntax" | intext:"mysql_fetch" | intext:"ORA-01"',priority:'high'},
      {id:'er2',name:'Stack traces / exceptions',query:'site:{target} intext:"stack trace" | intext:"at java.lang" | intext:"Traceback (most recent"',priority:'high'},
      {id:'er3',name:'PHP errors exposed',query:'site:{target} "PHP Parse error" | "PHP Warning" | "PHP Fatal error"',priority:'med'},
      {id:'er4',name:'ASP.NET debug mode',query:'site:{target} intext:"Server Error in" | intitle:"Runtime Error"',priority:'high'},
      {id:'er5',name:'Django debug page',query:'site:{target} intitle:"DisallowedHost" | intitle:"Page not found" intext:"Django"',priority:'high'},
    ]
  },
  { id:'cl', emoji:'☁️', name:'Cloud & Storage',
    tip:'S3, Azure, and GCP buckets are frequently left open. Critical severity findings.',
    engines:['Google','Bing'],
    dorks:[
      {id:'cl1',name:'Open S3 buckets',query:'site:s3.amazonaws.com "{target}" | site:{target}.s3.amazonaws.com',priority:'high'},
      {id:'cl2',name:'Azure blob storage',query:'site:blob.core.windows.net "{target}"',priority:'high'},
      {id:'cl3',name:'GCP storage bucket',query:'site:storage.googleapis.com "{target}"',priority:'high'},
      {id:'cl4',name:'Firebase database',query:'site:{target} inurl:".firebaseio.com"',priority:'high'},
      {id:'cl5',name:'Exposed Docker registry',query:'site:{target} inurl:"/v2/" "Docker-Distribution-Api-Version"',priority:'high'},
      {id:'cl6',name:'Kubernetes dashboard',query:'site:{target} intitle:"Kubernetes Dashboard" | inurl:"kubernetes-dashboard"',priority:'high'},
    ]
  },
  { id:'sp', emoji:'🔎', name:'Sensitive Params & Endpoints',
    tip:'Parameters in URLs expose hidden functionality — auth tokens, debug flags, internal APIs.',
    engines:['Google','Bing'],
    dorks:[
      {id:'sp1',name:'Password / token in URL',query:'site:{target} inurl:"password=" | inurl:"passwd=" | inurl:"token=" | inurl:"api_key="',priority:'high'},
      {id:'sp2',name:'Session ID in URL',query:'site:{target} inurl:"sessionid=" | inurl:"session_id=" | inurl:"PHPSESSID="',priority:'high'},
      {id:'sp3',name:'Debug / test / staging',query:'site:{target} inurl:"debug" | inurl:"test" | inurl:"dev" | inurl:"staging"',priority:'med'},
      {id:'sp4',name:'Internal IP exposed',query:'site:{target} intext:"192.168." | intext:"10.0." | intext:"172.16."',priority:'high'},
      {id:'sp5',name:'Backup file extensions',query:'site:{target} ext:bak | ext:old | ext:orig | ext:backup | ext:~',priority:'high'},
      {id:'sp6',name:'Exposed API docs (Swagger)',query:'site:{target} inurl:"swagger" | inurl:"api-docs" | intitle:"API Reference"',priority:'med'},
      {id:'sp7',name:'File upload endpoints',query:'site:{target} inurl:"upload" | inurl:"fileupload" | inurl:"upload.php"',priority:'high'},
    ]
  },
];

// ============================================================
// STATE
// ============================================================
let S = {
  domain:'', globalBrowser:'Google', catBrowsers:{},
  filter:'', pf:null,
  checked:{}, notes:{}, priorities:{},
  history:[], customCats:[], customDorks:[],
  collapsed:{}, allCol:false, theme:'dark',
};

// Use chrome.storage.local for extension
function loadState(cb){
  chrome.storage.local.get(['recon_dork_v2'], res => {
    if(res.recon_dork_v2) S = {...S, ...res.recon_dork_v2};
    cb();
  });
}
function saveS(){
  chrome.storage.local.set({ recon_dork_v2: S });
}

// ============================================================
// HELPERS
// ============================================================
function allCats(){ return [...CATS, ...S.customCats]; }
function getDorks(catId){
  const base = CATS.find(c=>c.id===catId);
  return [...(base?base.dorks:[]), ...S.customDorks.filter(d=>d.catId===catId)];
}
function bldQ(q, dom){ return dom ? q.replace(/\{target\}/g, dom) : q; }
function bldUrl(q, eng){ return (ENG[eng]||ENG.Google)(q); }
function getPrio(id){
  if(S.priorities[id]) return S.priorities[id];
  for(const c of allCats()){ const d=getDorks(c.id).find(x=>x.id===id); if(d&&d.priority) return d.priority; }
  return 'med';
}
function getCatBrowser(catId){ return S.catBrowsers[catId] || S.globalBrowser; }
function totalDorks(){ return allCats().reduce((s,c)=>s+getDorks(c.id).length, 0); }
function totalChecked(){ return Object.values(S.checked).filter(Boolean).length; }
function uid(){ return 'c'+Date.now()+Math.random().toString(36).substr(2,5); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function openTab(url){
  chrome.runtime.sendMessage({ action:'openTab', url });
}

function toast(msg, type='teal'){
  const w = document.getElementById('toasts');
  const t = document.createElement('div'); t.className='toast';
  const clr = type==='red'?'var(--red)':type==='yellow'?'var(--yellow)':'var(--teal)';
  t.style.borderColor=clr; t.style.color=clr; t.textContent=msg;
  w.appendChild(t); setTimeout(()=>t.remove(), 3100);
}

function copyText(text, msg='Copied!'){
  navigator.clipboard.writeText(text).then(()=>toast(msg)).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=text;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(msg);
  });
}

// ============================================================
// RENDER
// ============================================================
function renderStats(){
  const tot=totalDorks(), chk=totalChecked();
  const pct=tot?Math.round(chk/tot*100):0;
  document.getElementById('prog-txt').textContent=`${chk}/${tot} (${pct}%)`;
  document.getElementById('prog-fill').style.width=pct+'%';
  const allD=allCats().flatMap(c=>getDorks(c.id));
  const highTot=allD.filter(d=>getPrio(d.id)==='high').length;
  const highChk=allD.filter(d=>getPrio(d.id)==='high'&&S.checked[d.id]).length;
  document.getElementById('stats-row').innerHTML=`
    <div class="stat"><div class="stat-v">${tot}</div><div class="stat-l">Total</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--teal)">${chk}</div><div class="stat-l">Run</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--red)">${highTot}</div><div class="stat-l">High</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--green)">${highChk}</div><div class="stat-l">High Done</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--yellow)">${S.history.length}</div><div class="stat-l">History</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--purple)">${S.customDorks.length+S.customCats.length}</div><div class="stat-l">Custom</div></div>
  `;
}

function renderCats(){
  const container=document.getElementById('cats-container');
  const filt=S.filter.toLowerCase();
  let html='';
  for(const cat of allCats()){
    let dorks=getDorks(cat.id);
    if(filt) dorks=dorks.filter(d=>d.name.toLowerCase().includes(filt)||d.query.toLowerCase().includes(filt));
    if(S.pf) dorks=dorks.filter(d=>getPrio(d.id)===S.pf);
    if(filt&&dorks.length===0) continue;

    const totD=getDorks(cat.id).length;
    const chkD=getDorks(cat.id).filter(d=>S.checked[d.id]).length;
    const pct=totD?Math.round(chkD/totD*100):0;
    const col=S.collapsed[cat.id];
    const cb=getCatBrowser(cat.id);
    const isCC=!CATS.find(c=>c.id===cat.id);
    const engines=cat.engines||['Google','Bing'];

    html+=`<div class="cat-card" id="cc-${cat.id}">`;
    html+=`<div class="cat-hdr" data-ci="${cat.id}">
      <span class="cat-em">${cat.emoji||'📂'}</span>
      <span class="cat-nm">${esc(cat.name)}</span>
      <div class="eng-badges">
        ${engines.map(e=>`<span class="eng-badge" style="background:${EC[e]?.bg};color:${EC[e]?.text};border-color:${EC[e]?.bd}"
          onclick="setCatBr('${cat.id}','${e}');event.stopPropagation()" title="${e}">${e}</span>`).join('')}
      </div>
      <div onclick="event.stopPropagation()" style="display:flex;align-items:center">
        <select class="cat-bsel" data-ci="${cat.id}" onchange="setCatBr('${cat.id}',this.value)">
          ${Object.keys(ENG).map(e=>`<option${cb===e?' selected':''}>${e}</option>`).join('')}
        </select>
      </div>
      <span class="cat-cnt">${chkD}/${totD}</span>
      ${isCC?`<button class="btn btn-ic btn-sm btn-d" onclick="delCat('${cat.id}');event.stopPropagation()" title="Delete">🗑️</button>`:''}
      <span class="cat-arr${col?'':' open'}">▼</span>
    </div>`;

    if(!col){
      html+=`<div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div>`;
      if(cat.tip) html+=`<div class="cat-tip">${esc(cat.tip)}</div>`;
      html+=`<div class="cat-acts">
        <button class="btn btn-sm" onclick="checkAllCat('${cat.id}',true)">✅ All</button>
        <button class="btn btn-sm" onclick="checkAllCat('${cat.id}',false)">☐ None</button>
        <button class="btn btn-sm" onclick="copyAllCat('${cat.id}')">📋 Copy</button>
        <button class="btn btn-sm btn-t" onclick="openAddDorkModal('${cat.id}')">➕</button>
        <span style="flex:1"></span><span style="font-size:9px;color:var(--text3);font-family:var(--mono)">${pct}%</span>
      </div>`;
      html+=`<div class="dork-list">`;
      if(!dorks.length) html+=`<div class="no-res">No dorks match filter.</div>`;
      for(const d of dorks){
        const isChk=S.checked[d.id], pr=getPrio(d.id), note=S.notes[d.id]||'';
        const hasNote=note.trim().length>0;
        const isCD=!!S.customDorks.find(x=>x.id===d.id);
        const runCnt=S.history.filter(h=>h.dorkId===d.id).length;
        const dispQ=esc(bldQ(d.query,S.domain));
        html+=`<div class="dork-item${isChk?' done':''}" id="di-${d.id}">
          <div class="d-top">
            <input type="checkbox" class="d-cb"${isChk?' checked':''} onchange="toggleChk('${d.id}')">
            <div class="d-main">
              <div class="d-nm-row">
                <span class="dork-nm">${esc(d.name)}</span>
                <span class="prio ${pr}" onclick="cyclePrio('${d.id}');event.stopPropagation()">${pr.toUpperCase()}</span>
                ${isCD?'<span class="custom-tag">CUSTOM</span>':''}
                ${hasNote?'<span class="note-dot" title="Has note"></span>':''}
                ${runCnt>0?`<span class="run-c">×${runCnt}</span>`:''}
              </div>
              <div class="dork-q">${dispQ}</div>
            </div>
            <div class="d-acts">
              <button class="btn btn-ic" onclick="copyDork('${d.id}')" title="Copy">📋</button>
              <button class="btn btn-ic btn-t" onclick="openDork('${d.id}')" title="Open in ${cb}">🔗</button>
              <button class="btn btn-ic" onclick="toggleNote('${d.id}')" style="color:var(--yellow)" title="Note">📝</button>
              ${isCD?`<button class="btn btn-ic btn-d" onclick="delDork('${d.id}')" title="Delete">🗑️</button>`:''}
            </div>
          </div>
          <div class="note-area" id="na-${d.id}" style="display:${hasNote?'block':'none'}">
            <textarea class="notes-in" placeholder="Notes..." oninput="saveNote('${d.id}',this.value)">${esc(note)}</textarea>
          </div>
        </div>`;
      }
      html+=`</div>`;
    }
    html+=`</div>`;
  }
  if(!html) html=`<div class="no-res" style="padding:30px">No results.</div>`;
  container.innerHTML=html;
  // Re-bind cat header clicks
  document.querySelectorAll('.cat-hdr').forEach(el=>{
    el.addEventListener('click',()=>{
      const ci=el.dataset.ci;
      S.collapsed[ci]=!S.collapsed[ci];
      saveS(); renderCats();
    });
  });
  renderStats();
}

function refreshDorkItem(id){
  const el=document.getElementById('di-'+id); if(!el) return;
  const isChk=S.checked[id], pr=getPrio(id), note=S.notes[id]||'';
  el.classList.toggle('done',isChk);
  const cb=el.querySelector('.d-cb'); if(cb) cb.checked=isChk;
  const pEl=el.querySelector('.prio');
  if(pEl){ pEl.className=`prio ${pr}`; pEl.textContent=pr.toUpperCase(); }
}

// ============================================================
// ACTIONS
// ============================================================
function toggleChk(id){ S.checked[id]=!S.checked[id]; saveS(); refreshDorkItem(id); renderStats(); }

function openDork(id){
  let dork=null, catId=null;
  for(const c of allCats()){ const d=getDorks(c.id).find(x=>x.id===id); if(d){dork=d;catId=c.id;break;} }
  if(!dork) return;
  const browser=getCatBrowser(catId);
  const q=bldQ(dork.query, S.domain.trim());
  const url=bldUrl(q, browser);
  openTab(url);
  if(!S.checked[id]){ S.checked[id]=true; refreshDorkItem(id); }
  S.history.unshift({id:uid(),dorkId:id,dorkName:dork.name,browser,url,domain:S.domain||'{target}',ts:Date.now()});
  if(S.history.length>200) S.history=S.history.slice(0,200);
  saveS(); renderStats(); toast(`Opened in ${browser}`);
}

function copyDork(id){
  let dork=null;
  for(const c of allCats()){ const d=getDorks(c.id).find(x=>x.id===id); if(d){dork=d;break;} }
  if(!dork) return;
  copyText(bldQ(dork.query, S.domain));
}

function toggleNote(id){
  const el=document.getElementById('na-'+id);
  if(el){ el.style.display=el.style.display==='none'?'block':'none'; if(el.style.display==='block') el.querySelector('textarea').focus(); }
}

function saveNote(id,val){ S.notes[id]=val; saveS(); }

function cyclePrio(id){
  const cur=getPrio(id), nxt={high:'med',med:'low',low:'high'}[cur]||'high';
  S.priorities[id]=nxt; saveS(); refreshDorkItem(id);
}

function checkAllCat(catId,val){ getDorks(catId).forEach(d=>{S.checked[d.id]=val;}); saveS(); renderCats(); }

function copyAllCat(catId){
  const txt=getDorks(catId).map(d=>`# ${d.name}\n${bldQ(d.query,S.domain)}`).join('\n\n');
  copyText(txt,'All queries copied!');
}

function setCatBr(catId,eng){ S.catBrowsers[catId]=eng; saveS(); toast(`${eng} set`); }

function delCat(catId){
  if(!confirm('Delete this category?')) return;
  S.customCats=S.customCats.filter(c=>c.id!==catId);
  S.customDorks=S.customDorks.filter(d=>d.catId!==catId);
  saveS(); renderCats(); toast('Deleted','red');
}

function delDork(id){
  S.customDorks=S.customDorks.filter(d=>d.id!==id);
  saveS(); renderCats(); toast('Deleted','red');
}

// ============================================================
// ADD DORK MODAL
// ============================================================
function openAddDorkModal(catId=null){
  const sel=document.getElementById('nd-cat');
  sel.innerHTML=allCats().map(c=>`<option value="${c.id}"${c.id===catId?' selected':''}>${c.emoji||''} ${c.name}</option>`).join('');
  ['nd-name','nd-query','nd-notes'].forEach(id=>document.getElementById(id).value='');
  document.querySelectorAll('#modal-dork .po').forEach(el=>el.classList.toggle('on',el.dataset.p==='med'));
  document.getElementById('modal-dork').classList.remove('hidden');
  document.getElementById('nd-name').focus();
}
function closeAddDork(){ document.getElementById('modal-dork').classList.add('hidden'); }
function saveNewDork(){
  const name=document.getElementById('nd-name').value.trim();
  const query=document.getElementById('nd-query').value.trim();
  const catId=document.getElementById('nd-cat').value;
  const notes=document.getElementById('nd-notes').value.trim();
  const po=document.querySelector('#modal-dork .po.on');
  const priority=po?po.dataset.p:'med';
  if(!name||!query){ toast('Name and query required!','red'); return; }
  const nd={id:uid(),catId,name,query,priority};
  S.customDorks.push(nd);
  if(notes) S.notes[nd.id]=notes;
  saveS(); closeAddDork(); renderCats(); toast('Dork added! ✅');
}

// ============================================================
// ADD CATEGORY MODAL
// ============================================================
function openAddCatModal(){
  ['nc-name','nc-tip'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('nc-emoji').value='';
  const eng=document.getElementById('nc-engines');
  eng.innerHTML=Object.keys(ENG).map(e=>{
    const c=EC[e]||EC.Google;
    return `<label class="eng-chk-lbl" style="color:${c.text};border-color:${c.bd};background:${c.bg}">
      <input type="checkbox" value="${e}" checked style="accent-color:${c.text}"> ${e}
    </label>`;
  }).join('');
  document.getElementById('modal-cat').classList.remove('hidden');
  document.getElementById('nc-name').focus();
}
function closeAddCat(){ document.getElementById('modal-cat').classList.add('hidden'); }
function saveNewCat(){
  const name=document.getElementById('nc-name').value.trim();
  const emoji=document.getElementById('nc-emoji').value.trim()||'📂';
  const tip=document.getElementById('nc-tip').value.trim();
  const engines=[...document.querySelectorAll('#nc-engines input:checked')].map(el=>el.value);
  if(!name){ toast('Name required!','red'); return; }
  S.customCats.push({id:uid(),name,emoji,tip,engines,dorks:[]});
  saveS(); closeAddCat(); renderCats(); toast('Category added! ✅');
}

// ============================================================
// EXPORT / IMPORT
// ============================================================
function openExport(){
  const data={version:'2.0',exportDate:new Date().toISOString(),state:{
    checked:S.checked,notes:S.notes,priorities:S.priorities,
    history:S.history,customCats:S.customCats,customDorks:S.customDorks,catBrowsers:S.catBrowsers
  }};
  document.getElementById('exp-ta').value=JSON.stringify(data,null,2);
  document.getElementById('exp-sec').classList.remove('hidden');
  document.getElementById('imp-sec').classList.add('hidden');
  document.getElementById('exp-title').textContent='📤 Export';
  const btn=document.getElementById('do-exp');
  btn.textContent='📋 Copy';
  btn.onclick=()=>copyText(document.getElementById('exp-ta').value,'Copied!');
  document.getElementById('modal-exp').classList.remove('hidden');
}

function openImport(){
  document.getElementById('imp-ta').value='';
  document.getElementById('exp-sec').classList.add('hidden');
  document.getElementById('imp-sec').classList.remove('hidden');
  document.getElementById('exp-title').textContent='📥 Import';
  const btn=document.getElementById('do-exp');
  btn.textContent='📥 Import';
  btn.onclick=doImport;
  document.getElementById('modal-exp').classList.remove('hidden');
}

function doImport(){
  try{
    const d=JSON.parse(document.getElementById('imp-ta').value.trim());
    if(!d.version||!d.state) throw new Error('Invalid');
    const s=d.state;
    if(s.checked) Object.assign(S.checked,s.checked);
    if(s.notes) Object.assign(S.notes,s.notes);
    if(s.priorities) Object.assign(S.priorities,s.priorities);
    if(s.catBrowsers) Object.assign(S.catBrowsers,s.catBrowsers);
    if(s.history) S.history=[...(s.history||[]),...S.history].slice(0,200);
    if(s.customCats) s.customCats.forEach(c=>{if(!S.customCats.find(x=>x.id===c.id)) S.customCats.push(c);});
    if(s.customDorks) s.customDorks.forEach(d=>{if(!S.customDorks.find(x=>x.id===d.id)) S.customDorks.push(d);});
    saveS(); closeExp(); renderCats(); toast('Imported! ✅');
  }catch(e){ toast('Invalid JSON!','red'); }
}
function closeExp(){ document.getElementById('modal-exp').classList.add('hidden'); }

// ============================================================
// HISTORY
// ============================================================
function openHistory(){ renderHistList(); document.getElementById('modal-hist').classList.remove('hidden'); }
function renderHistList(){
  const el=document.getElementById('hist-list');
  if(!S.history.length){ el.innerHTML='<div class="no-res">No history yet.</div>'; return; }
  el.innerHTML=S.history.slice(0,80).map(h=>{
    const c=EC[h.browser]||EC.Google, d=new Date(h.ts);
    return `<div class="h-item">
      <div style="flex:1">
        <div class="h-nm">${esc(h.dorkName||'?')}</div>
        <div class="h-meta">🎯 ${esc(h.domain)} · <span class="h-eng" style="background:${c.bg};color:${c.text}">${h.browser}</span> · ${d.toLocaleString()}</div>
      </div>
      <button class="btn btn-ic btn-sm btn-t" onclick="openTab('${h.url.replace(/'/g,"\\'")}')" title="Re-open">🔗</button>
    </div>`;
  }).join('');
}
function closeHistory(){ document.getElementById('modal-hist').classList.add('hidden'); }

// ============================================================
// INIT
// ============================================================
function init(){
  // Global browser select
  const gbSel=document.getElementById('gb-sel');
  gbSel.innerHTML=Object.keys(ENG).map(e=>`<option${S.globalBrowser===e?' selected':''}>${e}</option>`).join('');
  gbSel.addEventListener('change',()=>{S.globalBrowser=gbSel.value;saveS();toast(`Global: ${S.globalBrowser}`);});

  // Domain
  const domIn=document.getElementById('domain-in');
  domIn.value=S.domain;
  domIn.addEventListener('input',()=>{S.domain=domIn.value.trim();saveS();renderCats();});

  // Filter
  const filtIn=document.getElementById('filter-in');
  filtIn.value=S.filter;
  filtIn.addEventListener('input',()=>{S.filter=filtIn.value;renderCats();});

  // Priority filters
  document.querySelectorAll('.pf').forEach(btn=>{
    if(S.pf===btn.dataset.pf) btn.classList.add('on');
    btn.addEventListener('click',()=>{
      const pf=btn.dataset.pf;
      S.pf=S.pf===pf?null:pf;
      document.querySelectorAll('.pf').forEach(b=>b.classList.remove('on'));
      if(S.pf) btn.classList.add('on');
      renderCats();
    });
  });

  // Footer buttons
  document.getElementById('btn-reset').addEventListener('click',()=>{
    if(!confirm('Reset all progress?')) return;
    S.checked={};saveS();renderCats();toast('Progress reset!','yellow');
  });
  document.getElementById('btn-collapse').addEventListener('click',()=>{
    S.allCol=!S.allCol;
    allCats().forEach(c=>{S.collapsed[c.id]=S.allCol;});
    document.getElementById('btn-collapse').textContent=S.allCol?'⊞ Expand':'⊟ Collapse';
    saveS();renderCats();
  });

  // Theme
  document.getElementById('btn-theme').addEventListener('click',()=>{
    S.theme=S.theme==='dark'?'soft':'dark';
    document.body.classList.toggle('soft',S.theme==='soft');
    document.getElementById('btn-theme').textContent=S.theme==='soft'?'☀️':'🌙';
    saveS();
  });
  if(S.theme==='soft'){ document.body.classList.add('soft'); document.getElementById('btn-theme').textContent='☀️'; }

  // Header buttons
  document.getElementById('btn-history').addEventListener('click',openHistory);
  document.getElementById('btn-export').addEventListener('click',openExport);
  document.getElementById('btn-import').addEventListener('click',openImport);
  document.getElementById('btn-add-dork').addEventListener('click',()=>openAddDorkModal());
  document.getElementById('btn-add-cat').addEventListener('click',openAddCatModal);

  // Modal buttons
  document.getElementById('x-dork').addEventListener('click',closeAddDork);
  document.getElementById('cn-dork').addEventListener('click',closeAddDork);
  document.getElementById('sv-dork').addEventListener('click',saveNewDork);
  document.getElementById('x-cat').addEventListener('click',closeAddCat);
  document.getElementById('cn-cat').addEventListener('click',closeAddCat);
  document.getElementById('sv-cat').addEventListener('click',saveNewCat);
  document.getElementById('x-exp').addEventListener('click',closeExp);
  document.getElementById('cn-exp').addEventListener('click',closeExp);
  document.getElementById('x-hist').addEventListener('click',closeHistory);
  document.getElementById('cn-hist').addEventListener('click',closeHistory);
  document.getElementById('clr-hist').addEventListener('click',()=>{
    if(!confirm('Clear history?')) return;
    S.history=[];saveS();renderHistList();renderStats();toast('Cleared','yellow');
  });

  // Priority opts in add dork modal
  document.querySelectorAll('#modal-dork .po').forEach(el=>{
    el.addEventListener('click',()=>{
      document.querySelectorAll('#modal-dork .po').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
    });
  });

  // Close on backdrop
  ['modal-dork','modal-cat','modal-exp','modal-hist'].forEach(id=>{
    document.getElementById(id).addEventListener('click',e=>{
      if(e.target===e.currentTarget) document.getElementById(id).classList.add('hidden');
    });
  });

  renderCats();
}

// Expose functions used in inline HTML handlers
window.toggleChk=toggleChk; window.openDork=openDork; window.copyDork=copyDork;
window.toggleNote=toggleNote; window.saveNote=saveNote; window.cyclePrio=cyclePrio;
window.checkAllCat=checkAllCat; window.copyAllCat=copyAllCat; window.setCatBr=setCatBr;
window.delCat=delCat; window.delDork=delDork; window.openAddDorkModal=openAddDorkModal;
window.openTab=openTab;

document.addEventListener('DOMContentLoaded', ()=>loadState(init));
