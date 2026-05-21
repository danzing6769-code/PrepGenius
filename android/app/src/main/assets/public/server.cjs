var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_url = require("url");
var import_helmet = __toESM(require("helmet"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_meta = {};
import_dotenv.default.config();
var resolvedDirname = typeof import_meta !== "undefined" && import_meta.url ? import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url)) : __dirname;
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.set("trust proxy", 1);
  app.use((0, import_helmet.default)({
    contentSecurityPolicy: false
  }));
  app.use((0, import_cors.default)());
  app.use(import_express.default.json());
  const apiLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: false
  });
  app.use("/api/", apiLimiter);
  app.post("/api/generate-test", async (req, res) => {
    try {
      const { examType, subjects, difficulty, numberOfQuestions, includePYQ, onlyPYQ, chapters, includeSubjective, instituteStyle } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const systemInstruction = `You are an expert examiner for competitive exams in India like NEET (Medical) and IAT (IISER Science). Always provide high quality, realistic MCQ questions. Provide detailed explanations for each question.`;
      let difficultyContext = "";
      if (difficulty === "Foundational") {
        difficultyContext = "Focus on basic concepts, direct formula applications, and fundamental understanding.";
      } else if (difficulty === "Intense") {
        difficultyContext = "Focus on complex, multi-concept problems, trick questions, and advanced applications.";
      } else {
        difficultyContext = "Provide a balanced mix of easy, medium, and hard questions typical of the actual exam.";
      }
      let pyqContext = "";
      if (includePYQ && onlyPYQ) {
        pyqContext = `IMPORTANT: This test must consist EXCLUSIVELY of real Previous Year Questions (PYQs) from past ${examType} exams. Prefix every single question text with the year it was asked (e.g. "[NEET 2021] What is..."). Do not generate any new or mock questions.`;
      } else if (includePYQ) {
        pyqContext = `IMPORTANT: Where possible, use real Previous Year Questions (PYQs) from past ${examType} exams. Prefix the question text with the year if it is a PYQ (e.g. "[NEET 2021] What is...").`;
      }
      console.log(`Generating test with difficulty: ${difficulty}`);
      let instituteContext = "";
      if (instituteStyle && instituteStyle !== "None") {
        if (instituteStyle === "Arihant") {
          instituteContext = `IMPORTANT: Simulate the standard question style, difficulty nuances, trick potential, and typical patterns found in the popular Arihant publication books (like 33 Years Chapterwise Solutions, Master the NCERT) for ${examType}.`;
        } else {
          instituteContext = `IMPORTANT: Simulate the question style, difficulty nuances, trick potential, and typical patterns found in the flagship test series of ${instituteStyle} institute for ${examType}.`;
        }
      }
      let syllabusContext = `The test should ONLY cover these subjects: ${subjects.join(", ")}.`;
      if (chapters && Object.keys(chapters).length > 0) {
        syllabusContext = `The test should cover the following specific sub-topics/chapters. If a subject is listed without chapters, cover the entire syllabus for that subject:`;
        subjects.forEach((subj) => {
          if (chapters[subj] && chapters[subj].length > 0) {
            syllabusContext += `
- ${subj}: ${chapters[subj].join(", ")}`;
          } else {
            syllabusContext += `
- ${subj}: Entire Syllabus`;
          }
        });
      }
      let questionFormatContext = "Generate multiple-choice (Objective) questions.";
      if (includeSubjective) {
        questionFormatContext = "Generate a mix of Objective (multiple-choice) and Subjective (text-based answer) questions. Subjective questions should NOT have options and MUST provide a 'correctAnswerText' field instead of 'correctAnswerIndex'. 'type' must be either 'Objective' or 'Subjective'.";
      }
      const contents = `Generate exactly ${numberOfQuestions} questions for the ${examType} exam. ${questionFormatContext} ${syllabusContext} ${difficultyContext} ${pyqContext} ${instituteContext} The expected difficulty format should match the context overall.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              questions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING, description: "A unique identifier for this question, e.g. q1, q2" },
                    subject: { type: import_genai.Type.STRING, description: "The subject of the question (e.g. Physics, Chemistry, Biology, Mathematics)" },
                    chapter: { type: import_genai.Type.STRING, description: "The specific chapter or topic from the syllabus this question maps to." },
                    type: { type: import_genai.Type.STRING, description: "Must be 'Objective' or 'Subjective'." },
                    text: { type: import_genai.Type.STRING, description: "The question text, avoiding complex latex, use plain text with utf8 math symbols if needed." },
                    options: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Required if type is Objective. Exactly 4 options." },
                    correctAnswerIndex: { type: import_genai.Type.INTEGER, description: "Required if type is Objective. 0-based index of the correct option (0, 1, 2, or 3)" },
                    correctAnswerText: { type: import_genai.Type.STRING, description: "Required if type is Subjective. The correct answer in text format." },
                    explanation: { type: import_genai.Type.STRING, description: "Detailed explanation of the correct answer" }
                  },
                  required: ["id", "subject", "chapter", "type", "text", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("No text response from model");
      }
      let testData;
      try {
        testData = JSON.parse(textResponse);
      } catch (e) {
        throw new Error("Failed to parse JSON target");
      }
      res.json(testData);
    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate mock test. Please try again." });
    }
  });
  app.post("/api/evaluate-subjective", async (req, res) => {
    try {
      const { questionText, userAnswer, correctAnswerText } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      if (!questionText || !userAnswer || !correctAnswerText) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      const systemInstruction = `You are an expert educator evaluator. Evaluate the student's answer to the given question by comparing it with the provided correct answer. Give constructive feedback, mentioning what the student got right and what they missed. Keep it concise.`;
      const contents = `Question: ${questionText}

Student Answer: ${userAnswer}

Actual Correct Answer/Key Points: ${correctAnswerText}

Evaluate the student's answer based on the actual correct answer. Grade it roughly as Correct, Partially Correct, or Incorrect, and give detailed feedback.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              grade: { type: import_genai.Type.STRING, description: "One of: 'Correct', 'Partially Correct', 'Incorrect'" },
              feedback: { type: import_genai.Type.STRING, description: "Detailed, nuanced feedback explaining what the student got right, what was missing, and how to improve." }
            },
            required: ["grade", "feedback"]
          }
        }
      });
      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("No text response from model");
      }
      res.json(JSON.parse(textResponse));
    } catch (error) {
      console.error("AI Evaluation Error:", error);
      res.status(500).json({ error: "Failed to evaluate answer. Please try again." });
    }
  });
  app.post("/api/generate-notes", async (req, res) => {
    try {
      const { subject, chapter, notesStyle } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      if (!subject || !chapter) {
        return res.status(400).json({ error: "Subject and Chapter are required." });
      }
      let systemInstruction = `You are an expert educator producing comprehensive, deeply detailed study notes and last-minute revision materials for competitive exams like NEET and JEE/IAT. Break down the chapter into in-depth concepts, provide detailed explanations, comprehensive bullet points covering nuances and rules, specific examples, common pitfalls, and critical formulas. The notes should be rich and informative.`;
      let contents = `Generate comprehensive, detailed revision notes for the chapter "${chapter}" in the subject "${subject}". Emphasize deep concept understanding, key facts, exceptions, examples, and important formulas. Provide highly detailed explanations.`;
      if (notesStyle === "Arihant Short Notes") {
        systemInstruction = `You are an expert educator producing highly concise, rapid-review "short notes" specifically styled after the Arihant publication revision books for competitive exams like NEET and JEE/IAT. The notes should be crisp, point-wise, directly hitting the frequently asked questions, with no fluff, prioritizing pure facts, direct formula application, and quick-to-read tables or bullets.`;
        contents = `Generate 'Arihant style' short notes for the chapter "${chapter}" in the subject "${subject}". Focus purely on concise, high-yield pointers, standard question formats from Arihant books, rapid revision points, direct formulas, and crucial exceptions used in trick questions. Keep explanations extremely short and punchy.`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING, description: "Main title of the detailed notes" },
              topics: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    heading: { type: import_genai.Type.STRING },
                    explanation: { type: import_genai.Type.STRING, description: "Detailed explanation of the core concept" },
                    points: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Thorough bullet points covering nuances, mechanisms, facts, and rules" },
                    examples: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Specific examples or applications of the concept" },
                    commonPitfalls: { type: import_genai.Type.STRING, description: "Common mistakes, misconceptions, or important exceptions" },
                    importantFormula: { type: import_genai.Type.STRING, description: "Any key formula for this topic, if applicable. Can be empty." }
                  },
                  required: ["heading", "explanation", "points"]
                }
              }
            },
            required: ["title", "topics"]
          }
        }
      });
      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("No text response from model");
      }
      res.json(JSON.parse(textResponse));
    } catch (error) {
      console.error("AI Notes Generation Error:", error);
      res.status(500).json({ error: "Failed to generate notes. Please try again." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(resolvedDirname, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
