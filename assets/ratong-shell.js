(()=>{'use strict';
const ROOT='https://xymusicwzy.github.io/ratong/';
const URL='https://mfmmwfdccspibvekoodb.supabase.co';
const KEY='sb_publishable_83WSC0kHUHRLhTUDgxJEoQ_L9_ur8cS';
const client=window.supabase?.createClient(URL,KEY,{auth:{storageKey:'ratong-unified-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
const style=document.createElement('style');
style.textContent=`
#rtUnifiedBar{height:68px;position:sticky;top:0;z-index:9999;background:#142d42;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(14px,3vw,34px);box-shadow:0 6px 22px #102b4018;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif}
#rtUnifiedBar .rt-brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.6px}
#rtUnifiedBar .rt-mark{width:36px;height:36px;border-radius:11px;background:#d5b46b;color:#142d42;display:grid;place-items:center;font-size:18px}
#rtUnifiedBar nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#rtUnifiedBar a,#rtUnifiedBar button{border:0;background:transparent;color:#d6e2ea;text-decoration:none;border-radius:9px;padding:10px 13px;font:600 13px inherit;cursor:pointer}
#rtUnifiedBar a:hover,#rtUnifiedBar a.active{background:#ffffff1c;color:#fff}
#rtUnifiedBar .rt-user{font-size:12px;color:#d4e0e8;white-space:nowrap}
.layout,.app{grid-template-columns:minmax(0,1fr)!important}
.layout>.sidebar,.app>.sidebar{display:none!important}
.layout>.main,.app>.main{min-width:0!important;padding-top:0!important}
.layout .topbar,.app .topbar{display:none!important}
@media(max-width:760px){#rtUnifiedBar{height:auto;min-height:64px;align-items:flex-start;gap:8px;flex-direction:column;padding:10px 14px}#rtUnifiedBar nav{width:100%;overflow-x:auto;flex-wrap:nowrap}#rtUnifiedBar a{white-space:nowrap;padding:8px 10px}#rtUnifiedBar .rt-user{display:none}}
`;
document.head.appendChild(style);
const bar=document.createElement('header');bar.id='rtUnifiedBar';bar.innerHTML='<div class="rt-brand"><span class="rt-mark">仁</span><span>仁爱通 <small style="display:block;font-size:9px;letter-spacing:1.5px;color:#b9c9d4;font-weight:500">UNIFIED LEARNING PLATFORM</small></span></div><nav><a href="'+ROOT+'">平台首页</a><a href="'+ROOT+'modules/english/">英语学习</a><a href="'+ROOT+'modules/competition/">竞赛学习</a><a href="'+ROOT+'#templates">模板下载</a></nav><div class="rt-user" id="rtUnifiedUser">正在验证登录状态… <button id="rtUnifiedLogout">退出</button></div>';
document.body.insertBefore(bar,document.body.firstChild);
const path=location.pathname.includes('/modules/english/')?'english':'competition';
bar.querySelectorAll('nav a').forEach(a=>{if((path==='english'&&a.href.includes('/modules/english/'))||(path==='competition'&&a.href.includes('/modules/competition/')))a.classList.add('active')});
async function gate(){if(!client){location.replace(ROOT);return}try{const{data,error}=await client.auth.getSession();if(error||!data.session){location.replace(ROOT);return}const{data:p,error:pe}=await client.from('profiles').select('full_name,role,account_status').eq('id',data.session.user.id).maybeSingle();if(pe||!p||p.account_status!=='active'){await client.auth.signOut();location.replace(ROOT);return}document.getElementById('rtUnifiedUser').innerHTML=(p.full_name||data.session.user.email)+' · '+({admin:'管理员',teacher:'教师',student:'学生'}[p.role]||'学生')+' <button id="rtUnifiedLogout">退出</button>';document.getElementById('rtUnifiedLogout').onclick=async()=>{await client.auth.signOut();location.replace(ROOT)};}catch(e){console.error('统一身份校验失败',e);location.replace(ROOT)}}
gate();
})();