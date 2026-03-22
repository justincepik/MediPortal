import type { Request, Response } from "express";
import { parseIdcoMessage }      from "../services/idco.parser";
import { transformIdcoToFhir }   from "../services/idco.transformer";
import { storeOnFhirServer }     from "../services/fhir.client";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;

    if (!file) {
        res.status(400).json({
            resourceType: "OperationOutcome",
            issue: [{ severity: "error", code: "required", details: { text: "Keine Datei übermittelt." } }],
        });
        return;
    }

    const content = file.buffer.toString("utf-8");

    try {
        // ── Schritt 1: Parsing ───────────────────
        console.log(`[Upload] Parsing IDCO-Datei: ${file.originalname}`);
        const parsed = parseIdcoMessage(content);

        // ── Schritt 2: Transformation ────────────
        console.log("[Upload] Transformiere IDCO → FHIR ...");
        const fhirResult = transformIdcoToFhir(parsed);

        // ── Schritt 3: FHIR-Server ───────────────
        console.log("[Upload] Speichere auf FHIR-Server ...");
        const stored = await storeOnFhirServer(fhirResult);

        res.status(200).json({
            success: true,
            fileName: file.originalname,
            stored: {
                patientId:          stored.patientId,
                deviceId:           stored.deviceId,
                observationCount:   stored.observationIds.length,
                diagnosticReportId: stored.diagnosticReportId,
            },
            // Return the full bundle so the frontend can optionally display it
            bundle: fhirResult.bundle,
        });

    } catch (err) {
        const message = (err as Error).message;
        console.error(`[Upload] Fehler: ${message}`);

        res.status(422).json({
            success: false,
            fileName: file.originalname,
            resourceType: "OperationOutcome",
            issue: [{ severity: "error", code: "processing", details: { text: message } }],
        });
    }
};