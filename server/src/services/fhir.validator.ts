import { Fhir } from "fhir-tool";
import type { FhirPatient } from "@mediportal/shared";

// Singleton
const fhirClient = new Fhir();

// ── Types ─────────────────────────────────────

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// ── Validation ────────────────────────────────

export const validateResource = (resource: unknown): ValidationResult => {
    const result = fhirClient.validate(resource as object);

    const errors = (result.messages ?? [])
        .filter((m) => m.severity === "error")
        .map((m) => m.message ?? "Unbekannter Fehler");

    const warnings = (result.messages ?? [])
        .filter((m) => m.severity === "warning")
        .map((m) => m.message ?? "");

    return {
        valid: result.valid ?? errors.length === 0,
        errors,
        warnings,
    };
};

export const validatePatient = (resource: unknown): ValidationResult => {
    // Prüfe zuerst ob resourceType korrekt gesetzt ist
    if (
        typeof resource !== "object" ||
        resource === null ||
        (resource as { resourceType?: string }).resourceType !== "Patient"
    ) {
        return {
            valid: false,
            errors: [`resourceType muss "Patient" sein`],
            warnings: [],
        };
    }
    return validateResource(resource);
};

// ── XML ↔ JSON Konvertierung ──────────────────

export const xmlToFhirPatient = (xml: string): FhirPatient => {
    const obj = fhirClient.xmlToObj(xml);
    return obj as unknown as FhirPatient;
};

export const fhirPatientToXml = (patient: FhirPatient): string => {
    return fhirClient.objToXml(patient as object);
};

export const xmlToJson = (xml: string): string => {
    return fhirClient.xmlToJson(xml);
};