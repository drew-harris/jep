import indexHtml from "../public/index.html";
import { serve } from "bun";
import type { Message, MessageType } from "./types";
import { handlers } from "./serverHandleMessage";
import { game, initialState, type Question } from "./state";
import { db, applyMigrations } from "./db";
import { gameState as gameStateTable, questions as questionsTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { questions as initialQuestionsData } from "./questions"; // Assuming questions.tsx exports this

const wsClients: Bun.ServerWebSocket<unknown>[] = [];

async function loadAndInitializeGameState() {
  try {
    console.log("Loading and initializing game state from database...");

    // 1. Questions Handling
    let allDbQuestions = await db.select().from(questionsTable).all();

    if (allDbQuestions.length === 0) {
      console.log("No questions found in DB, populating from initial data...");
      const questionsToInsert = initialQuestionsData.map(q => ({
        id: q.id, // Assuming Question type and schema have matching ID types
        worth: q.worth,
        questionText: q.questionText,
        answerText: q.answerText,
        category: q.category,
        isAnswered: q.isAnswered || false, // Default to false if undefined
      }));
      await db.insert(questionsTable).values(questionsToInsert);
      allDbQuestions = await db.select().from(questionsTable).all();
      console.log(`${allDbQuestions.length} questions inserted into DB.`);
    } else {
      console.log(`Found ${allDbQuestions.length} questions in DB.`);
    }

    // 2. Game State Handling
    // Try to get the game state with id 1. We expect only one row.
    let persistedGameStateArray = await db.select().from(gameStateTable).where(eq(gameStateTable.id, 1)).limit(1).all();
    let persistedGameState = persistedGameStateArray[0];

    if (!persistedGameState) {
      console.log("No game state found in DB, inserting default state...");
      const newGameState = {
        id: 1, // Explicitly set id for the single game state row
        currentQuestionId: null,
        scores: {},
        allowBuzz: false,
        showingCode: false,
      };
      await db.insert(gameStateTable).values(newGameState);
      persistedGameStateArray = await db.select().from(gameStateTable).where(eq(gameStateTable.id, 1)).limit(1).all();
      persistedGameState = persistedGameStateArray[0];
      console.log("Default game state inserted.");
    } else {
      console.log("Found persisted game state:", persistedGameState);
    }
    
    if (!persistedGameState) {
      // This case should ideally not be reached if insert was successful
      console.error("CRITICAL: Failed to load or create game state. Using default initial state.");
      game.setState(initialState); // Fallback to default in-memory state
      return;
    }

    // 3. Reconstruct Zustand State
    let currentQuestion: Question | null = null;
    if (persistedGameState.currentQuestionId) {
      currentQuestion = allDbQuestions.find(q => q.id === persistedGameState.currentQuestionId) || null;
    }

    const playedQuestions: string[] = allDbQuestions
      .filter(q => q.isAnswered)
      .map(q => q.id);

    const reconstructedState = {
      currentQuestion,
      // Ensure scores is an object, even if DB returns null/undefined (though schema has default ' {}')
      scores: persistedGameState.scores || {}, 
      playedQuestions,
      allowBuzz: persistedGameState.allowBuzz,
      showingCode: persistedGameState.showingCode,
      count: initialState.count, // Keep count as default from initial in-memory state
       // Ensure questions are loaded into the Zustand state as well
      questions: allDbQuestions.map(q => ({
        id: q.id,
        worth: q.worth,
        questionText: q.questionText,
        answerText: q.answerText,
        category: q.category,
        isAnswered: q.isAnswered,
      })),
    };

    // 4. Update Zustand Store
    game.setState(reconstructedState);
    console.log("Zustand store initialized with persisted game state.");

  } catch (error) {
    console.error("Failed to load and initialize game state:", error);
    // Fallback to default initial state if any error occurs during DB operations
    console.log("Falling back to default in-memory initial state due to error.");
    game.setState(initialState);
  }
}

// Apply migrations and then load game state before starting the server
console.log("Starting server initialization...");
try {
  await applyMigrations(); // Apply any pending DB migrations
  await loadAndInitializeGameState(); // Load game state from DB
} catch (e) {
    console.error("Critical error during server initialization:", e);
    process.exit(1); // Exit if migrations or initial state load fails
}

const server = serve({
  websocket: {
    open(ws) {
      wsClients.push(ws);
      console.info(`Client connected`);

      // send a sync message
      ws.send(
        JSON.stringify({
          type: "sync",
          data: game.getState(),
        }),
      );
    },
    close(ws, code, reason) {
      wsClients.splice(wsClients.indexOf(ws), 1);
      console.log(`Client disconnected: ${code} ${reason}`);
    },
    async message(ws, message) {
      // Handle message
      if (typeof message !== "string") {
        return;
      }
      const parsedJson = JSON.parse(message) as Message<any>;
      console.log("Parsed JSON:", parsedJson);

      const type = parsedJson.type as MessageType;

      // Get handler
      const handler = handlers[type];
      if (!handler) {
        console.warn(`No handler for message type ${type}`);
        return;
      }

      // Build broadcast function
      const broadcast = (
        type: MessageType,
        data: Message<MessageType>["data"],
        inclusive = false,
      ) => {
        const messageString = JSON.stringify({
          type,
          data,
        });
        wsClients.forEach((client) => {
          if (inclusive || client !== ws) {
            client.send(messageString);
          }
        });
      };

      // Send the message to everyone else
      const spread = () => {
        wsClients.forEach((client) => {
          if (client !== ws) {
            client.send(message);
          }
        });
      };

      // Call handler
      handler(parsedJson.data, broadcast, spread, ws);

      // Push state eventually?
      broadcast("sync", game.getState(), true);
    },
  },
  routes: {
    "/": indexHtml,
    "/app": indexHtml,
    "/ws": (req, server) => {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }

      // handle HTTP request normally
      return new Response("Hello world!");
    },
    "/app/*": indexHtml,
    "/hello": async () => {}, // This was an empty route, can be kept or removed
  },
  port: 3000,
  development: process.env.NODE_ENV !== "production",
});

console.log("Server started on port 3000 after state initialization.");
