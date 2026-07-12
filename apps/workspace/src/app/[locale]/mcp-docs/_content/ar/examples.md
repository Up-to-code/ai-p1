---
title: "كيف تساعدك الوكلاء المختلفة"
label: "أمثلة الوكلاء"
description: "استخدم نفس رابط مؤسسة كانترا مع الوكلاء المشهورين أو مع مساعدك الداخلي الخاص."
---

يمكن للوكلاء المختلفين استخدام رابط كانترا، لكن الأفضل إنشاء روابط منفصلة عندما يختلف الغرض. مساعد المبيعات ومساعد المورد والأتمتة الداخلية لا يجب أن يتشاركوا مفتاحاً واسعاً واحداً.

## أمثلة إعداد تقنية

### ChatGPT
مناسب لعضو فريق غير تقني يسأل أسئلة أو يكتب متابعات أو يلخص السجلات المسموحة.

* **اسم الموصّل**: `Qentrah organization`
* **رابط الموصّل**: `https://mcp.qentrah.com/mcp`
* **النطاق المقترح**: الأدوات المحددة فقط عند إنشاء الرابط.

### Claude
مناسب لمراجعة الملاحظات الطويلة وتسليمات الموردين والسياسات وسياق العملاء المفصل.

* **الاسم**: `Qentrah organization`
* **رابط MCP البعيد**: `https://mcp.qentrah.com/mcp`
* **ملاحظات**: سحابة Claude يجب أن تكون قادرة على الوصول لهذا الرابط عبر HTTPS.

### Grok / xAI
مناسب لسير عمل سحابي مخصص يحتاج نفس أدوات كانترا المسموحة.

```json
{
  "model": "grok-4.3",
  "input": "Summarize available assets for this client.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://mcp.qentrah.com/mcp"
    }
  ]
}
```

### Codex أو Cursor أو وكلاء IDE
مناسب للفرق التقنية التي تبني أتمتة حول بيانات المؤسسة.

```bash
codex mcp add qentrah --url https://mcp.qentrah.com/mcp
codex mcp login qentrah
```

أو اكتبها في ملف الإعدادات:
```json
{
  "mcpServers": {
    "qentrah": {
      "url": "https://mcp.qentrah.com/mcp"
    }
  }
}
```

### OpenAI API
مناسب عندما يستدعي منتجك OpenAI ويربط كانترا كخادم MCP بعيد.

```json
{
  "model": "gpt-5",
  "input": "Check today's clients and prepare follow-up tasks.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://mcp.qentrah.com/mcp",
      "allowed_tools": ["organization_info", "clients_list", "tasks_create"],
      "require_approval": "never"
    }
  ]
}
```
