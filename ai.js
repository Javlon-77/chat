apiKey = 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
(function () {
  "use strict";

  async function askGrok({ apiKey, messages, model = "grok-3-mini" }) {
    if (!apiKey) throw new Error("Grok API kaliti kiritilmagan.");

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Sen AQLLI CHAT nomli foydali AI yordamchisan. Foydalanuvchiga o‘zbek tilida, tushunarli va aniq javob ber. Kod so‘ralsa kodni to‘liq ber."
          },
          ...messages
        ],
        temperature: 0.7
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("API javobini o‘qib bo‘lmadi.");
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || ("API xatosi: " + response.status));
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) throw new Error("Grok bo‘sh javob qaytardi.");
    return answer;
  }

  window.AQLLI_AI = Object.freeze({ askGrok });
})();
