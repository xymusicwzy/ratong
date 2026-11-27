(()=>{'use strict';
const ROOT='https://xymusicwzy.github.io/ratong/';
const URL='https://mfmmwfdccspibvekoodb.supabase.co';
const KEY='sb_publishable_83WSC0kHUHRLhTUDgxJEoQ_L9_ur8cS';
const client=window.supabase?.createClient(URL,KEY,{auth:{storageKey:'ratong-unified-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
if(!client)return;
const style=document.createElement('style');
style.textContent=`
#rtUnifiedBar{min-height:68px;position:sticky;top:0;z-index:9999;background:#22294f;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(13px,3vw,34px);box-shadow:0 6px 22px #14204422;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif;gap:12px}
#rtUnifiedBar .rt-brand{display:flex;align-items:center;gap:10px;font-weight:800;white-space:nowrap;letter-spacing:.4px}
#rtUnifiedBar .rt-mark{width:36px;height:36px;border-radius:11px;background:#e7bc74;color:#252d54;display:grid;place-items:center;font-size:18px}
#rtUnifiedBar nav{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
#rtUnifiedBar a,#rtUnifiedBar button{border:0;background:transparent;color:#d6dafa;text-decoration:none;border-radius:9px;padding:9px 12px;font-family:inherit;font-size:12px;font-weight:650;cursor:pointer;box-shadow:none}
#rtUnifiedBar a:hover,#rtUnifiedBar a.active,#rtUnifiedBar button:hover{background:#ffffff1b;color:#fff}
#rtUnifiedBar .rt-user{font-size:11px;color:#e0e4fa;white-space:nowrap;display:flex;align-items:center;gap:7px}
#rtUnifiedBar .rt-user button{background:#ffffff18;color:#fff;border:1px solid #ffffff28;padding:7px 10px}
#rtSecurityOverlay{position:fixed;inset:0;z-index:10050;background:#161c3fbd;backdrop-filter:blur(4px);display:none;place-items:center;padding:16px;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif}
#rtSecurityOverlay.open{display:grid}
#rtSecurityCard{width:min(520px,100%);max-height:92vh;overflow:auto;background:#fff;border:1px solid #e4e7f2;border-radius:20px;padding:24px;box-shadow:0 25px 90px #11193645;color:#21284c}
#rtSecurityCard h2{font-size:21px;margin:0 0 7px}
#rtSecurityCard p{font-size:12px;color:#747b96;line-height:1.8}
#rtSecurityCard .rt-sec-status{padding:11px 13px;border-radius:11px;background:#f0f2ff;color:#525db6;font-size:12px;line-height:1.7;margin:12px 0}
#rtSecurityCard .rt-sec-qr{width:190px;height:190px;object-fit:contain;border:1px solid #e7e9f3;border-radius:12px;padding:7px;display:none;margin:12px 0}
#rtSecurityCard code{display:block;overflow-wrap:anywhere;padding:10px;background:#f6f7fb;border-radius:8px;color:#3d477e;font-size:12px}
#rtSecurityCard input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #dfe3ef;border-radius:10px;margin:9px 0;font:inherit}
#rtSecurityCard .rt-sec-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#rtSecurityCard button{border:0;border-radius:10px;padding:10px 14px;background:#424c9b;color:#fff;font-weight:700;cursor:pointer}
#rtSecurityCard button.secondary{background:#f0f1fa;color:#515b9f}
#rtSecurityCard button.danger{background:#fff0f2;color:#b34860}
#rtSecurityCard .rt-sec-error{color:#b44259;font-size:12px;line-height:1.7}
.layout,.app{grid-template-columns:248px minmax(0,1fr)!important}
.layout>.sidebar,.app>.sidebar{display:flex!important}
.layout>.main,.app>.main{min-width:0!important;padding-top:0!important}
.app>.sidebar{top:68px!important;height:calc(100vh - 68px)!important}
.layout .topbar,.app .topbar{display:none!important}
@media(max-width:760px){#rtUnifiedBar{min-height:62px;align-items:flex-start;gap:8px;flex-direction:column;padding:9px 12px}#rtUnifiedBar nav{width:100%;overflow-x:auto;flex-wrap:nowrap}#rtUnifiedBar a{white-space:nowrap;padding:8px 9px}#rtUnifiedBar .rt-user{display:none}.layout,.app{display:block!important}.layout>.sidebar,.app>.sidebar{top:0!important;height:100vh!important}}
`;
document.head.appendChild(style);
const bar=document.createElement('header');bar.id='rtUnifiedBar';
bar.innerHTML='<div class="rt-brand"><span class="rt-mark">仁</span><span>仁爱通 <small style="display:block;font-size:9px;letter-spacing:1.4px;color:#c0c7e2;font-weight:500">UNIFIED LEARNING PLATFORM</small></span></div><nav><a href="'+ROOT+'">平台首页</a><a href="'+ROOT+'modules/english/">英语学习</a><a href="'+ROOT+'modules/competition/">竞赛网</a><a id="rtOaLink" href="'+ROOT+'oa/" hidden>综合管理 OA</a></nav><div class="rt-user"><span id="rtUnifiedUser">正在验证身份…</span><button id="rtSecurityBtn" type="button">账号安全</button><button id="rtUnifiedLogout" type="button">退出</button></div>';
document.body.insertBefore(bar,document.body.firstChild);
const overlay=document.createElement('div');overlay.id='rtSecurityOverlay';
overlay.innerHTML='<section id="rtSecurityCard"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><div style="font-size:10px;letter-spacing:1.6px;color:#7079d8;font-weight:800">ACCOUNT SECURITY</div><h2>仁爱通账号安全中心</h2></div><button id="rtSecClose" class="secondary" type="button">关闭</button></div><p>绑定 Google Authenticator 或兼容的 TOTP 验证器，为账号增加动态验证码保护。</p><div id="rtSecStatus" class="rt-sec-status">正在读取安全状态…</div><img id="rtSecQr" class="rt-sec-qr" alt="动态验证码绑定二维码"><code id="rtSecSecret" hidden></code><input id="rtSecCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="请输入 6 位动态验证码" hidden><div id="rtSecError" class="rt-sec-error"></div><div class="rt-sec-actions"><button id="rtSecEnroll" type="button">绑定验证器</button><button id="rtSecVerify" type="button" hidden>确认绑定 / 验证</button><button id="rtSecRemove" class="danger" type="button" hidden>解除绑定</button><button id="rtSecRefresh" class="secondary" type="button">刷新状态</button></div></section>';
document.body.appendChild(overlay);
const $=id=>document.getElementById(id);
let activeFactor=null,pendingFactor=null,pendingChallenge=null,pendingRemoval=false,profile=null,session=null,forced=false;
function status(text,error=false){$('rtSecStatus').textContent=text;$('rtSecStatus').style.background=error?'#fff0f2':'#f0f2ff';$('rtSecStatus').style.color=error?'#b44259':'#525db6'}
function secError(t){$('rtSecError').textContent=t||''}
function openSecurity(force=false){forced=force;$('rtSecClose').hidden=force;overlay.classList.add('open');loadFactors()}
function closeSecurity(){if(forced)return;overlay.classList.remove('open')}
$('rtSecurityBtn').onclick=()=>openSecurity(false);$('rtSecClose').onclick=closeSecurity;$('rtSecRefresh').onclick=loadFactors;
async function loadFactors(){
 secError('');
 try{
  const {data,error}=await client.auth.mfa.listFactors();if(error)throw error;
  const factors=(data?.totp||[]),verified=factors.filter(x=>x.status==='verified');
  activeFactor=verified[0]||null;
  if(activeFactor){status('已绑定 '+verified.length+' 个动态验证码验证器。登录时会要求输入当前 6 位验证码。');$('rtSecEnroll').textContent='新增验证器';$('rtSecRemove').hidden=false}
  else{status('尚未绑定动态验证码。'+(profile?.role==='admin'?'OA 管理员建议先绑定验证器。':'可以在此绑定验证器。'));$('rtSecEnroll').textContent='绑定 Google Authenticator';$('rtSecRemove').hidden=true}
 }catch(e){status('无法读取 MFA 状态：'+(e.message||e),true)}
}
async function startEnroll(){
 secError('');
 try{
  const {data,error}=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'Renaitong Google Authenticator'});if(error)throw error;
  pendingFactor=data.id;
  const {data:ch,error:ce}=await client.auth.mfa.challenge({factorId:data.id});if(ce)throw ce;
  pendingChallenge=ch.id;
  $('rtSecQr').src=data.totp.qr_code;$('rtSecQr').style.display='block';
  $('rtSecSecret').hidden=false;$('rtSecSecret').textContent='手动密钥：'+data.totp.secret;
  $('rtSecCode').hidden=false;$('rtSecVerify').hidden=false;
  status('请使用验证器扫描二维码，然后输入验证器中显示的 6 位数字完成绑定。');
 }catch(e){secError(e.message||String(e))}
}
async function verifyCode(){
 const code=$('rtSecCode').value.trim();if(!/^\d{6}$/.test(code))return secError('请输入 6 位动态验证码。');
 if(!pendingFactor||!pendingChallenge)return secError('请先绑定验证器或等待验证器验证。');
 try{
  const {error}=await client.auth.mfa.verify({factorId:pendingFactor,challengeId:pendingChallenge,code});if(error)throw error;
  if(pendingRemoval){
   const {error:removeError}=await client.auth.mfa.unenroll({factorId:pendingFactor});if(removeError)throw removeError;
  }
  pendingFactor=null;pendingChallenge=null;pendingRemoval=false;$('rtSecCode').value='';$('rtSecQr').style.display='none';$('rtSecSecret').hidden=true;$('rtSecCode').hidden=true;$('rtSecVerify').hidden=true;
  await client.auth.refreshSession();status('验证器操作已完成。');await loadFactors();
  if(forced&&location.pathname.includes('/oa/')){location.reload();return}
  forced=false;$('rtSecClose').hidden=false;
  $('rtSecRemove').textContent='解除绑定';
 }catch(e){secError(e.message||String(e))}
}
async function verifyExistingFactor(){
 if(!activeFactor)return false;
 try{
  const {data,error}=await client.auth.mfa.challenge({factorId:activeFactor.id});if(error)throw error;
  pendingFactor=activeFactor.id;pendingChallenge=data.id;
  $('rtSecQr').style.display='none';$('rtSecSecret').hidden=true;$('rtSecCode').hidden=false;$('rtSecVerify').hidden=false;
  status('此账号已启用动态验证码。请输入验证器当前显示的 6 位代码继续。');
  openSecurity(true);
  return false;
 }catch(e){openSecurity(true);secError(e.message||String(e));return false}
}
async function removeFactor(){
 if(!activeFactor)return;
 try{
  const {data:ch,error}=await client.auth.mfa.challenge({factorId:activeFactor.id});if(error)throw error;
  pendingFactor=activeFactor.id;pendingChallenge=ch.id;pendingRemoval=true;
  $('rtSecCode').hidden=false;$('rtSecVerify').hidden=false;$('rtSecCode').value='';
  $('rtSecVerify').textContent='确认解除绑定';
  status('为保护账号，请输入验证器当前的 6 位动态码，确认解除。');
  secError('');
 }catch(e){secError(e.message||String(e))}
}
$('rtSecEnroll').onclick=startEnroll;$('rtSecVerify').onclick=verifyCode;$('rtSecRemove').onclick=removeFactor;
$('rtUnifiedLogout').onclick=async()=>{await client.auth.signOut();location.replace(ROOT)};
async function gate(){
 const path=location.pathname;
 const {data,error}=await client.auth.getSession();if(error||!data.session){location.replace(ROOT);return}
 session=data.session;
 const {data:p,error:pe}=await client.from('profiles').select('full_name,role,account_status').eq('id',session.user.id).maybeSingle();
 if(pe||!p||p.account_status!=='active'){await client.auth.signOut();location.replace(ROOT);return}
 profile=p;
 $('rtUnifiedUser').textContent=(p.full_name||session.user.email)+' · '+({admin:'管理员',teacher:'教师',student:'学生'}[p.role]||'学生');
 if(p.role==='admin')$('rtOaLink').hidden=false;
 if(path.includes('/oa/')&&p.role!=='admin'){location.replace(ROOT);return}
 const pathModule=path.includes('/modules/english/')?'english':path.includes('/modules/competition/')?'competition':'home';
 document.querySelectorAll('#rtUnifiedBar nav a').forEach(a=>{if((pathModule==='english'&&a.href.includes('/modules/english/'))||(pathModule==='competition'&&a.href.includes('/modules/competition/'))||(pathModule==='home'&&a.href===ROOT))a.classList.add('active')});
 const {data:factors}=await client.auth.mfa.listFactors();
 const verified=(factors?.totp||[]).filter(x=>x.status==='verified');
 if(path.includes('/oa/')&&p.role==='admin'&&!verified.length){openSecurity(true);status('为保护管理员工作台，首次进入 OA 前请先绑定 Google Authenticator。');return}
 const {data:aal}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(verified.length&&aal?.currentLevel!=='aal2'&&aal?.nextLevel==='aal2'){activeFactor=verified[0];await verifyExistingFactor()}
}
gate().catch(e=>{console.error('统一身份校验失败',e);location.replace(ROOT)});
})();