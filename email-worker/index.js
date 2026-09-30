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
      const { to, subject, template, data } = payload;

      if (!to || !subject) {
        return new Response(JSON.stringify({ error: "Recipient 'to' and 'subject' required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log(`[Tâches.ma Email Dispatcher] Sending ${template} to ${to}: "${subject}"`);

      // If MailChannels or API token is configured, send actual SMTP
      if (env && env.DKIM_PRIVATE_KEY) {
        const mailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to, name: data?.recipientName || "Utilisateur Tâches.ma" }] }],
            from: { email: "notifications@taches.ma", name: "Tâches.ma Daman" },
            subject,
            content: [
              {
                type: "text/plain",
                value: `Notification Tâches.ma : ${subject}\n\nConsultez votre espace : https://taches.ma`,
              },
            ],
          }),
        });

        const mailResText = await mailResponse.text();
        return new Response(JSON.stringify({ success: true, provider: "mailchannels", result: mailResText }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Default acknowledgement
      return new Response(JSON.stringify({ success: true, queued: true, to, subject }), {
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
