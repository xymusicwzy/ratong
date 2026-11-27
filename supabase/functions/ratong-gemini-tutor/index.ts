import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://xymusicwzy.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getPublishableKey(): string {
  const legacy = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacy) return legacy;
  const raw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw);
      if (typeof keys.default === "string") return keys.default;
      const first = Object.values(keys).find((v) => typeof v === "string");
      if (typeof first === "string") return first;
    } catch { /* use explicit error below */ }
  }
  throw new Error("Supabase publishable key is not available to this function");
}

const SYSTEM = `你是“仁爱通 AI 助学老师”，服务于大学生英语学习与化学竞赛学习平台。
请先理解用户属于哪个业务模块，再提供清晰、准确、适合大学生的讲解。
英语模块：帮助词汇、语法、阅读、写作、听说训练；可以指出错误并给出练习。
竞赛模块：讲解化学基础理论、分析化学、实验安全、题目思路和计算过程；涉及实验安全时优先给出保守、规范的安全建议。
教师模块：可以辅助设计教学活动、练习题、答案与解析，但提醒教师审核后再发布。
回答用简体中文，除非用户明确要求英语；数学和化学公式优先使用 LaTeX。
不得编造来源、标准答案或实验数据；信息不足时明确说明。不要声称已经修改平台数据、发送邮件或执行外部操作。`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const origin = req.headers.get("origin") || "";
  if (origin && origin !== "https://xymusicwzy.github.io") {
    return json({ error: "Origin not allowed" }, 403);
  }

  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "请先登录仁爱通账号。" }, 401);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "AI 服务尚未配置 Gemini API Key，请管理员在 Supabase Edge Function Secrets 中设置 GEMINI_API_KEY。" }, 503);

    const url = Deno.env.get("SUPABASE_URL");
    if (!url) throw new Error("Supabase URL is not configured");
    const supabase = createClient(url, getPublishableKey(), {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = auth.slice(7);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "登录状态已失效，请重新登录。" }, 401);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.account_status !== "active") return json({ error: "账号未启用，暂不能使用 AI 助学。" }, 403);

    const body = await req.json();
    const moduleName = body?.module === "competition" ? "competition" : "english";
    const message = String(body?.message || "").trim();
    if (!message) return json({ error: "请输入问题后再发送。" }, 400);
    if (message.length > 6000) return json({ error: "单条问题请控制在 6000 字以内。" }, 413);

    const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];
    const historyText = history.map((item: any) => {
      const role = item?.role === "assistant" ? "助学老师" : "学生";
      const text = String(item?.text || "").slice(0, 2500);
      return text ? `${role}：${text}` : "";
    }).filter(Boolean).join("\n");
    const moduleLabel = moduleName === "competition" ? "学科竞赛中心（化学竞赛）" : "英语学习中心";
    const prompt = `${SYSTEM}\n\n当前业务模块：${moduleLabel}\n用户历史对话：\n${historyText || "（无）"}\n\n学生当前问题：\n${message}`;

    const { data: used, error: quotaError } = await supabase.rpc("ai_tutor_consume_quota", {
      p_user_id: userData.user.id,
      p_daily_limit: profile.role === "admin" || profile.role === "teacher" ? 60 : 20,
    });
    if (quotaError) {
      console.error("AI quota error:", quotaError.message);
      return json({ error: "AI 使用额度校验失败，请稍后重试。" }, 503);
    }

    const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash";
    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ model, input: prompt, store: false }),
    });
    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.status, JSON.stringify(result).slice(0, 1200));
      return json({ error: "Gemini 服务暂时不可用，请稍后重试；如持续失败请联系管理员检查模型权限与额度。" }, 502);
    }

    let answer = String(result?.output_text || "").trim();
    if (!answer && Array.isArray(result?.steps)) {
      answer = result.steps
        .filter((step: any) => step?.type === "model_output")
        .flatMap((step: any) => Array.isArray(step.content) ? step.content : [])
        .filter((part: any) => part?.type === "text")
        .map((part: any) => part.text || "")
        .join("\n")
        .trim();
    }
    if (!answer) return json({ error: "Gemini 没有返回可显示的文本，请重试。" }, 502);

    return json({ answer, model, used_today: used, daily_limit: profile.role === "admin" || profile.role === "teacher" ? 60 : 20 });
  } catch (error) {
    console.error("ratong-gemini-tutor:", error);
    return json({ error: "AI 助学服务发生异常，请稍后重试。" }, 500);
  }
});
