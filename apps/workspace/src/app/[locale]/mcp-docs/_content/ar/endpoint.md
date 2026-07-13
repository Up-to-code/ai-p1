---
title: "مسار MCP المحمي بـ OAuth"
label: "المسار"
description: "بوابة كانترا تقبل رموز OAuth المرتبطة بمورد MCP فقط."
---

- **رابط الخادم:** `https://app.qentrah.com/api/mcp`
- **النقل:** Streamable HTTP
- **المصادقة:** OAuth 2.1 مع Authorization Code وPKCE
- **خادم التفويض:** `https://app.qentrah.com/api/auth`
- **الاكتشاف:** `https://app.qentrah.com/.well-known/oauth-protected-resource/api/mcp`

الطلبات بلا رمز صالح تحصل على استجابة `401` تشير إلى بيانات المورد المحمي.
