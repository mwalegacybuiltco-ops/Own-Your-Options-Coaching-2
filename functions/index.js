import OpenAI from "openai";
import { initializeApp } from "firebase-admin/app";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";

initializeApp();

const openAiApiKey = defineSecret("OPENAI_API_KEY");
const openAiModel = defineString("OPENAI_MODEL", { default: "gpt-5" });

const coachStyles = {
  maya:
    "Maya is warm, nurturing, emotionally grounding, gently direct, and helps the member feel safe before choosing the next honest option.",
  elena:
    "Elena is intuitive, visionary, future-self focused, manifestation-aware, and helps the member connect desire, identity, and aligned expansion.",
  marcus:
    "Marcus is steady, practical, accountability-oriented, and helps the member turn clarity into simple structure and daily evidence.",
  noah:
    "Noah is strategic, encouraging, purpose-driven, and helps the member connect life, business, leadership, and freedom into one grounded plan."
};

export const askCoach = onCall({ secrets: [openAiApiKey], timeoutSeconds: 60 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in before using the AI coach.");
  }

  const data = request.data || {};
  const message = cleanText(data.message, 1200);
  if (!message) {
    throw new HttpsError("invalid-argument", "Ask the coach a question first.");
  }

  const coach = data.coach || {};
  const user = data.user || {};
  const memory = data.memory || {};
  const currentLife = data.currentLife || {};
  const coachName = cleanText(coach.name, 40) || "OYO Coach";
  const coachStyle = coachStyles[coach.id] || cleanText(coach.background, 320) || coachStyles.maya;
  const memberName = cleanText(user.name, 60) || "there";
  const premiumAccess = Boolean(data.premiumAccess);

  const client = new OpenAI({ apiKey: openAiApiKey.value() });
  const response = await client.responses.create({
    model: openAiModel.value(),
    input: [
      {
        role: "system",
        content: [
          "You are the live AI coach inside OYO Compass by Own Your Options.",
          `You are ${coachName}. ${coachStyle}`,
          "Coach the whole person: life, self-trust, future self, confidence, relationships, wellbeing, goals, daily action, purpose, money mindset, and business as one option inside a larger life.",
          "Respond as if you are sitting with the member: personal, warm, specific, emotionally intelligent, and practical.",
          "Do not give generic loops. Answer the exact question first, reflect what you heard, then give a reframe, one tiny action, and one follow-up question.",
          "Use the phrase Own Your Options naturally when useful, but do not overuse it.",
          "If the member asks about LWA, frame it as an optional business pathway inside a whole-life vision.",
          premiumAccess
            ? "The member has premium access, so you may suggest deeper NLP-inspired exercises, belief ladders, parts work, future pacing, and LWA pathway exploration."
            : "The member is on the free plan, so keep premium references light and useful without implying they already have paid content.",
          "You are coaching, not replacing therapy or professional medical, legal, or financial advice. For safety, encourage professional support where appropriate.",
          "Keep the answer under 220 words unless the member asks for a longer plan."
        ].join("\n")
      },
      {
        role: "user",
        content: JSON.stringify({
          memberName,
          question: message,
          memory: compactObject(memory),
          currentLife: compactObject(currentLife),
          recentConversation: compactMessages(data.recentMessages)
        })
      }
    ]
  });

  return {
    reply:
      response.output_text ||
      `${coachName} here, ${memberName}. I hear you. Name the option you want to own, choose one tiny action, and tell me what feels hardest about starting.`
  };
});

function cleanText(value, limit) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function compactMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.slice(-10).map((message) => ({
    role: message.role === "user" ? "user" : "coach",
    text: cleanText(message.text, 600)
  }));
}

function compactObject(value) {
  return JSON.parse(JSON.stringify(value || {}));
}
