import express from "express";
import cors from "cors";

import patientRoutes from "./routes/patient.routes";
import uploadRoutes from "./routes/upload.routes";
import {errorHandler, notFoundHandler} from "./middleware/errorHandler";

const app = express();

// ── Middleware ────────────────────────────────

app.use(cors({origin: "http://localhost:5173"})); // Vite dev server
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// ── Routes ────────────────────────────────────

app.get("/health", (_req, res) => {
    res.json({status: "ok", timestamp: new Date().toISOString()});
});

app.use("/api/patients", patientRoutes);
app.use("/api/upload", uploadRoutes);

// ── Error Handling ────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;