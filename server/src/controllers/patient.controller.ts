import type { Request, Response } from "express";
import {
    fetchPatientsFromFhirServer,
    fetchPatientByIdFromFhirServer,
} from "../services/fhir.client";

// GET /api/patients
// GET /api/patients?active=true
export const getPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query["active"] === "true";
        const bundle     = await fetchPatientsFromFhirServer(activeOnly);
        res.status(200).json(bundle);
    } catch (err) {
        res.status(502).json({
            resourceType: "OperationOutcome",
            issue: [{ severity: "error", code: "transient", details: { text: (err as Error).message } }],
        });
    }
};

// GET /api/patients/:id
export const getPatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const patient = await fetchPatientByIdFromFhirServer(req.params["id"] ?? "");
        res.status(200).json(patient);
    } catch (err) {
        res.status(404).json({
            resourceType: "OperationOutcome",
            issue: [{ severity: "error", code: "not-found", details: { text: (err as Error).message } }],
        });
    }
};