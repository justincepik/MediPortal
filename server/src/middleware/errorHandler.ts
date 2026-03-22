import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(`[Error] ${err.message}`);

    res.status(500).json({
        resourceType: "OperationOutcome",
        issue: [{
            severity: "error",
            code: "exception",
            details: { text: err.message ?? "An unexpected error occurred." },
        }],
    });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
    res.status(404).json({
        resourceType: "OperationOutcome",
        issue: [{
            severity: "error",
            code: "not-found",
            details: { text: "The requested endpoint does not exist." },
        }],
    });
};