'use strict';
// ============================================================
// ENGINES
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
  Google:     {bg:'rgba(66,133,244,.18)', text:'#6aadff', bd:'rgba(66,133,244,.45)'},
  Bing:       {bg:'rgba(0,164,239,.18)',  text:'#4ecdf0', bd:'rgba(0,164,239,.45)'},
  Yandex:     {bg:'rgba(255,62,0,.14)',   text:'#ff8065', bd:'rgba(255,62,0,.38)'},
  DuckDuckGo: {bg:'rgba(222,88,51,.14)', text:'#ff9a80', bd:'rgba(222,88,51,.38)'},
  Shodan:     {bg:'rgba(255,107,53,.14)',text:'#ff9e6a', bd:'rgba(255,107,53,.38)'},
  GitHub:     {bg:'rgba(139,148,158,.14)',text:'#b0bec5',bd:'rgba(139,148,158,.38)'},
  Censys:     {bg:'rgba(124,77,255,.14)',text:'#b39dff', bd:'rgba(124,77,255,.38)'},
};
function enc(s){ return encodeURIComponent(s); }

// ============================================================
// DORK DATA
// ============================================================
const CATS = [
  {id:'ef',emoji:'📁',name:'Exposed Files & Docs',
   tip:'HackerOne hunters found confidential docs on S3 via these. DoD disclosures confirmed.',
   engines:['Google','Bing','Yandex','DuckDuckGo'],
   dorks:[
    {id:'ef1',name:'Config/Env files',query:'site:{target} ext:log | ext:txt | ext:conf | ext:cnf | ext:ini | ext:env | ext:sh | ext:bak | ext:backup | ext:swp | ext:old | ext:git | ext:svn | ext:htpasswd | ext:htaccess | ext:json',priority:'high'},
    {id:'ef2',name:'Office docs',query:'site:{target} ext:doc | ext:docx | ext:pdf | ext:odt | ext:rtf | ext:ppt | ext:pptx | ext:pps | ext:csv | ext:xls | ext:xlsx',priority:'med'},
    {id:'ef3',name:'Confidential / internal labels',query:'site:{target} intitle:"confidential" | intitle:"internal use only" | intitle:"do not share" | intitle:"restricted"',priority:'high'},
    {id:'ef4',name:'S3 buckets – top secret',query:'site:s3.amazonaws.com "{target}" confidential | "top secret" | classified | undisclosed',priority:'high'},
    {id:'ef5',name:'NDA & contract docs',query:'site:{target} filetype:pdf intitle:"nda" | intitle:"non-disclosure" | intitle:"agreement" | intitle:"contract"',priority:'high'},
    {id:'ef6',name:'Exposed Excel spreadsheets',query:'site:{target} filetype:xls | filetype:xlsx intext:"password" | intext:"username" | intext:"confidential"',priority:'med'},
    {id:'ef7',name:'Open directory listings',query:'site:{target} intitle:"index of" inurl:/ "parent directory"',priority:'high'},
    {id:'ef8',name:'Database dump files',query:'site:{target} ext:sql | ext:db | ext:dump | ext:sqlite',priority:'high'},
    {id:'ef9',name:'Exposed log files',query:'site:{target} ext:log intext:"error" | intext:"exception" | intext:"username"',priority:'high'},
   ]},
  {id:'cr',emoji:'🔑',name:'Credentials & Secrets',
   tip:'Hardcoded API keys in GitHub repos and .env files. Highest-value category on HackerOne.',
   engines:['Google','GitHub','Bing'],
   dorks:[
    {id:'cr1',name:'Password files',query:'site:{target} intext:"password" filetype:txt | filetype:log | filetype:env',priority:'high'},
    {id:'cr2',name:'.env files with DB creds',query:'site:{target} filetype:env intext:"DB_PASSWORD" | intext:"DB_USER" | intext:"APP_SECRET"',priority:'high'},
    {id:'cr3',name:'API keys in JSON',query:'site:{target} filetype:json intext:"api_key" | intext:"access_token" | intext:"secret_key" | intext:"client_secret"',priority:'high'},
    {id:'cr4',name:'GitHub: API keys',query:'"{target}" "api_key" | "apikey" | "api_secret" | "access_token" | "secret_key"',priority:'high'},
    {id:'cr5',name:'GitHub: .env committed',query:'"{target}" filename:.env "DB_PASSWORD" | "SECRET" | "API_KEY"',priority:'high'},
    {id:'cr6',name:'GitHub: AWS keys',query:'"{target}" "AKIA" "aws_access_key_id"',priority:'high'},
    {id:'cr7',name:'Exposed htpasswd',query:'site:{target} inurl:".htpasswd" | intext:"htpasswd"',priority:'high'},
    {id:'cr8',name:'Connection strings',query:'site:{target} intext:"connectionString" | intext:"jdbc:mysql" | intext:"mongodb://" | intext:"postgres://"',priority:'high'},
    {id:'cr9',name:'SSH private keys',query:'"{target}" "BEGIN RSA PRIVATE KEY" | "BEGIN OPENSSH PRIVATE KEY"',priority:'high'},
   ]},
  {id:'ap',emoji:'🖥️',name:'Admin Panels',
   tip:'Admin panels with default credentials are consistently rewarded. Focus on non-standard ports.',
   engines:['Google','Bing','Yandex'],
   dorks:[
    {id:'ap1',name:'Generic admin / login pages',query:'site:{target} inurl:"admin" | inurl:"login" | inurl:"wp-admin" | inurl:"administrator"',priority:'high'},
    {id:'ap2',name:'phpMyAdmin',query:'site:{target} inurl:"phpmyadmin" | intitle:"phpMyAdmin"',priority:'high'},
    {id:'ap3',name:'WordPress admin',query:'site:{target} inurl:"wp-admin" | inurl:"wp-login"',priority:'med'},
    {id:'ap4',name:'cPanel / WHM',query:'site:{target} inurl:":2082" | inurl:":2083" | inurl:":2086" | intitle:"cPanel"',priority:'high'},
    {id:'ap5',name:'Jenkins CI',query:'site:{target} intitle:"Dashboard [Jenkins]" | inurl:"jenkins"',priority:'high'},
    {id:'ap6',name:'Grafana dashboard',query:'site:{target} intitle:"Grafana" | inurl:"grafana"',priority:'med'},
    {id:'ap7',name:'Kibana panel',query:'site:{target} intitle:"Kibana" | inurl:"app/kibana"',priority:'med'},
    {id:'ap8',name:'Laravel / Framework debug',query:'site:{target} intext:"Whoops! There was an error." | intitle:"Whoops!"',priority:'high'},
   ]},
  {id:'db',emoji:'🗄️',name:'Exposed Databases',
   tip:'MongoDB on 27017 and Elasticsearch on 9200 are frequently found open to the internet.',
   engines:['Shodan','Censys','Google'],
   dorks:[
    {id:'db1',name:'Open MongoDB',query:'site:{target} inurl:"27017" | "mongodb" port:27017',priority:'high'},
    {id:'db2',name:'Elasticsearch open',query:'site:{target} inurl:"9200/_cat" | intitle:"Elasticsearch"',priority:'high'},
    {id:'db3',name:'Redis exposed',query:'{target} port:6379 "redis_version"',priority:'high'},
    {id:'db4',name:'MySQL exposed',query:'{target} port:3306 product:"MySQL"',priority:'high'},
    {id:'db5',name:'Firebase database',query:'site:{target} inurl:".firebaseio.com"',priority:'high'},
   ]},
  {id:'er',emoji:'🐛',name:'Error Messages & Debug',
   tip:'Stack traces expose internal paths, tech stack, and sometimes credentials.',
   engines:['Google','Bing'],
   dorks:[
    {id:'er1',name:'SQL error messages',query:'site:{target} intext:"sql syntax" | intext:"mysql_fetch" | intext:"ORA-01"',priority:'high'},
    {id:'er2',name:'Stack traces',query:'site:{target} intext:"stack trace" | intext:"at java.lang" | intext:"Traceback (most recent"',priority:'high'},
    {id:'er3',name:'PHP errors',query:'site:{target} "PHP Parse error" | "PHP Warning" | "PHP Fatal error"',priority:'med'},
    {id:'er4',name:'ASP.NET debug',query:'site:{target} intext:"Server Error in" | intitle:"Runtime Error"',priority:'high'},
    {id:'er5',name:'Django debug page',query:'site:{target} intitle:"DisallowedHost" | intext:"Django"',priority:'high'},
   ]},
  {id:'cl',emoji:'☁️',name:'Cloud & Storage',
   tip:'S3, Azure, and GCP buckets are frequently left open to the internet.',
   engines:['Google','Bing'],
   dorks:[
    {id:'cl1',name:'Open S3 buckets',query:'site:s3.amazonaws.com "{target}" | site:{target}.s3.amazonaws.com',priority:'high'},
    {id:'cl2',name:'Azure blob storage',query:'site:blob.core.windows.net "{target}"',priority:'high'},
    {id:'cl3',name:'GCP storage',query:'site:storage.googleapis.com "{target}"',priority:'high'},
    {id:'cl4',name:'Exposed Docker registry',query:'site:{target} inurl:"/v2/" "Docker-Distribution-Api-Version"',priority:'high'},
    {id:'cl5',name:'Kubernetes dashboard',query:'site:{target} intitle:"Kubernetes Dashboard"',priority:'high'},
   ]},
  {id:'sp',emoji:'🔎',name:'Sensitive Params & Endpoints',
   tip:'Parameters in URLs expose hidden functionality — tokens, debug flags, internal APIs.',
   engines:['Google','Bing'],
   dorks:[
    {id:'sp1',name:'Password / token in URL',query:'site:{target} inurl:"password=" | inurl:"passwd=" | inurl:"token=" | inurl:"api_key="',priority:'high'},
    {id:'sp2',name:'Session ID in URL',query:'site:{target} inurl:"sessionid=" | inurl:"session_id=" | inurl:"PHPSESSID="',priority:'high'},
    {id:'sp3',name:'Debug / test / staging',query:'site:{target} inurl:"debug" | inurl:"test" | inurl:"dev" | inurl:"staging"',priority:'med'},
    {id:'sp4',name:'Internal IP exposed',query:'site:{target} intext:"192.168." | intext:"10.0." | intext:"172.16."',priority:'high'},
    {id:'sp5',name:'Backup file extensions',query:'site:{target} ext:bak | ext:old | ext:orig | ext:backup',priority:'high'},
    {id:'sp6',name:'Swagger / API docs',query:'site:{target} inurl:"swagger" | inurl:"api-docs" | intitle:"API Reference"',priority:'med'},
    {id:'sp7',name:'File upload endpoints',query:'site:{target} inurl:"upload" | inurl:"fileupload" | inurl:"upload.php"',priority:'high'},
   ]},
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

function loadState(cb){
  chrome.storage.local.get(['rdv2'], res => {
    if(res.rdv2) S = Object.assign({}, S, res.rdv2);
    cb();
  });
}
function saveS(){
  chrome.storage.local.set({rdv2: S});
}

// ============================================================
// HELPERS
// ============================================================
function allCats(){ return [...CATS, ...S.customCats]; }
function getDorks(catId){
  const base = CATS.find(c => c.id === catId);
  return [...(base ? base.dorks : []), ...S.customDorks.filter(d => d.catId === catId)];
}
function bldQ(q, dom){ return dom ? q.replace(/\{target\}/g, dom) : q; }
function bldUrl(q, eng){ return (ENG[eng] || ENG.Google)(q); }
function getPrio(id){
  if(S.priorities[id]) return S.priorities[id];
  for(const c of allCats()){
    const d = getDorks(c.id).find(x => x.id === id);
    if(d && d.priority) return d.priority;
  }
  return 'med';
}
function getCatBrowser(catId){ return S.catBrowsers[catId] || S.globalBrowser; }
function totalDorks(){ return allCats().reduce((s,c) => s + getDorks(c.id).length, 0); }
function totalChecked(){ return Object.values(S.checked).filter(Boolean).length; }
function uid(){ return 'u' + Date.now() + Math.random().toString(36).slice(2,7); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function openTab(url){
  chrome.runtime.sendMessage({action:'openTab', url});
}

// ============================================================
// TOAST
// ============================================================
function toast(msg, type='teal'){
  const w = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  const c = type==='red'?'var(--red)':type==='yellow'?'var(--yellow)':'var(--teal)';
  t.style.borderColor = c; t.style.color = c;
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function copyText(text, msg='Copied!'){
  navigator.clipboard.writeText(text)
    .then(() => toast(msg))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      ta.remove(); toast(msg);
    });
}

// ============================================================
// RENDER
// ============================================================
function renderStats(){
  const tot = totalDorks(), chk = totalChecked();
  const pct = tot ? Math.round(chk/tot*100) : 0;
  document.getElementById('prog-txt').textContent = `${chk}/${tot} (${pct}%)`;
  document.getElementById('prog-fill').style.width = pct + '%';
  const allD = allCats().flatMap(c => getDorks(c.id));
  const highTot = allD.filter(d => getPrio(d.id)==='high').length;
  const highChk = allD.filter(d => getPrio(d.id)==='high' && S.checked[d.id]).length;
  document.getElementById('stats-row').innerHTML = `
    <div class="stat"><div class="stat-v">${tot}</div><div class="stat-l">Total</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--teal)">${chk}</div><div class="stat-l">Run</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--red)">${highTot}</div><div class="stat-l">High</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--green)">${highChk}</div><div class="stat-l">Done High</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--yellow)">${S.history.length}</div><div class="stat-l">History</div></div>
    <div class="stat"><div class="stat-v" style="color:var(--purple)">${S.customDorks.length + S.customCats.length}</div><div class="stat-l">Custom</div></div>
  `;
}

function renderCats(){
  const container = document.getElementById('cats-container');
  const filt = S.filter.toLowerCase();
  let html = '';

  for(const cat of allCats()){
    let dorks = getDorks(cat.id);
    if(filt) dorks = dorks.filter(d => d.name.toLowerCase().includes(filt) || d.query.toLowerCase().includes(filt));
    if(S.pf) dorks = dorks.filter(d => getPrio(d.id) === S.pf);
    if(filt && dorks.length === 0) continue;

    const totD = getDorks(cat.id).length;
    const chkD = getDorks(cat.id).filter(d => S.checked[d.id]).length;
    const pct  = totD ? Math.round(chkD/totD*100) : 0;
    const col  = S.collapsed[cat.id];
    const cb   = getCatBrowser(cat.id);
    const engines = cat.engines || ['Google','Bing'];
    const isCC = !CATS.find(c => c.id === cat.id);

    html += `<div class="cat-card" id="cc-${cat.id}">`;

    // Header — NO inline handlers, use data-* attributes picked up by event delegation
    html += `<div class="cat-hdr" data-action="toggle-cat" data-ci="${cat.id}">
      <span class="cat-em">${cat.emoji||'📂'}</span>
      <span class="cat-nm">${esc(cat.name)}</span>
      <div class="eng-badges">
        ${engines.map(e => `<span class="eng-badge"
          style="background:${EC[e]?.bg};color:${EC[e]?.text};border-color:${EC[e]?.bd}"
          data-action="set-cat-br" data-ci="${cat.id}" data-eng="${e}"
          title="Set ${e} for this category">${e}</span>`).join('')}
      </div>
      <span class="cat-cnt">${chkD}/${totD}</span>
      ${isCC ? `<button class="btn btn-ic btn-sm btn-d" data-action="del-cat" data-ci="${cat.id}" title="Delete category">🗑️</button>` : ''}
      <span class="cat-arr${col ? '' : ' open'}">▼</span>
    </div>`;

    if(!col){
      // Mini progress
      html += `<div class="mini-track"><div class="mini-fill" style="width:${pct}%"></div></div>`;
      if(cat.tip) html += `<div class="cat-tip">${esc(cat.tip)}</div>`;

      // Cat actions row — engine select + bulk buttons
      html += `<div class="cat-acts">
        <select class="cat-eng-sel" data-action="cat-eng-change" data-ci="${cat.id}">
          ${Object.keys(ENG).map(e => `<option${cb===e?' selected':''}>${e}</option>`).join('')}
        </select>
        <button class="btn btn-sm" data-action="check-all" data-ci="${cat.id}" data-val="1">✅ All</button>
        <button class="btn btn-sm" data-action="check-all" data-ci="${cat.id}" data-val="0">☐ None</button>
        <button class="btn btn-sm" data-action="copy-all"  data-ci="${cat.id}">📋 Copy</button>
        <button class="btn btn-sm btn-t" data-action="add-dork-cat" data-ci="${cat.id}">➕</button>
        <span style="flex:1"></span>
        <span style="font-size:9px;color:var(--text3);font-family:var(--mono)">${pct}%</span>
      </div>`;

      // Dork items
      html += `<div class="dork-list">`;
      if(!dorks.length){
        html += `<div class="no-res">No dorks match the current filter.</div>`;
      }
      for(const d of dorks){
        const isChk = !!S.checked[d.id];
        const pr    = getPrio(d.id);
        const note  = S.notes[d.id] || '';
        const hasNote = note.trim().length > 0;
        const isCD  = !!S.customDorks.find(x => x.id === d.id);
        const runCnt = S.history.filter(h => h.dorkId === d.id).length;
        const dispQ = esc(bldQ(d.query, S.domain));

        html += `<div class="dork-item${isChk?' done':''}" id="di-${d.id}">
          <div class="d-top">
            <input type="checkbox" class="d-cb"${isChk?' checked':''}
              data-action="toggle-chk" data-id="${d.id}">
            <div class="d-main">
              <div class="d-nm-row">
                <span class="dork-nm">${esc(d.name)}</span>
                <span class="prio ${pr}" data-action="cycle-prio" data-id="${d.id}" title="Click to change priority">${pr.toUpperCase()}</span>
                ${isCD ? '<span class="custom-tag">CUSTOM</span>' : ''}
                ${hasNote ? '<span class="note-dot" title="Has note"></span>' : ''}
                ${runCnt > 0 ? `<span class="run-c">×${runCnt}</span>` : ''}
              </div>
              <div class="dork-q">${dispQ}</div>
            </div>
            <div class="d-acts">
              <button class="btn btn-ic" data-action="copy-dork" data-id="${d.id}" title="Copy query">📋</button>
              <button class="btn btn-ic btn-t" data-action="open-dork" data-id="${d.id}" data-ci="${cat.id}" title="Open in ${cb}">🔗</button>
              <button class="btn btn-ic" data-action="toggle-note" data-id="${d.id}" style="color:var(--yellow)" title="Note">📝</button>
              ${isCD ? `<button class="btn btn-ic btn-d" data-action="del-dork" data-id="${d.id}" title="Delete">🗑️</button>` : ''}
            </div>
          </div>
          <div class="note-area" id="na-${d.id}" style="display:${hasNote?'block':'none'}">
            <textarea class="notes-in" data-action="save-note" data-id="${d.id}"
              placeholder="Add notes here...">${esc(note)}</textarea>
          </div>
        </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  }

  if(!html) html = `<div class="no-res" style="padding:30px">No results match the filter.</div>`;
  container.innerHTML = html;
  renderStats();
}

// ============================================================
// EVENT DELEGATION — single listener handles all dynamic clicks
// ============================================================
function onContainerClick(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  const id     = el.dataset.id;
  const ci     = el.dataset.ci;

  switch(action){
    case 'toggle-cat':
      // Only toggle if the click isn't on a button/select inside the header
      if(e.target.closest('button, select, .eng-badge')) return;
      S.collapsed[ci] = !S.collapsed[ci];
      saveS(); renderCats();
      break;

    case 'set-cat-br':
      e.stopPropagation();
      S.catBrowsers[ci] = el.dataset.eng;
      saveS(); renderCats();
      toast(`${el.dataset.eng} set for category`);
      break;

    case 'del-cat':
      e.stopPropagation();
      if(!confirm('Delete this category and all its custom dorks?')) break;
      S.customCats    = S.customCats.filter(c => c.id !== ci);
      S.customDorks   = S.customDorks.filter(d => d.catId !== ci);
      saveS(); renderCats(); toast('Category deleted','red');
      break;

    case 'toggle-chk':
      S.checked[id] = el.checked;
      saveS(); refreshDorkItem(id); renderStats();
      break;

    case 'cycle-prio':
      S.priorities[id] = {high:'med',med:'low',low:'high'}[getPrio(id)] || 'high';
      saveS(); refreshDorkItem(id);
      break;

    case 'copy-dork':
      copyDork(id);
      break;

    case 'open-dork':
      openDork(id, ci);
      break;

    case 'toggle-note':
      toggleNote(id);
      break;

    case 'del-dork':
      S.customDorks = S.customDorks.filter(d => d.id !== id);
      saveS(); renderCats(); toast('Dork deleted','red');
      break;

    case 'check-all':
      getDorks(ci).forEach(d => { S.checked[d.id] = el.dataset.val === '1'; });
      saveS(); renderCats();
      toast(el.dataset.val==='1' ? 'All checked!' : 'All unchecked!');
      break;

    case 'copy-all':
      copyAllCat(ci);
      break;

    case 'add-dork-cat':
      openAddDorkModal(ci);
      break;
  }
}

function onContainerChange(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  if(el.dataset.action === 'cat-eng-change'){
    S.catBrowsers[el.dataset.ci] = el.value;
    saveS(); renderCats(); toast(`${el.value} set`);
  }
  if(el.dataset.action === 'save-note'){
    S.notes[el.dataset.id] = el.value;
    saveS();
  }
}

// ============================================================
// ACTIONS
// ============================================================
function refreshDorkItem(id){
  const el = document.getElementById('di-'+id); if(!el) return;
  const isChk = !!S.checked[id];
  const pr = getPrio(id);
  el.classList.toggle('done', isChk);
  const cb = el.querySelector('[data-action="toggle-chk"]');
  if(cb) cb.checked = isChk;
  const pEl = el.querySelector('.prio');
  if(pEl){ pEl.className = `prio ${pr}`; pEl.textContent = pr.toUpperCase(); }
}

function openDork(dorkId, catId){
  let dork = null;
  for(const c of allCats()){
    dork = getDorks(c.id).find(x => x.id === dorkId);
    if(dork){ catId = catId || c.id; break; }
  }
  if(!dork) return;
  const browser = getCatBrowser(catId);
  const q   = bldQ(dork.query, S.domain.trim());
  const url = bldUrl(q, browser);
  openTab(url);
  if(!S.checked[dorkId]){ S.checked[dorkId] = true; refreshDorkItem(dorkId); }
  S.history.unshift({id:uid(), dorkId, dorkName:dork.name, browser, url, domain:S.domain||'{target}', ts:Date.now()});
  if(S.history.length > 200) S.history = S.history.slice(0, 200);
  saveS(); renderStats(); toast(`Opened in ${browser}`);
}

function copyDork(id){
  let dork = null;
  for(const c of allCats()){ dork = getDorks(c.id).find(x => x.id === id); if(dork) break; }
  if(!dork) return;
  copyText(bldQ(dork.query, S.domain));
}

function toggleNote(id){
  const el = document.getElementById('na-'+id); if(!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if(el.style.display === 'block') el.querySelector('textarea').focus();
}

function copyAllCat(catId){
  const txt = getDorks(catId).map(d => `# ${d.name}\n${bldQ(d.query,S.domain)}`).join('\n\n');
  copyText(txt, 'All queries copied!');
}

// ============================================================
// ADD DORK MODAL
// ============================================================
function openAddDorkModal(catId = null){
  const sel = document.getElementById('nd-cat');
  sel.innerHTML = allCats().map(c =>
    `<option value="${c.id}"${c.id===catId?' selected':''}>${c.emoji||''} ${c.name}</option>`
  ).join('');
  document.getElementById('nd-name').value  = '';
  document.getElementById('nd-query').value = '';
  document.getElementById('nd-notes').value = '';
  document.querySelectorAll('#psel-dork .po').forEach(el => el.classList.toggle('on', el.dataset.p==='med'));
  document.getElementById('modal-dork').classList.remove('hidden');
  document.getElementById('nd-name').focus();
}
function closeAddDork(){ document.getElementById('modal-dork').classList.add('hidden'); }
function saveNewDork(){
  const name  = document.getElementById('nd-name').value.trim();
  const query = document.getElementById('nd-query').value.trim();
  const catId = document.getElementById('nd-cat').value;
  const notes = document.getElementById('nd-notes').value.trim();
  const po    = document.querySelector('#psel-dork .po.on');
  const priority = po ? po.dataset.p : 'med';
  if(!name || !query){ toast('Name and query required!','red'); return; }
  const nd = {id:uid(), catId, name, query, priority};
  S.customDorks.push(nd);
  if(notes) S.notes[nd.id] = notes;
  saveS(); closeAddDork(); renderCats(); toast('Dork added! ✅');
}

// ============================================================
// ADD CATEGORY MODAL
// ============================================================
function openAddCatModal(){
  document.getElementById('nc-name').value = '';
  document.getElementById('nc-emoji').value = '';
  document.getElementById('nc-tip').value = '';
  const eng = document.getElementById('nc-engines');
  eng.innerHTML = Object.keys(ENG).map(e => {
    const c = EC[e] || EC.Google;
    return `<label class="eng-chk-lbl" style="color:${c.text};border-color:${c.bd};background:${c.bg}">
      <input type="checkbox" value="${e}" checked style="accent-color:${c.text}"> ${e}
    </label>`;
  }).join('');
  document.getElementById('modal-cat').classList.remove('hidden');
  document.getElementById('nc-name').focus();
}
function closeAddCat(){ document.getElementById('modal-cat').classList.add('hidden'); }
function saveNewCat(){
  const name  = document.getElementById('nc-name').value.trim();
  const emoji = document.getElementById('nc-emoji').value.trim() || '📂';
  const tip   = document.getElementById('nc-tip').value.trim();
  const engines = [...document.querySelectorAll('#nc-engines input:checked')].map(el => el.value);
  if(!name){ toast('Category name required!','red'); return; }
  S.customCats.push({id:uid(), name, emoji, tip, engines});
  saveS(); closeAddCat(); renderCats(); toast('Category added! ✅');
}

// ============================================================
// EXPORT / IMPORT
// ============================================================
let expMode = 'export';
function openExport(){
  expMode = 'export';
  const data = {version:'2.0', exportDate:new Date().toISOString(), state:{
    checked:S.checked, notes:S.notes, priorities:S.priorities,
    history:S.history, customCats:S.customCats, customDorks:S.customDorks, catBrowsers:S.catBrowsers
  }};
  document.getElementById('exp-ta').value = JSON.stringify(data, null, 2);
  document.getElementById('exp-sec').classList.remove('hidden');
  document.getElementById('imp-sec').classList.add('hidden');
  document.getElementById('exp-title').textContent = '📤 Export';
  document.getElementById('do-exp').textContent = '📋 Copy JSON';
  document.getElementById('modal-exp').classList.remove('hidden');
}
function openImport(){
  expMode = 'import';
  document.getElementById('imp-ta').value = '';
  document.getElementById('exp-sec').classList.add('hidden');
  document.getElementById('imp-sec').classList.remove('hidden');
  document.getElementById('exp-title').textContent = '📥 Import';
  document.getElementById('do-exp').textContent = '📥 Import';
  document.getElementById('modal-exp').classList.remove('hidden');
}
function doExpAction(){
  if(expMode === 'export'){
    copyText(document.getElementById('exp-ta').value, 'Copied!');
  } else {
    try{
      const d = JSON.parse(document.getElementById('imp-ta').value.trim());
      if(!d.version || !d.state) throw new Error('Invalid');
      const s = d.state;
      if(s.checked)     Object.assign(S.checked, s.checked);
      if(s.notes)       Object.assign(S.notes, s.notes);
      if(s.priorities)  Object.assign(S.priorities, s.priorities);
      if(s.catBrowsers) Object.assign(S.catBrowsers, s.catBrowsers);
      if(s.history)     S.history = [...(s.history||[]), ...S.history].slice(0,200);
      if(s.customCats)  s.customCats.forEach(c  => { if(!S.customCats.find(x=>x.id===c.id))  S.customCats.push(c); });
      if(s.customDorks) s.customDorks.forEach(d => { if(!S.customDorks.find(x=>x.id===d.id)) S.customDorks.push(d); });
      saveS(); closeExp(); renderCats(); toast('Imported! ✅');
    }catch(e){ toast('Invalid JSON!','red'); }
  }
}
function closeExp(){ document.getElementById('modal-exp').classList.add('hidden'); }

// ============================================================
// HISTORY
// ============================================================
function openHistory(){ renderHistList(); document.getElementById('modal-hist').classList.remove('hidden'); }
function renderHistList(){
  const el = document.getElementById('hist-list');
  if(!S.history.length){ el.innerHTML = '<div class="no-res">No history yet.</div>'; return; }
  el.innerHTML = S.history.slice(0, 80).map(h => {
    const c = EC[h.browser] || EC.Google;
    return `<div class="h-item">
      <div style="flex:1">
        <div class="h-nm">${esc(h.dorkName||'?')}</div>
        <div class="h-meta">🎯 ${esc(h.domain)} &nbsp;·&nbsp;
          <span class="h-eng" style="background:${c.bg};color:${c.text}">${h.browser}</span>
          &nbsp;·&nbsp; ${new Date(h.ts).toLocaleString()}
        </div>
      </div>
      <button class="btn btn-ic btn-sm btn-t hist-reopen" data-url="${esc(h.url)}" title="Re-open">🔗</button>
    </div>`;
  }).join('');
  // Bind re-open buttons
  el.querySelectorAll('.hist-reopen').forEach(btn => {
    btn.addEventListener('click', () => openTab(btn.dataset.url));
  });
}
function closeHistory(){ document.getElementById('modal-hist').classList.add('hidden'); }

// ============================================================
// BIND STATIC BUTTONS
// ============================================================
function bindStaticButtons(){
  // Header
  $('btn-history').addEventListener('click', openHistory);
  $('btn-export').addEventListener('click', openExport);
  $('btn-import').addEventListener('click', openImport);
  $('btn-theme').addEventListener('click', () => {
    S.theme = S.theme === 'dark' ? 'soft' : 'dark';
    document.body.classList.toggle('soft', S.theme==='soft');
    $('btn-theme').textContent = S.theme==='soft' ? '☀️' : '🌙';
    saveS();
  });

  // Domain input
  $('domain-in').addEventListener('input', e => {
    S.domain = e.target.value.trim(); saveS(); renderCats();
  });

  // Global browser select
  $('gb-sel').addEventListener('change', e => {
    S.globalBrowser = e.target.value; saveS(); toast(`Global: ${S.globalBrowser}`);
  });

  // Filter
  $('filter-in').addEventListener('input', e => { S.filter = e.target.value; renderCats(); });

  // Priority filters
  document.querySelectorAll('.pf').forEach(btn => {
    btn.addEventListener('click', () => {
      const pf = btn.dataset.pf;
      S.pf = S.pf === pf ? null : pf;
      document.querySelectorAll('.pf').forEach(b => b.classList.remove('on'));
      if(S.pf) btn.classList.add('on');
      renderCats();
    });
  });

  // Filter toolbar
  $('btn-add-cat').addEventListener('click', openAddCatModal);
  $('btn-add-dork').addEventListener('click', () => openAddDorkModal());

  // Footer
  $('btn-collapse').addEventListener('click', () => {
    S.allCol = !S.allCol;
    allCats().forEach(c => { S.collapsed[c.id] = S.allCol; });
    $('btn-collapse').textContent = S.allCol ? '⊞ Expand' : '⊟ Collapse';
    saveS(); renderCats();
  });
  $('btn-reset').addEventListener('click', () => {
    if(!confirm('Reset all progress?')) return;
    S.checked = {}; saveS(); renderCats(); toast('Reset!','yellow');
  });

  // GitHub link
  $('gh-link').addEventListener('click', e => {
    e.preventDefault();
    openTab('https://github.com/Mostafa-Maklad');
  });

  // Dork modal
  $('x-dork').addEventListener('click', closeAddDork);
  $('cn-dork').addEventListener('click', closeAddDork);
  $('sv-dork').addEventListener('click', saveNewDork);
  document.querySelectorAll('#psel-dork .po').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('#psel-dork .po').forEach(x => x.classList.remove('on'));
      el.classList.add('on');
    });
  });

  // Category modal
  $('x-cat').addEventListener('click', closeAddCat);
  $('cn-cat').addEventListener('click', closeAddCat);
  $('sv-cat').addEventListener('click', saveNewCat);

  // Export/Import modal
  $('x-exp').addEventListener('click', closeExp);
  $('cn-exp').addEventListener('click', closeExp);
  $('do-exp').addEventListener('click', doExpAction);

  // History modal
  $('x-hist').addEventListener('click', closeHistory);
  $('cn-hist').addEventListener('click', closeHistory);
  $('clr-hist').addEventListener('click', () => {
    if(!confirm('Clear all history?')) return;
    S.history = []; saveS(); renderHistList(); renderStats(); toast('Cleared','yellow');
  });

  // Close modal on backdrop click
  ['modal-dork','modal-cat','modal-exp','modal-hist'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if(e.target === e.currentTarget) document.getElementById(id).classList.add('hidden');
    });
  });

  // Event delegation for dynamic content
  const container = document.getElementById('cats-container');
  container.addEventListener('click', onContainerClick);
  container.addEventListener('change', onContainerChange);
  container.addEventListener('input', onContainerChange);
}

function $(id){ return document.getElementById(id); }

// ============================================================
// INIT
// ============================================================
function init(){
  // Theme
  if(S.theme === 'soft'){
    document.body.classList.add('soft');
    document.getElementById('btn-theme').textContent = '☀️';
  }

  // Global browser select options
  const gbSel = document.getElementById('gb-sel');
  gbSel.innerHTML = Object.keys(ENG).map(e =>
    `<option${S.globalBrowser===e?' selected':''}>${e}</option>`
  ).join('');

  // Domain
  document.getElementById('domain-in').value = S.domain;

  // Filter
  document.getElementById('filter-in').value = S.filter;

  // Priority filter state
  if(S.pf){
    document.querySelectorAll('.pf').forEach(btn => {
      if(btn.dataset.pf === S.pf) btn.classList.add('on');
    });
  }

  bindStaticButtons();
  renderCats();
}

document.addEventListener('DOMContentLoaded', () => loadState(init));
