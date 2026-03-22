import type {FhirPatient, MioMeta} from "../types/fhir.types";
import {SYSTEMS} from "./constants";

export const mapGender = (hl7Gender: string): FhirPatient["gender"] => {
    const map: Record<string, FhirPatient["gender"]> = {
        M: "male", F: "female", O: "other", U: "unknown",
    };
    return map[hl7Gender.toUpperCase()] ?? "unknown";
};

export const toIsoDate = (hl7Date: string): string => {
    if (hl7Date.length === 8) {
        return `${hl7Date.slice(0, 4)}-${hl7Date.slice(4, 6)}-${hl7Date.slice(6, 8)}`;
    }
    return hl7Date;
};

/**
 * Konvertiert HL7-Datetime in ISO 8601.
 * Unterstützt alle gängigen HL7-Formate:
 *   YYYYMMDD           -> YYYY-MM-DDT00:00:00Z
 *   YYYYMMDDHHMM       -> YYYY-MM-DDTHH:MM:00Z
 *   YYYYMMDDHHMMSS     -> YYYY-MM-DDTHH:MM:SSZ
 *   201501260412-0600  -> 2015-01-26T04:12:00Z
 *   bereits ISO        -> unverändert
 */
export const toIsoDateTime = (hl7Dt: string): string => {
    if (!hl7Dt || hl7Dt.trim() === "") return new Date().toISOString();
    if (hl7Dt.includes("T") || /^\d{4}-/.test(hl7Dt)) return hl7Dt;
    const match = hl7Dt.match(/^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
    if (!match) return new Date().toISOString();
    const year = match[1] ?? "0000";
    const month = match[2] ?? "01";
    const day = match[3] ?? "01";
    const hour = match[4] ?? "00";
    const min = match[5] ?? "00";
    const sec = match[6] ?? "00";
    return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
};

export const resolveSystem = (system: string): string => {
    const map: Record<string, string> = {
        SCT: SYSTEMS.snomed,
        LN: SYSTEMS.loinc,
        UCUM: SYSTEMS.ucum,
        MDC: SYSTEMS.ieee,
    };
    return map[system] ?? SYSTEMS.local;
};

export const mioMeta = (profile: string): MioMeta => ({
    profile: [profile],
    lastUpdated: new Date().toISOString(),
    versionId: "1",
});
