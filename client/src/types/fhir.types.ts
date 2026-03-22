// ─────────────────────────────────────────────
//  FHIR R4 Types (subset)
//
//  ⚠️  Diese Datei ist identisch mit
//      backend/src/types/fhir.types.ts
//
//  Langfristig: in ein shared package
//  auslagern (z.B. packages/shared/fhir.types.ts)
//  und von beiden Seiten importieren.
// ─────────────────────────────────────────────

export interface FhirCoding {
    system: string;
    code: string;
    display?: string;
}

export interface FhirCodeableConcept {
    coding: FhirCoding[];
    text?: string;
}

export interface FhirHumanName {
    use?: "official" | "nickname" | "maiden";
    family: string;
    given: string[];
}

export interface FhirContactPoint {
    system: "phone" | "email" | "fax";
    value: string;
    use?: "home" | "work" | "mobile";
}

export interface FhirAddress {
    line?: string[];
    city?: string;
    postalCode?: string;
    country?: string;
}

export interface FhirIdentifier {
    system: string;
    value: string;
}

export interface FhirPatient {
    resourceType: "Patient";
    id: string;
    identifier: FhirIdentifier[];
    name: FhirHumanName[];
    gender: "male" | "female" | "other" | "unknown";
    birthDate: string;           // YYYY-MM-DD
    telecom?: FhirContactPoint[];
    address?: FhirAddress[];
    active: boolean;
    meta: {
        lastUpdated: string;       // ISO 8601
        versionId: string;
    };
}

export interface FhirBundleEntry<T> {
    fullUrl: string;
    resource: T;
}

export interface FhirBundle<T> {
    resourceType: "Bundle";
    type: "searchset" | "collection";
    total: number;
    entry: FhirBundleEntry<T>[];
}

export interface UploadResult {
    success: boolean;
    fileName: string;
    patientsImported: number;
    errors: string[];
}


export interface FhirDevice {
    resourceType: "Device";
    id: string;
    identifier?: { system: string; value: string }[];
    type?: {
        coding: { system: string; code: string; display?: string }[];
        text?: string;
    };
    modelNumber?: string;
    patient?: { reference: string };
    meta?: { lastUpdated: string; versionId: string };
}

export interface FhirQuantity {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
}

export interface FhirObservation {
    resourceType: "Observation";
    id: string;
    status: string;
    code: {
        coding: { system: string; code: string; display?: string }[];
        text?: string;
    };
    subject?: { reference: string };
    device?: { reference: string };
    effectiveDateTime?: string;
    valueQuantity?: FhirQuantity;
    valueString?: string;
    valueBoolean?: boolean;
    referenceRange?: { text: string }[];
    interpretation?: {
        coding: { system: string; code: string; display?: string }[];
    }[];
    meta?: { lastUpdated: string; versionId: string };
}

export interface FhirDiagnosticReport {
    resourceType: "DiagnosticReport";
    id: string;
    status: string;
    code: {
        coding: { system: string; code: string; display?: string }[];
        text?: string;
    };
    subject?: { reference: string };
    effectiveDateTime?: string;
    issued?: string;
    result?: { reference: string }[];
    meta?: { lastUpdated: string; versionId: string };
}

// Aggregated patient detail — returned by GET /api/patients/:id/detail
export interface PatientDetail {
    patient: import("./fhir.types").FhirPatient;
    devices: FhirDevice[];
    observations: FhirObservation[];
    diagnosticReports: FhirDiagnosticReport[];
}