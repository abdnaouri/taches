export default {
  // Inbound email forwarding
  async email(message, env, ctx) {
    const recipients = [
      "badaoui.ell.mehdi@gmail.com",
      "abdnaouri@gmail.com"
    ];

    for (const recipient of recipients) {
      await message.forward(recipient).catch(err => console.error("Email forward failed:", err));
    }
  },

  // Outbound transactional email dispatcher via HTTP POST API
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const payload = await request.json();
      const { to, recipientName, subject, html, text, template, data } = payload;

      if (!to || !subject) {
        return new Response(JSON.stringify({ error: "Recipient 'to' and 'subject' required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log(`[Tâches.ma Email Dispatcher] Sending ${template || 'notification'} to ${to}: "${subject}"`);

      // 1. If Resend API key is available in worker env
      if (env && env.RESEND_API_KEY) {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM || "Tâches.ma <notifications@taches.ma>",
            to: [to],
            subject,
            html: html || `<p>${subject}</p>`,
            text: text || subject,
          }),
        });

        const resendData = await resendRes.json();
        return new Response(JSON.stringify({ success: resendRes.ok, provider: "resend", data: resendData }), {
          status: resendRes.ok ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 2. If MailChannels DKIM is configured on Cloudflare
      if (env && env.DKIM_PRIVATE_KEY) {
        const contentParts = [];
        if (text) {
          contentParts.push({ type: "text/plain", value: text });
        }
        if (html) {
          contentParts.push({ type: "text/html", value: html });
        }
        if (contentParts.length === 0) {
          contentParts.push({
            type: "text/plain",
            value: `Notification Tâches.ma : ${subject}\n\nConsultez votre espace : https://taches.ma`,
          });
        }

        const mailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to, name: recipientName || data?.recipientName || "Utilisateur Tâches.ma" }] }],
            from: { email: "notifications@taches.ma", name: "Tâches.ma Daman" },
            subject,
            content: contentParts,
          }),
        });

        const mailResText = await mailResponse.text();
        return new Response(JSON.stringify({ success: mailResponse.ok, provider: "mailchannels", result: mailResText }), {
          status: mailResponse.ok ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 3. Fallback / Dev acknowledgement
      return new Response(JSON.stringify({
        success: true,
        queued: true,
        to,
        subject,
        htmlLength: html ? html.length : 0,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
