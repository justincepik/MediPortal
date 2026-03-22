import type { Request, Response } from "express";
import { fetchPatientDetail } from "../services/fhir.client";

export const getPatientDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const detail = await fetchPatientDetail(req.params["id"] ?? "");
        res.status(200).json(detail);
    } catch (err) {
        res.status(502).json({
            resourceType: "OperationOutcome",
            issue: [{
                severity: "error",
                code: "transient",
                details: { text: (err as Error).message },
            }],
        });
    }
};