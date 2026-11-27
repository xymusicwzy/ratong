(() => {
'use strict';
const URL='https://mfmmwfdccspibvekoodb.supabase.co';
const KEY='sb_publishable_83WSC0kHUHRLhTUDgxJEoQ_L9_ur8cS';
const ROOT='https://xymusicwzy.github.io/ratong/';
const sb=window.supabase.createClient(URL,KEY,{auth:{storageKey:'ratong-unified-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
const $=id=>document.getElementById(id);
const S={user:null,profile:null,page:'overview',users:[],userPage:1,rosterRows:[],wordRows:[],questions:[],questionRows:[],papers:[],composePool:[],basket:[],assemblyId:null,assemblies:[],currentMfa:null};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=(id,t,type='')=>{const e=$(id);if(e){e.textContent=t||'';e.className='inline-message '+type}};
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(S.toastTimer);S.toastTimer=setTimeout(()=>e.classList.remove('show'),3800)};
const fail=(e)=>e?.message||String(e||'操作失败');
const download=(name,blob)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1800)};
const csvBlob=rows=>new Blob(['\ufeff'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
async function invokeAdmin(body){const {data,error}=await sb.functions.invoke('rt-admin-auth',{body:{...body,redirectTo:ROOT}});if(error)throw error;if(data?.error)throw new Error(data.error);return data}
async function countRows(table){const {count,error}=await sb.from(table).select('id',{count:'exact',head:true});if(error)throw error;return count||0}
async function init(){
 try{
  const {data,error}=await sb.auth.getSession();if(error)throw error;
  if(!data.session?.user){$('gateMessage').textContent='请先在仁爱通首页登录管理员账号。';setTimeout(()=>location.replace(ROOT),900);return}
  S.user=data.session.user;
  const {data:p,error:pe}=await sb.from('profiles').select('full_name,role,account_status,email').eq('id',S.user.id).maybeSingle();
  if(pe)throw pe;
  if(!p||p.role!=='admin'||p.account_status!=='active'){ $('gateMessage').textContent='该工作台仅对有效管理员账号开放。';setTimeout(()=>location.replace(ROOT),1800);return}
  S.profile=p;
  $('adminName').textContent=p.full_name||S.user.email;
  $('topAdmin').textContent=(p.full_name||S.user.email)+' · OA 管理员';
  $('gate').classList.add('hidden');$('workspace').classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
  document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>go(b.dataset.goto));
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add('hidden'));
  $('menuToggle').onclick=()=>$('sidebar').classList.toggle('open');
  $('logout').onclick=logout;
  $('topSecurity').onclick=()=>go('security');
  bindEvents();
  await Promise.all([loadOverview(),loadPapers(),loadRoster(),loadWordbooks(),loadAudit(),loadAuthSettings(),loadMfa()]);
  go('overview');
 }catch(e){$('gateMessage').textContent='初始化失败：'+fail(e);console.error(e)}
}
function go(page){
 const names={overview:'综合管理总览',accounts:'账号与权限',restore:'历史数据恢复',wordbooks:'英语词书管理',papers:'竞赛题库综合管理',assemble:'智能组卷中心',audit:'操作审计',security:'安全与邮件中心'};
 if(!names[page])return;
 S.page=page;
 document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+page));
 document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 $('pageTitle').textContent=names[page];$('sidebar').classList.remove('open');
 if(page==='overview')loadOverview();
 if(page==='accounts')loadAccounts();
 if(page==='restore'){loadRoster();$('bankRestoreReport').textContent='';}
 if(page==='wordbooks')loadWordbooks();
 if(page==='papers'){loadPapers();loadQuestions();}
 if(page==='assemble'){loadComposePool();loadAssemblies();}
 if(page==='audit')loadAudit();
 if(page==='security'){loadAuthSettings();loadMfa();}
}
async function loadOverview(){
 const tables=['profiles','rt_student_roster','chem_papers','chem_questions','rt_wordbooks','rt_words'];
 const labels=['注册账号','历史学生名册','竞赛试卷','竞赛题目','英语词书','英语词条'];
 const results=await Promise.all(tables.map(countRows));
 $('overviewStats').innerHTML=labels.map((l,i)=>'<div class="stat"><span>'+l+'</span><b>'+results[i]+'</b><small>当前云端数据</small></div>').join('');
}
function bindEvents(){
 $('refreshAccounts').onclick=()=>loadAccounts().catch(e=>toast(fail(e)));
 $('sendInvite').onclick=sendInvite;
 $('accountSearch').oninput=renderAccounts;
 $('accountRole').onchange=renderAccounts;$('accountStatus').onchange=renderAccounts;
 $('exportAccounts').onclick=exportAccounts;
 $('prevUsers').onclick=()=>{S.userPage=Math.max(1,S.userPage-1);loadAccounts()};
 $('nextUsers').onclick=()=>{if(S.users.length>=100){S.userPage++;loadAccounts()}};
 $('previewRoster').onclick=previewRoster;$('importRoster').onclick=importRoster;
 $('refreshRoster').onclick=loadRoster;
 $('restoreBank').onclick=restoreBank;$('exportFullBank').onclick=exportFullBank;
 $('previewWordbook').onclick=previewWordbook;$('importWordbook').onclick=importWordbook;
 $('downloadWordsTemplate').onclick=downloadWordsTemplate;$('refreshBooks').onclick=loadWordbooks;
 $('refreshPapers').onclick=()=>{loadPapers();loadQuestions()};
 $('searchQuestions').onclick=loadQuestions;$('questionPaperFilter').onchange=loadQuestions;
 $('questionStatusFilter').onchange=loadQuestions;$('questionSearch').onkeydown=e=>{if(e.key==='Enter')loadQuestions()};
 $('bulkDeleteQuestions').onclick=bulkDeleteQuestions;$('bulkVerify').onclick=bulkVerify;$('exportQuestions').onclick=exportQuestions;
 $('paperForm').onsubmit=savePaper;$('deletePaper').onclick=deletePaper;
 $('questionForm').onsubmit=saveQuestion;
 $('randomAssemble').onclick=randomAssemble;$('addSelected').onclick=addSelected;
 $('assembleSearch').oninput=renderComposePool;$('assemblePaperFilter').onchange=renderComposePool;$('assembleTypeFilter').onchange=renderComposePool;
 $('saveAssembly').onclick=saveAssembly;$('exportAssemblyDocx').onclick=exportAssemblyDocx;$('exportAssemblyXlsx').onclick=exportAssemblyXlsx;$('printAssembly').onclick=printAssembly;$('clearAssembly').onclick=()=>{if(confirm('清空当前试题篮？')){S.basket=[];renderBasket()}};
 $('refreshAssemblies').onclick=loadAssemblies;
 $('refreshAudit').onclick=loadAudit;
 $('saveAuthSettings').onclick=saveAuthSettings;
 $('enrollTotp').onclick=enrollTotp;$('refreshMfa').onclick=loadMfa;$('verifyTotp').onclick=verifyTotp;
 $('exportQuestions').onclick=exportQuestions;
}
function statusPill(s){
 const names={published:'已发布',draft:'草稿 / 已撤回',archived:'已归档',ready:'可用',needs_review:'待复核',source_incomplete:'资料不完整',verified:'已核验',teacher_verified:'教师已复核',source_answer:'原始答案',missing:'缺答案',active:'正常',inactive:'未激活',suspended:'已暂停'};
 const cls=['published','ready','verified','teacher_verified','active'].includes(s)?'ok':['needs_review','draft','source_answer','inactive'].includes(s)?'warn':['archived','source_incomplete','missing','suspended'].includes(s)?'bad':'';
 return '<span class="status '+cls+'">'+esc(names[s]||s||'—')+'</span>';
}
function fmt(x){return x?new Date(x).toLocaleString('zh-CN',{hour12:false}):'—';}
async function loadAccounts(){
 const r=await invokeAdmin({action:'list_users',page:S.userPage,perPage:100});
 S.users=r.users||[];
 $('accountPageInfo').textContent='第 '+S.userPage+' 页 · '+S.users.length+' 个账号'+(S.users.length<100?' · 已到末页':'');
 $('prevUsers').disabled=S.userPage<=1;$('nextUsers').disabled=S.users.length<100;
 renderAccounts();
}
function renderAccounts(){
 const term=($('accountSearch').value||'').trim().toLowerCase(),role=$('accountRole').value,status=$('accountStatus').value;
 const rows=S.users.filter(u=>(!role||(u.roles||[]).includes(role))&&(!status||u.account_status===status)&&(!term||[u.email,u.phone,u.full_name,u.student_no,u.class_name,u.school].join(' ').toLowerCase().includes(term)));
 $('accountsTable').innerHTML=rows.length?'<table><thead><tr><th>用户</th><th>邮箱验证</th><th>身份</th><th>状态</th><th>活动</th><th>管理</th></tr></thead><tbody>'+rows.map(u=>{
  const role=(u.roles||['student'])[0],self=u.id===S.user.id;
  return '<tr><td><b>'+esc(u.full_name||u.email||'用户')+'</b><small>'+esc(u.email||'')+'</small><small>学号 '+esc(u.student_no||'—')+' · '+esc(u.class_name||'—')+'</small></td><td>'+(u.email_confirmed_at?statusPill('verified'):'<span class="status warn">待验证</span>')+'</td><td><select data-role="'+u.id+'" '+(self?'disabled':'')+'><option value="student" '+(role==='student'?'selected':'')+'>学生</option><option value="teacher" '+(role==='teacher'?'selected':'')+'>教师</option><option value="admin" '+(role==='admin'?'selected':'')+'>管理员</option></select><small>'+esc(u.school||'')+'</small></td><td>'+statusPill(u.account_status||'active')+'</td><td>'+esc(fmt(u.last_sign_in_at))+'</td><td><div class="row-actions"><button class="soft" data-set-role="'+u.id+'" '+(self?'disabled':'')+'>保存身份</button>'+(u.email_confirmed_at?'':'<button class="soft" data-confirm="'+u.id+'">确认邮箱</button>')+'<button class="soft" data-reset="'+esc(u.email||'')+'">重置密码</button><button class="danger" data-ban="'+u.id+'" data-banned="'+(u.account_status==='suspended'?'1':'0')+'" '+(self?'disabled':'')+'>'+(u.account_status==='suspended'?'恢复账号':'暂停账号')+'</button></div></td></tr>';
 }).join('')+'</tbody></table>':'<div class="empty">没有匹配账号。</div>';
 document.querySelectorAll('[data-set-role]').forEach(b=>b.onclick=async()=>{const id=b.dataset.setRole,role=document.querySelector('[data-role="'+id+'"]').value;if(!confirm('确认将此账号身份调整为“'+role+'”？'))return;try{const {error}=await sb.rpc('rt_admin_set_user_role',{p_user_id:id,p_role:role,p_enable:true});if(error)throw error;toast('身份已更新');await loadAccounts()}catch(e){toast(fail(e))}});
 document.querySelectorAll('[data-confirm]').forEach(b=>b.onclick=()=>accountAction('confirm_email',b.dataset.confirm));
 document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>accountAction('send_recovery',null,b.dataset.reset));
 document.querySelectorAll('[data-ban]').forEach(b=>b.onclick=()=>accountAction(b.dataset.banned==='1'?'unban_user':'ban_user',b.dataset.ban));
}
async function sendInvite(){
 const email=$('inviteEmail').value.trim().toLowerCase(),role=$('inviteRole').value;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return msg('inviteMessage','请输入有效邮箱地址。','error');
 try{const r=await invokeAdmin({action:'invite_user',email,role});msg('inviteMessage','邀请已提交：'+email+'（'+role+'）。请检查 SMTP 和邀请邮件模板。','success');$('inviteEmail').value='';toast(r.message||'邀请邮件已提交');await loadAccounts()}catch(e){msg('inviteMessage',fail(e),'error')}
}
async function accountAction(action,userId=null,email=null){
 try{const r=await invokeAdmin({action,userId,email});toast(r.message||'操作已提交');await loadAccounts()}catch(e){toast(fail(e))}
}
function exportAccounts(){
 const rows=[['邮箱','姓名','学号','班级','学校','角色','账号状态','邮箱验证','注册时间','最近登录'],...S.users.map(u=>[u.email,u.full_name,u.student_no,u.class_name,u.school,(u.roles||[]).join(';'),u.account_status,u.email_confirmed_at?'已验证':'待验证',u.created_at,u.last_sign_in_at])];
 download('仁爱通_账号清单.csv',csvBlob(rows));
}
async function previewRoster(){
 const file=$('rosterFile').files?.[0];if(!file)return msg('rosterReport','请先选择 CSV / XLSX 文件。','error');
 try{
  const rows=await readRows(file);const mapped=rows.map((r,i)=>{
   const pick=(...ks)=>{for(const k of ks)if(r[k]!==undefined&&String(r[k]).trim()!=='')return String(r[k]).trim();return ''};
   const name=pick('display_name','姓名','name','学生姓名','昵称');
   const email=pick('email','邮箱','电子邮箱','邮箱地址').toLowerCase();
   let no=pick('student_no','学号','学生编号','student id');if(!no)no='EMAIL-'+email.replace(/[^a-z0-9]/gi,'').slice(0,18);
   const cl=pick('class_name','班级','class','班级名称')||'历史账号（待核实）';
   const status=pick('status','状态')||'inactive';
   return {student_no:no,display_name:name,email:email||null,class_name:cl,status:['active','inactive','graduated'].includes(status)?status:'inactive'};
  }).filter(x=>x.display_name||x.email||x.student_no);
  const bad=mapped.filter(x=>!x.display_name||!x.student_no);
  const seen=new Set(),dup=[];mapped.forEach(x=>{const k=x.student_no+'|'+x.class_name;if(seen.has(k))dup.push(k);seen.add(k)});
  S.rosterRows=mapped;
  $('rosterPreview').innerHTML=mapped.length?'<table><thead><tr><th>学号</th><th>姓名</th><th>邮箱</th><th>班级</th><th>状态</th></tr></thead><tbody>'+mapped.slice(0,100).map(x=>'<tr><td>'+esc(x.student_no)+'</td><td>'+esc(x.display_name)+'</td><td>'+esc(x.email||'—')+'</td><td>'+esc(x.class_name)+'</td><td>'+statusPill(x.status)+'</td></tr>').join('')+'</tbody></table>':'<div class="empty">没有可导入记录。</div>';
  const ok=mapped.length>0&&!bad.length&&!dup.length;
  $('importRoster').disabled=!ok;
  msg('rosterReport','识别 '+mapped.length+' 条；缺少姓名/学号 '+bad.length+' 条；文件内重复 '+dup.length+' 条。'+(ok?'预览通过，可以导入。':'请修正问题后重新选择文件。'),ok?'success':'warning');
 }catch(e){msg('rosterReport',fail(e),'error')}
}
async function importRoster(){
 if(!S.rosterRows.length)return;
 if(!confirm('确认将 '+S.rosterRows.length+' 条学生记录导入历史名册？这不会直接创建登录账号。'))return;
 try{
  const rows=S.rosterRows.map(x=>({...x,imported_by:S.user.id}));
  const {error}=await sb.from('rt_student_roster').upsert(rows,{onConflict:'student_no,class_name'});
  if(error)throw error;
  msg('rosterReport','名册导入成功。可在下方逐人发送邀请恢复登录。','success');toast('历史学生名册导入成功');
  await loadRoster();await loadOverview();
 }catch(e){msg('rosterReport',fail(e),'error')}
}
async function loadRoster(){
 try{
  const {data,error}=await sb.from('rt_student_roster').select('id,student_no,display_name,email,class_name,status,created_at').order('created_at',{ascending:false}).limit(1000);
  if(error)throw error;
  const rows=data||[];
  $('rosterTable').innerHTML=rows.length?'<table><thead><tr><th>学生</th><th>学号</th><th>班级</th><th>状态</th><th>操作</th></tr></thead><tbody>'+rows.map(x=>'<tr><td><b>'+esc(x.display_name)+'</b><small>'+esc(x.email||'没有邮箱')+'</small></td><td>'+esc(x.student_no)+'</td><td>'+esc(x.class_name)+'</td><td>'+statusPill(x.status)+'</td><td><div class="row-actions"><button class="soft" data-roster-invite="'+x.id+'">发送账号邀请</button><button class="soft" data-roster-active="'+x.id+'" data-state="'+x.status+'">'+(x.status==='active'?'设为未激活':'标记为有效名册')+'</button></div></td></tr>').join('')+'</tbody></table>':'<div class="empty">暂无历史学生档案。</div>';
  document.querySelectorAll('[data-roster-invite]').forEach(b=>b.onclick=()=>inviteRosterStudent(b.dataset.rosterInvite));
  document.querySelectorAll('[data-roster-active]').forEach(b=>b.onclick=async()=>{const id=b.dataset.rosterActive,next=b.dataset.state==='active'?'inactive':'active';if(!confirm('将该名册状态调整为 '+next+'？'))return;try{const {error}=await sb.from('rt_student_roster').update({status:next}).eq('id',id);if(error)throw error;await loadRoster()}catch(e){toast(fail(e))}});
 }catch(e){$('rosterTable').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
async function inviteRosterStudent(id){
 const {data,error}=await sb.from('rt_student_roster').select('email,display_name').eq('id',id).single();if(error)return toast(fail(error));
 if(!data.email)return toast('此历史学生没有邮箱，先补录并核实邮箱。');
 if(!confirm('向 '+data.email+' 发送仁爱通账号邀请？'))return;
 try{await invokeAdmin({action:'invite_user',email:data.email,role:'student'});await sb.from('rt_audit_logs').insert({actor_id:S.user.id,action:'restore_student_invite',entity_type:'rt_student_roster',entity_id:id,details:{email:data.email}});toast('账号邀请已提交');await loadAccounts()}catch(e){toast(fail(e))}
}
async function restoreBank(){
 const file=$('bankRestoreFile').files?.[0];if(!file)return msg('bankRestoreReport','请先选择 JSON / Excel / CSV 文件。','error');
 try{
  let papers=[];
  if(file.name.toLowerCase().endsWith('.json')){
   const bank=JSON.parse(await file.text());papers=Array.isArray(bank.papers)?bank.papers:[];
  }else{
   const rows=await readRows(file),groups={};
   rows.forEach((r,i)=>{
    const pick=(...ks)=>{for(const k of ks)if(r[k]!==undefined&&String(r[k]).trim()!=='')return r[k];return ''};
    const year=Number(pick('年份','year'))||new Date().getFullYear(),title=String(pick('试卷名称','试卷','title')||'导入试卷');
    const key=year+'|'+title;(groups[key]??={year,title,source_file:file.name,description:'由 OA 历史恢复中心导入',questions:[]}).questions.push(parseChemRow(r,i));
   });
   papers=Object.values(groups);
  }
  if(!papers.length)throw new Error('没有识别到 papers 数据或题目行。');
  let total=0;
  for(let i=0;i<papers.length;i++){
   const p=papers[i];const payload={year:p.year,title:p.title,description:p.description||'',source_file:p.source_file||file.name,status:'draft',questions:(p.questions||[]).map((q,j)=>normalizeChemQuestion(q,j))};
   const {data,error}=await sb.rpc('chem_bulk_import_questions',{p_paper:payload});if(error)throw error;
   total+=Number(data?.imported_count||payload.questions.length);
   msg('bankRestoreReport','恢复中 '+(i+1)+' / '+papers.length+' 套：'+p.title,'warning');
  }
  msg('bankRestoreReport','恢复完成：'+papers.length+' 套试卷、约 '+total+' 道题。全部作为草稿导入，请核验后再发布。','success');toast('竞赛题库恢复完成');await loadPapers();await loadOverview();
 }catch(e){msg('bankRestoreReport',fail(e),'error')}
}
function parseChemRow(r,i){
 const pick=(...ks)=>{for(const k of ks)if(r[k]!==undefined&&String(r[k]).trim()!=='')return r[k];return ''};
 const raw=String(pick('section','题型','类型','题目类型'));
 const section=/多选|multiple/i.test(raw)?'multiple_choice':/判断|judge/i.test(raw)?'judgment':/填空|blank/i.test(raw)?'fill_blank':'single_choice';
 let options=pick('options','选项JSON','选项');
 if(!Array.isArray(options)){if(String(options).trim().startsWith('[')){try{options=JSON.parse(options)}catch(_){options=[]}}else{options=[];['A','B','C','D','E','F'].forEach(k=>{const v=pick(k,'选项'+k);if(v!=='')options.push({key:k,text:String(v)})})}}
 let ans=pick('answer_key','答案','标准答案','answer');if(ans){try{ans=JSON.parse(ans);if(!Array.isArray(ans))ans=[ans]}catch(_){ans=String(ans).split(/[;；|,，]/).map(x=>x.trim()).filter(Boolean)}}else ans=null;
 return {qno:Number(pick('qno','题号','序号'))||i+1,source_ref:String(pick('source_ref','来源编号')||('restore-'+(i+1))),section,section_item_no:Number(pick('section_item_no','分题号'))||i+1,source_number:Number(pick('source_number','原卷题号'))||null,stem:String(pick('stem','题干','题目','题目内容')),options,score:Number(pick('score','分值'))||1.5,source_status:String(pick('source_status','题目状态')||'needs_review'),source_note:String(pick('source_note','来源备注','来源说明')||'历史资料导入，待复核'),answer_key:ans,explanation:String(pick('explanation','解析')||''),answer_origin:String(pick('answer_origin','答案来源')||(ans?'source':'missing')),verification_status:String(pick('verification_status','答案核验状态')||(ans?'needs_review':'missing'))};
}
function normalizeChemQuestion(q,i){return {qno:Number(q.qno)||i+1,source_ref:q.source_ref||('restore-'+(i+1)),section:q.section||'single_choice',section_item_no:Number(q.section_item_no)||Number(q.qno)||i+1,source_number:q.source_number||null,stem:String(q.stem||''),options:Array.isArray(q.options)?q.options:[],score:Number(q.score)||1.5,source_status:q.source_status||'needs_review',source_note:q.source_note||'历史资料导入，待复核',answer_key:q.answer_key??null,explanation:q.explanation||'',answer_origin:q.answer_origin||'missing',verification_status:q.verification_status||'missing'}}
async function exportFullBank(){
 try{
  const [p,q,k]=await Promise.all([sb.from('chem_papers').select('*').order('year'),sb.from('chem_questions').select('*').order('qno').limit(10000),sb.from('chem_question_keys').select('*').limit(10000)]);
  for(const x of [p,q,k])if(x.error)throw x.error;
  const km=new Map((k.data||[]).map(x=>[x.question_id,x]));
  const papers=(p.data||[]).map(x=>({...x,questions:(q.data||[]).filter(y=>y.paper_id===x.id).map(y=>{const z=km.get(y.id)||{};return {...y,answer_key:z.answer_key??null,explanation:z.explanation||'',answer_origin:z.answer_origin||'missing',verification_status:z.verification_status||'missing'}})}));
  download('仁爱通_竞赛题库完整备份.json',new Blob([JSON.stringify({schema_version:1,exported_at:new Date().toISOString(),papers},null,2)],{type:'application/json;charset=utf-8'}));
  msg('bankRestoreReport','已导出 '+papers.length+' 套试卷的 JSON 备份。','success');
 }catch(e){msg('bankRestoreReport',fail(e),'error')}
}
async function readRows(file){
 if(!window.XLSX)throw new Error('Excel 读取组件加载失败，请刷新后重试。');
 const data=await file.arrayBuffer(),wb=XLSX.read(data,{type:'array'});
 const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{defval:''});
}
function pickWord(row,...keys){for(const k of keys)if(row[k]!==undefined&&String(row[k]).trim()!=='')return String(row[k]).trim();return ''}
async function previewWordbook(){
 const file=$('wordbookFile').files?.[0];if(!file)return msg('wordbookReport','请先选择词书 Excel / CSV。','error');
 try{
  const rows=await readRows(file),seen=new Set(),out=[];
  rows.forEach(r=>{
   const word=pickWord(r,'word','单词','词汇','英文');if(!word)return;
   const key=word.toLowerCase();if(seen.has(key))return;seen.add(key);
   out.push({word,us_phonetic:pickWord(r,'us_phonetic','美音音标','美式音标','美音'),uk_phonetic:pickWord(r,'uk_phonetic','英音音标','英式音标','英音'),pos:pickWord(r,'pos','词性'),definition:pickWord(r,'definition','释义','中文释义','中文意思')||'待补充',explanation:pickWord(r,'explanation','讲解','词条说明'),example_sentence:pickWord(r,'example_sentence','例句','英文例句'),example_translation:pickWord(r,'example_translation','例句翻译','例句中文'),audio_us_url:pickWord(r,'audio_us_url','美音音频'),audio_uk_url:pickWord(r,'audio_uk_url','英音音频'),tags:pickWord(r,'tags','标签').split(/[;,，；]/).map(x=>x.trim()).filter(Boolean)});
  });
  S.wordRows=out;
  const valid=out.filter(x=>x.definition&&x.word);
  $('importWordbook').disabled=!valid.length;
  $('wordbookPreview').innerHTML=valid.length?'<table><thead><tr><th>单词</th><th>音标</th><th>词性</th><th>释义</th><th>例句</th></tr></thead><tbody>'+valid.slice(0,80).map(x=>'<tr><td><b>'+esc(x.word)+'</b></td><td>'+esc(x.us_phonetic||x.uk_phonetic||'—')+'</td><td>'+esc(x.pos||'—')+'</td><td>'+esc(x.definition)+'</td><td>'+esc(x.example_sentence||'—')+'</td></tr>').join('')+'</tbody></table>':'<div class="empty">没有识别到有效词条。</div>';
  msg('wordbookReport','识别 '+rows.length+' 行，去重后 '+out.length+' 条词汇。导入后默认保存为草稿。','success');
 }catch(e){msg('wordbookReport',fail(e),'error')}
}
async function importWordbook(){
 if(!S.wordRows.length)return;
 const title=$('bookTitle').value.trim();if(!title)return msg('wordbookReport','请填写词书名称。','error');
 if(!$('bookSource').value.trim())return msg('wordbookReport','请填写来源和使用授权说明。','error');
 if(!confirm('将 '+S.wordRows.length+' 条词汇导入词书“'+title+'”，并保存为草稿？'))return;
 try{
  const {data:book,error}=await sb.from('rt_wordbooks').insert({title,level:$('bookLevel').value,description:'由 OA 批量导入',status:'draft',source_note:$('bookSource').value.trim(),license_note:$('bookSource').value.trim(),word_count:0,created_by:S.user.id}).select('id').single();
  if(error)throw error;
  let done=0;
  for(let i=0;i<S.wordRows.length;i+=400){
   const chunk=S.wordRows.slice(i,i+400).map((x,j)=>({...x,book_id:book.id,sort_order:i+j}));
   const {error:e}=await sb.from('rt_words').insert(chunk);if(e)throw e;done+=chunk.length;
   msg('wordbookReport','已写入 '+done+' / '+S.wordRows.length+' 条词汇…','warning');
  }
  const {error:e2}=await sb.from('rt_wordbooks').update({word_count:done,updated_at:new Date().toISOString()}).eq('id',book.id);if(e2)throw e2;
  msg('wordbookReport','导入成功：'+done+' 条词汇，词书状态为草稿。','success');toast('词书导入成功');S.wordRows=[];$('importWordbook').disabled=true;await loadWordbooks();await loadOverview();
 }catch(e){msg('wordbookReport','导入中断：'+fail(e),'error')}
}
function downloadWordsTemplate(){
 const headers=['word','us_phonetic','uk_phonetic','pos','definition','explanation','example_sentence','example_translation','audio_us_url','audio_uk_url','tags'];
 const sample=['ability','/əˈbɪləti/','/əˈbɪləti/','n.','能力；才能','具备某种能力的状态','She has the ability to learn quickly.','她有快速学习的能力。','','','CET-4'];
 download('仁爱通_英语词书导入模板.csv',csvBlob([headers,sample]));
}
async function loadWordbooks(){
 try{
  const {data,error}=await sb.from('rt_wordbooks').select('id,title,level,status,word_count,source_note,license_note,created_at').order('created_at',{ascending:false}).limit(500);
  if(error)throw error;
  $('wordbookTable').innerHTML=data.length?'<table><thead><tr><th>词书</th><th>等级</th><th>词条数</th><th>来源/授权</th><th>状态</th><th>操作</th></tr></thead><tbody>'+data.map(b=>'<tr><td><b>'+esc(b.title)+'</b><small>'+esc(fmt(b.created_at))+'</small></td><td>'+esc(b.level)+'</td><td>'+b.word_count+'</td><td>'+esc(b.license_note||b.source_note||'—')+'</td><td>'+statusPill(b.status)+'</td><td><div class="row-actions">'+(b.status!=='published'?'<button class="soft" data-publish-book="'+b.id+'">发布</button>':'<button class="soft" data-unpublish-book="'+b.id+'">下架</button>')+'<button class="danger" data-archive-book="'+b.id+'">归档</button></div></td></tr>').join('')+'</tbody></table>':'<div class="empty">当前还没有英语词书。请上传 CET-4 / CET-6 文件进行恢复。</div>';
  document.querySelectorAll('[data-publish-book]').forEach(b=>b.onclick=()=>bookStatus(b.dataset.publishBook,'published'));
  document.querySelectorAll('[data-unpublish-book]').forEach(b=>b.onclick=()=>bookStatus(b.dataset.unpublishBook,'draft'));
  document.querySelectorAll('[data-archive-book]').forEach(b=>b.onclick=()=>bookStatus(b.dataset.archiveBook,'archived'));
 }catch(e){$('wordbookTable').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
async function bookStatus(id,status){
 if(!confirm('确认将词书状态改为 '+status+'？'))return;
 try{const {error}=await sb.from('rt_wordbooks').update({status,published_at:status==='published'?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;toast('词书状态已更新');await loadWordbooks()}catch(e){toast(fail(e))}
}
async function loadPapers(){
 try{
  const [p,q,a]=await Promise.all([sb.from('chem_papers').select('id,year,title,description,source_file,status,created_at').order('year',{ascending:true}),sb.from('chem_questions').select('id,paper_id,source_status').limit(10000),sb.from('chem_attempts').select('id,paper_id').limit(10000)]);
  for(const x of [p,q,a])if(x.error)throw x.error;
  S.papers=p.data||[];const counts={},attempts={};(q.data||[]).forEach(x=>counts[x.paper_id]=(counts[x.paper_id]||0)+1);(a.data||[]).forEach(x=>attempts[x.paper_id]=(attempts[x.paper_id]||0)+1);
  $('paperTable').innerHTML=S.papers.length?'<table><thead><tr><th>年份 / 试卷</th><th>题目</th><th>答题记录</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>'+S.papers.map(x=>'<tr><td><b>'+x.year+' · '+esc(x.title)+'</b><small>'+esc(x.source_file||'')+'</small></td><td>'+ (counts[x.id]||0) +'</td><td>'+(attempts[x.id]||0)+'</td><td>'+statusPill(x.status)+'</td><td>'+esc(fmt(x.created_at))+'</td><td><div class="row-actions"><button class="soft" data-edit-paper="'+x.id+'">编辑</button><button class="soft" data-archive-paper="'+x.id+'">'+(x.status==='archived'?'取消归档':'归档')+'</button><button class="danger" data-delete-paper="'+x.id+'" '+((attempts[x.id]||0)>0?'disabled':'')+'>彻底删除</button></div></td></tr>').join('')+'</tbody></table>':'<div class="empty">暂无竞赛试卷。</div>';
  $('questionPaperFilter').innerHTML='<option value="">全部试卷</option>'+S.papers.map(x=>'<option value="'+x.id+'">'+x.year+' · '+esc(x.title)+'</option>').join('');
  $('assemblePaperFilter').innerHTML='<option value="">全部试卷</option>'+S.papers.map(x=>'<option value="'+x.id+'">'+x.year+' · '+esc(x.title)+'</option>').join('');
  document.querySelectorAll('[data-edit-paper]').forEach(b=>b.onclick=()=>openPaper(b.dataset.editPaper));
  document.querySelectorAll('[data-archive-paper]').forEach(b=>b.onclick=()=>quickPaperStatus(b.dataset.archivePaper));
  document.querySelectorAll('[data-delete-paper]').forEach(b=>b.onclick=()=>deletePaperById(b.dataset.deletePaper));
  await loadOverview();
 }catch(e){$('paperTable').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
function openPaper(id){
 const p=S.papers.find(x=>x.id===id);if(!p)return;
 $('editPaperId').value=id;$('editPaperYear').value=p.year;$('editPaperTitle').value=p.title;$('editPaperSource').value=p.source_file||'';$('editPaperDescription').value=p.description||'';$('editPaperStatus').value=p.status;$('paperMessage').textContent='';$('paperDialog').classList.remove('hidden');
}
async function savePaper(e){
 e.preventDefault();const id=$('editPaperId').value;
 try{
  const values={p_paper_id:id,p_year:Number($('editPaperYear').value),p_title:$('editPaperTitle').value.trim(),p_description:$('editPaperDescription').value,p_source_file:$('editPaperSource').value,p_status:$('editPaperStatus').value};
  if(values.p_status==='published'&&!confirm('确认发布这套试卷？请确保题目、答案、解析已经复核。'))return;
  const {error}=await sb.rpc('chem_oa_set_paper',values);if(error)throw error;
  $('paperDialog').classList.add('hidden');toast('试卷信息已更新');await loadPapers();await loadQuestions();
 }catch(err){msg('paperMessage',fail(err),'error')}
}
async function quickPaperStatus(id){
 const p=S.papers.find(x=>x.id===id);if(!p)return;
 const status=p.status==='archived'?'draft':'archived';
 if(!confirm('确认将《'+p.title+'》'+(status==='archived'?'归档':'恢复为草稿')+'？'))return;
 try{const {error}=await sb.rpc('chem_oa_set_paper',{p_paper_id:id,p_year:p.year,p_title:p.title,p_description:p.description||'',p_source_file:p.source_file||'',p_status:status});if(error)throw error;toast('试卷状态已更新');await loadPapers()}catch(e){toast(fail(e))}
}
async function deletePaper(){const id=$('editPaperId').value;await deletePaperById(id)}
async function deletePaperById(id){
 const p=S.papers.find(x=>x.id===id);if(!p)return;
 if(S.papers.length===0)return;
 const typed=prompt('为避免误删，请完整输入试卷名称：\n'+p.title);
 if(typed!==p.title)return toast('名称不一致，已取消删除。');
 if(!confirm('最后确认：彻底删除试卷及其题目数据？如果存在答题记录，系统会拒绝删除。'))return;
 try{const {error}=await sb.rpc('chem_oa_delete_paper',{p_paper_id:id,p_confirm_title:typed});if(error)throw error;$('paperDialog').classList.add('hidden');toast('试卷已安全删除');await loadPapers();await loadQuestions()}catch(e){toast(fail(e))}
}
async function loadQuestions(){
 try{
  let q=sb.from('chem_questions').select('id,paper_id,qno,source_ref,section,section_item_no,source_number,stem,options,score,source_status,source_note').order('qno').limit(3000);
  const pid=$('questionPaperFilter').value,st=$('questionStatusFilter').value;
  if(pid)q=q.eq('paper_id',pid);if(st)q=q.eq('source_status',st);
  const {data,error}=await q;if(error)throw error;
  let rows=data||[];const term=$('questionSearch').value.trim().toLowerCase();if(term)rows=rows.filter(x=>(x.stem+' '+(x.source_ref||'')).toLowerCase().includes(term));
  const ids=rows.map(x=>x.id),keys=ids.length?await sb.from('chem_question_keys').select('question_id,answer_key,explanation,verification_status,answer_origin').in('question_id',ids):{data:[],error:null};
  if(keys.error)throw keys.error;
  const km=new Map((keys.data||[]).map(x=>[x.question_id,x])),pm=new Map(S.papers.map(x=>[x.id,x]));
  S.questionRows=rows.map(x=>({...x,key:km.get(x.id)||{}}));
  $('questionCount').textContent='共 '+rows.length+' 道题';
  $('questionTable').innerHTML=rows.length?'<table><thead><tr><th><input type="checkbox" id="selectAllQuestions"></th><th>试卷 / 题号</th><th>题干</th><th>答案核验</th><th>题目状态</th><th>操作</th></tr></thead><tbody>'+S.questionRows.map(x=>'<tr><td><input type="checkbox" data-qselect="'+x.id+'"></td><td><b>'+esc(pm.get(x.paper_id)?.title||'')+'</b><small>#'+x.qno+' · '+esc(x.section)+'</small></td><td style="min-width:260px;max-width:480px">'+esc((x.stem||'').slice(0,190))+'</td><td>'+statusPill(x.key.verification_status||'missing')+'</td><td>'+statusPill(x.source_status)+'</td><td><div class="row-actions"><button class="soft" data-edit-question="'+x.id+'">编辑 / 更正</button></div></td></tr>').join('')+'</tbody></table>':'<div class="empty">没有匹配题目。</div>';
  $('selectAllQuestions')?.addEventListener('change',e=>document.querySelectorAll('[data-qselect]').forEach(x=>x.checked=e.target.checked));
  document.querySelectorAll('[data-edit-question]').forEach(b=>b.onclick=()=>openQuestion(b.dataset.editQuestion));
 }catch(e){$('questionTable').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
function openQuestion(id){
 const q=S.questionRows.find(x=>x.id===id);if(!q)return;
 $('editQuestionId').value=id;$('editQuestionStem').value=q.stem||'';$('editQuestionOptions').value=JSON.stringify(q.options||[],null,2);$('editQuestionAnswer').value=q.key?.answer_key?JSON.stringify(q.key.answer_key):'';$('editQuestionScore').value=q.score??1.5;$('editQuestionExplanation').value=q.key?.explanation||'';$('editQuestionVerification').value=q.key?.verification_status||'missing';$('editQuestionSourceStatus').value=q.source_status||'needs_review';$('editQuestionSourceNote').value=q.source_note||'';$('questionMessage').textContent='';$('questionDialog').classList.remove('hidden');
}
function parseAnswer(raw){
 const t=raw.trim();if(!t)return null;
 try{const a=JSON.parse(t);return Array.isArray(a)?a.map(String):[String(a)]}catch(e){if(t.startsWith('['))throw e;return t.split(/[;；|,，]/).map(x=>x.trim()).filter(Boolean)}
}
async function saveQuestion(e){
 e.preventDefault();
 try{
  const options=JSON.parse($('editQuestionOptions').value||'[]');if(!Array.isArray(options))throw new Error('选项必须是 JSON 数组。');
  const ans=parseAnswer($('editQuestionAnswer').value);
  const {error}=await sb.rpc('chem_admin_update_question',{p_question_id:$('editQuestionId').value,p_stem:$('editQuestionStem').value,p_options:options,p_score:Number($('editQuestionScore').value)||0,p_answer_key:ans,p_explanation:$('editQuestionExplanation').value,p_verification_status:$('editQuestionVerification').value,p_source_note:$('editQuestionSourceNote').value,p_source_status:$('editQuestionSourceStatus').value});
  if(error)throw error;
  $('questionDialog').classList.add('hidden');toast('题目已保存并写入核验记录');await loadQuestions();
 }catch(err){msg('questionMessage',fail(err),'error')}
}
function selectedQuestionIds(){return [...document.querySelectorAll('[data-qselect]:checked')].map(x=>x.dataset.qselect)}
async function bulkDeleteQuestions(){
 const ids=selectedQuestionIds();if(!ids.length)return toast('请先勾选要删除的题目。');
 if(!confirm('确认删除 '+ids.length+' 道题？所属试卷如已有答题记录，系统会自动拒绝删除。'))return;
 try{const {data,error}=await sb.rpc('chem_oa_delete_questions',{p_question_ids:ids});if(error)throw error;toast('已删除 '+data+' 道题');await loadQuestions();await loadPapers()}catch(e){toast(fail(e))}
}
async function bulkVerify(){
 const ids=selectedQuestionIds();if(!ids.length)return toast('请先勾选题目。');
 let done=0,skip=0;
 for(const id of ids){
  const q=S.questionRows.find(x=>x.id===id);if(!q?.key?.answer_key){skip++;continue}
  const {error}=await sb.rpc('chem_admin_update_question',{p_question_id:id,p_stem:q.stem,p_options:q.options||[],p_score:Number(q.score)||0,p_answer_key:q.key.answer_key,p_explanation:q.key.explanation||'',p_verification_status:'teacher_verified',p_source_note:(q.source_note||'')+'；OA 批量复核',p_source_status:'ready'});
  if(error)throw error;done++;
 }
 toast('已复核 '+done+' 道，缺答案跳过 '+skip+' 道');await loadQuestions();
}
function exportQuestions(){
 const rows=S.questionRows.map(q=>({'试卷ID':q.paper_id,'题号':q.qno,'来源编号':q.source_ref,'题型':q.section,'题干':q.stem,'选项JSON':JSON.stringify(q.options||[]),'答案':JSON.stringify(q.key?.answer_key??null),'解析':q.key?.explanation||'','答案核验状态':q.key?.verification_status||'missing','题目状态':q.source_status,'分值':q.score,'来源说明':q.source_note}));
 if(window.XLSX){const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,XLSX.utils.json_to_sheet(rows),'题库筛选');XLSX.writeFile(w,'仁爱通_竞赛题库筛选导出.xlsx')}else download('仁爱通_竞赛题库筛选导出.csv',csvBlob([Object.keys(rows[0]||{}),...rows.map(Object.values)]));
}
async function loadComposePool(){
 try{
  const [p,q,k]=await Promise.all([sb.from('chem_papers').select('id,year,title,status'),sb.from('chem_questions').select('id,paper_id,qno,section,stem,options,score,source_status').neq('source_status','source_incomplete').order('qno').limit(5000),sb.from('chem_question_keys').select('question_id,answer_key,explanation,verification_status').limit(5000)]);
  for(const x of [p,q,k])if(x.error)throw x.error;
  const pm=new Map(p.data.map(x=>[x.id,x])),km=new Map(k.data.map(x=>[x.question_id,x]));
  S.composePool=q.data.map(x=>({...x,paper:pm.get(x.paper_id),key:km.get(x.id)||{}})).filter(x=>x.paper);
  renderComposePool();
 }catch(e){$('assemblePool').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
function renderComposePool(){
 const term=$('assembleSearch').value.trim().toLowerCase(),pid=$('assemblePaperFilter').value,type=$('assembleTypeFilter').value;
 const rows=S.composePool.filter(q=>(!pid||q.paper_id===pid)&&(!type||q.section===type)&&(!term||(q.stem+' '+q.paper.title).toLowerCase().includes(term)));
 $('assemblePool').innerHTML=rows.slice(0,600).map(q=>'<label class="pool-row"><input type="checkbox" data-pool-q="'+q.id+'" '+(S.basket.some(x=>x.question_id===q.id)?'disabled':'')+'><span class="pool-text"><b>'+esc(q.paper.title)+' · #'+q.qno+'</b><small>'+esc(q.section)+' · '+statusPill(q.key.verification_status||'missing')+'</small>'+esc((q.stem||'').slice(0,240))+'</span></label>').join('')||'<div class="empty">没有匹配题目。</div>';
}
function pushQuestion(q){
 if(S.basket.some(x=>x.question_id===q.id))return;
 S.basket.push({question_id:q.id,paper_id:q.paper_id,qno:q.qno,section:q.section,stem:q.stem,options:q.options||[],score:Number(q.score)||1.5,answer_key:q.key?.answer_key??null,explanation:q.key?.explanation||'',verification_status:q.key?.verification_status||'missing',paper_title:q.paper.title,year:q.paper.year});
}
function addSelected(){document.querySelectorAll('[data-pool-q]:checked').forEach(el=>{const q=S.composePool.find(x=>x.id===el.dataset.poolQ);if(q)pushQuestion(q)});renderBasket();renderComposePool()}
function randomAssemble(){
 const n=Math.max(1,Math.min(100,Number($('randomCount').value)||10)),pid=$('assemblePaperFilter').value,type=$('assembleTypeFilter').value;
 const pool=S.composePool.filter(q=>(!pid||q.paper_id===pid)&&(!type||q.section===type)&&!S.basket.some(x=>x.question_id===q.id));
 for(const q of pool.sort(()=>Math.random()-.5).slice(0,n))pushQuestion(q);
 renderBasket();renderComposePool();
}
function renderBasket(){
 $('assemblySummary').textContent=S.basket.length+' 道题 · '+S.basket.reduce((n,x)=>n+Number(x.score||0),0).toFixed(1)+' 分';
 $('assembleBasket').innerHTML=S.basket.length?S.basket.map((q,i)=>'<div class="basket-row"><div class="pool-text"><b>'+(i+1)+'. '+esc(q.paper_title)+' · #'+q.qno+'</b><small>'+esc(q.section)+' · '+statusPill(q.verification_status)+'</small>'+esc((q.stem||'').slice(0,190))+'</div><input type="number" min="0" step="0.5" value="'+q.score+'" data-score-index="'+i+'"><div class="row-actions"><button class="soft" data-move="'+i+'" data-dir="-1">↑</button><button class="soft" data-move="'+i+'" data-dir="1">↓</button><button class="danger" data-remove="'+i+'">×</button></div></div>').join(''):'<div class="empty">试题篮为空</div>';
 document.querySelectorAll('[data-score-index]').forEach(x=>x.onchange=()=>{S.basket[Number(x.dataset.scoreIndex)].score=Number(x.value)||0;renderBasket()});
 document.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{S.basket.splice(Number(x.dataset.remove),1);renderBasket();renderComposePool()});
 document.querySelectorAll('[data-move]').forEach(x=>x.onclick=()=>{const i=Number(x.dataset.move),j=i+Number(x.dataset.dir);if(j<0||j>=S.basket.length)return;[S.basket[i],S.basket[j]]=[S.basket[j],S.basket[i]];renderBasket()});
}
async function saveAssembly(){
 const title=$('assembleTitle').value.trim();if(!title||!S.basket.length)return msg('assembleMessage','请填写试卷名称并加入题目。','error');
 const data={created_by:S.user.id,title,description:$('assembleDescription').value.trim(),status:'draft',paper_data:{items:S.basket,total_score:S.basket.reduce((n,q)=>n+Number(q.score||0),0)}};
 try{
  const result=S.assemblyId?await sb.from('chem_assembled_papers').update({...data,updated_at:new Date().toISOString()}).eq('id',S.assemblyId).select('id').single():await sb.from('chem_assembled_papers').insert(data).select('id').single();
  if(result.error)throw result.error;S.assemblyId=result.data.id;msg('assembleMessage','组卷草稿已保存。','success');toast('组卷草稿已保存');await loadAssemblies();
 }catch(e){msg('assembleMessage',fail(e),'error')}
}
async function loadAssemblies(){
 try{const {data,error}=await sb.from('chem_assembled_papers').select('id,title,description,status,updated_at,paper_data').order('updated_at',{ascending:false}).limit(100);if(error)throw error;S.assemblies=data||[];
 $('assemblySaved').innerHTML=S.assemblies.length?S.assemblies.map(a=>'<div class="pool-row"><span class="pool-text"><b>'+esc(a.title)+'</b><small>'+((a.paper_data?.items||[]).length)+' 道题 · '+esc(fmt(a.updated_at))+'</small></span><div class="row-actions"><button class="soft" data-open-assembly="'+a.id+'">打开</button><button class="danger" data-del-assembly="'+a.id+'">删除</button></div></div>').join(''):'<div class="empty">暂无已保存组卷。</div>';
 document.querySelectorAll('[data-open-assembly]').forEach(b=>b.onclick=()=>openAssembly(b.dataset.openAssembly));
 document.querySelectorAll('[data-del-assembly]').forEach(b=>b.onclick=()=>deleteAssembly(b.dataset.delAssembly));
 }catch(e){$('assemblySaved').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
async function openAssembly(id){
 const {data,error}=await sb.from('chem_assembled_papers').select('*').eq('id',id).single();if(error)return toast(fail(error));
 S.assemblyId=id;$('assembleTitle').value=data.title;$('assembleDescription').value=data.description||'';S.basket=data.paper_data?.items||[];renderBasket();go('assemble');
}
async function deleteAssembly(id){
 if(!confirm('确认删除这份组卷草稿？'))return;
 try{const {error}=await sb.from('chem_assembled_papers').delete().eq('id',id);if(error)throw error;toast('组卷草稿已删除');if(S.assemblyId===id){S.assemblyId=null;S.basket=[];renderBasket()}await loadAssemblies()}catch(e){toast(fail(e))}
}
function assemblyHtml(){
 const title=esc($('assembleTitle').value||'仁爱通组卷');
 const items=S.basket.map((q,i)=>'<section style="margin:18px 0;page-break-inside:avoid"><p><b>'+(i+1)+'. '+esc(q.stem)+'</b>（'+Number(q.score||0)+'分）</p>'+((q.options||[]).map(o=>'<p style="margin:4px 20px">'+esc(o.key||'')+'．'+esc(o.text||o)+'</p>').join(''))+'</section>').join('');
 return '<!doctype html><html><meta charset="utf-8"><title>'+title+'</title><body style="font-family:Microsoft YaHei,Arial;line-height:1.8;max-width:850px;margin:30px auto"><h1 style="text-align:center">'+title+'</h1><p>'+esc($('assembleDescription').value)+'</p>'+items+'</body></html>';
}
async function exportAssemblyDocx(){
 if(!S.basket.length)return toast('试题篮为空。');
 if(!window.docx?.Document||!window.docx?.Packer)return toast('DOCX 组件未加载，请检查网络后重试。');
 try{
  const children=[new docx.Paragraph({text:$('assembleTitle').value||'仁爱通组卷',heading:docx.HeadingLevel.TITLE}),new docx.Paragraph({text:$('assembleDescription').value||''})];
  S.basket.forEach((q,i)=>{
   children.push(new docx.Paragraph({children:[new docx.TextRun({text:(i+1)+'. '+q.stem,bold:true}),new docx.TextRun({text:'（'+Number(q.score||0)+'分）'})]}));
   (q.options||[]).forEach(o=>children.push(new docx.Paragraph({text:String(o.key||'')+'．'+String(o.text||o),indent:{left:360}})));
   children.push(new docx.Paragraph({text:' '}));
  });
  const doc=new docx.Document({sections:[{children}]});
  const blob=await docx.Packer.toBlob(doc);download('仁爱通组卷.docx',blob);
 }catch(e){toast('DOCX 导出失败：'+fail(e))}
}
function exportAssemblyXlsx(){
 if(!S.basket.length)return toast('试题篮为空。');
 const rows=S.basket.map((q,i)=>({'题号':i+1,'题型':q.section,'题干':q.stem,'选项JSON':JSON.stringify(q.options||[]),'答案':JSON.stringify(q.answer_key),'解析':q.explanation,'分值':q.score,'来源试卷':q.paper_title,'答案核验状态':q.verification_status}));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'组卷题目');XLSX.writeFile(wb,'仁爱通组卷.xlsx');
}
function printAssembly(){
 if(!S.basket.length)return toast('试题篮为空。');
 const w=window.open('','_blank');if(!w)return toast('请允许浏览器打开打印窗口。');
 w.document.write(assemblyHtml());w.document.close();w.focus();w.print();
}
async function loadAudit(){
 try{const {data,error}=await sb.from('rt_audit_logs').select('id,actor_id,action,entity_type,entity_id,details,created_at').order('created_at',{ascending:false}).limit(300);if(error)throw error;
 $('auditTable').innerHTML=data.length?'<table><thead><tr><th>时间</th><th>操作</th><th>对象类型</th><th>对象编号</th><th>操作者</th><th>详情</th></tr></thead><tbody>'+data.map(x=>'<tr><td>'+esc(fmt(x.created_at))+'</td><td><b>'+esc(x.action)+'</b></td><td>'+esc(x.entity_type)+'</td><td>'+esc(x.entity_id||'—')+'</td><td>'+esc(x.actor_id||'系统')+'</td><td>'+esc(JSON.stringify(x.details||{}).slice(0,400))+'</td></tr>').join('')+'</tbody></table>':'<div class="empty">暂无审计记录。</div>';
 }catch(e){$('auditTable').innerHTML='<div class="empty">'+esc(fail(e))+'</div>'}
}
async function loadAuthSettings(){
 try{
  const mode=await sb.rpc('rt_get_signup_mode');if(mode.error)throw mode.error;$('registrationMode').value=mode.data||'open';
  const {data,error}=await sb.from('rt_app_settings').select('value').eq('key','auth').maybeSingle();if(error)throw error;
  $('siteUrlSetting').value=data?.value?.site_url||ROOT;
 }catch(e){msg('settingsMessage',fail(e),'error')}
}
async function saveAuthSettings(){
 try{const mode=$('registrationMode').value,url=$('siteUrlSetting').value.trim();if(!url.startsWith('https://'))throw new Error('站点地址必须使用 HTTPS。');
  const {error}=await sb.rpc('rt_admin_set_registration_mode',{p_mode:mode});if(error)throw error;
  const {error:e2}=await sb.rpc('rt_admin_set_site_url',{p_url:url});if(e2)throw e2;
  msg('settingsMessage','认证策略和主站地址已保存。SMTP、邮件模板和 Auth Redirect URLs 需按下方说明在 Supabase Auth 设置中核对。','success');toast('认证设置已保存');
 }catch(e){msg('settingsMessage',fail(e),'error')}
}
async function loadMfa(){
 try{
  const {data,error}=await sb.auth.mfa.listFactors();if(error)throw error;
  const verified=(data.totp||[]).filter(x=>x.status==='verified');S.currentMfa=verified[0]||null;
  $('mfaStatus').textContent=verified.length?'已绑定 '+verified.length+' 个动态验证码设备。登录后需在验证器输入动态码。':'当前管理员账号尚未绑定 Google Authenticator，建议立即绑定。';
  $('mfaStatus').className='inline-message '+(verified.length?'success':'warning');
  $('enrollTotp').textContent=verified.length?'新增验证器':'绑定动态验证码';
 }catch(e){msg('mfaStatus','读取 MFA 状态失败：'+fail(e),'error')}
}
async function enrollTotp(){
 try{
  const {data,error}=await sb.auth.mfa.enroll({factorType:'totp',friendlyName:'Renaitong OA Google Authenticator'});if(error)throw error;
  const {data:challenge,error:cError}=await sb.auth.mfa.challenge({factorId:data.id});if(cError)throw cError;
  S.pendingFactor={id:data.id,challengeId:challenge.id};
  $('mfaQr').src=data.totp.qr_code;$('mfaSecret').textContent='手动密钥：'+data.totp.secret;$('mfaEnrollment').classList.remove('hidden');
  msg('mfaStatus','请扫描二维码并输入 6 位动态码确认绑定。','warning');
 }catch(e){msg('mfaStatus',fail(e),'error')}
}
async function verifyTotp(){
 const code=$('mfaCode').value.trim();if(!/^\d{6}$/.test(code))return toast('请输入 6 位动态验证码。');
 if(!S.pendingFactor)return toast('请先点击绑定动态验证码。');
 try{
  const {error}=await sb.auth.mfa.verify({factorId:S.pendingFactor.id,challengeId:S.pendingFactor.challengeId,code});if(error)throw error;
  S.pendingFactor=null;$('mfaEnrollment').classList.add('hidden');$('mfaCode').value='';toast('Google Authenticator 绑定成功');await sb.auth.refreshSession();await loadMfa();
 }catch(e){toast(fail(e))}
}
async function logout(){if(!confirm('确定退出 OA 并退出仁爱通账号？'))return;await sb.auth.signOut();location.replace(ROOT)}
sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')location.replace(ROOT)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.dialog').forEach(x=>x.classList.add('hidden'))});
init();
})();