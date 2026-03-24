// ── MIO TM 1.0.0 Profil-URLs ─────────────────────────────────────────────────
// Quelle: https://fhir.kbv.de/StructureDefinition/

export const MIO_PROFILES = {
    patient: "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_TELE_Patient|1.0.0",
    device: "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_TELE_Device|1.0.0",
    observation: "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_TELE_Observation_Free|1.0.0",
    diagnosticReport: "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_TELE_DiagnosticReport|1.0.0",
} as const;


// ── Terminologie-Systeme ──────────────────────────────────────────────────────

export const SYSTEMS = {
    snomed: "http://snomed.info/sct",
    loinc: "http://loinc.org",
    ucum: "http://unitsofmeasure.org",
    ieee: "urn:oid:2.16.840.1.113883.6.24",   // IEEE-11073 Nomenklatur
    kvid: "http://fhir.de/sid/gkv/kvid-10",   // Krankenversichertennummer
    local: "urn:oid:1.2.840.10008.2.16.4",
    v3Gender: "http://hl7.org/fhir/administrative-gender",
} as const;

// SNOMED Version fuer MIO-Konformitaet (muss angegeben werden)
export const SNOMED_VERSION = "http://snomed.info/sct/900000000000207008/version/20220331";

// OBX-Codes die Geraeteeigenschaften beschreiben (keine Messwerte)
export const DEVICE_CODES = new Set(["182756003", "413568008"]);

export const ALLOWED_EXTENSIONS = new Set([".hl7", ".json", ".xml", ".txt"]);
export const ALLOWED_MIMETYPES  = new Set([
    "application/json",
    "application/xml",
    "application/octet-stream",
    "text/plain",
    "text/xml",
    "text/hl7v2",
]);
