// =============================================================================
//  FHIR R4 Types (MIO TM 1.0.0 konform)
//
//  Alle Interfaces bilden die tatsächlich verwendeten FHIR-Ressourcen ab
//  und sind auf MIO Telemedizinisches Monitoring 1.0.0 ausgerichtet.
//
//  Profil-Doku: https://hub.kbv.de/display/TM1X0X0
// =============================================================================

// ── Primitive Bausteine ───────────────────────────────────────────────────────

export interface MioMeta {
    profile: string[];
    lastUpdated: string;
    versionId: string;
}

export interface FhirCoding {
    system:   string;
    code:     string;
    display?: string;
    version?: string;    // Pflicht bei SNOMED-Codes gemaess MIO
}

export interface FhirCodeableConcept {
    coding: FhirCoding[];
    text?:  string;
}

export interface FhirHumanName {
    use?:    "official" | "nickname" | "maiden";
    family:  string;
    given:   string[];
}

export interface FhirContactPoint {
    system: "phone" | "email" | "fax";
    value:  string;
    use?:   "home" | "work" | "mobile";
}

export interface FhirAddress {
    line?:       string[];
    city?:       string;
    postalCode?: string;
    country?:    string;
}

export interface FhirIdentifier {
    system: string;
    value:  string;
}

export interface FhirQuantity {
    value?:  number;
    unit?:   string;
    system?: string;
    code?:   string;
}

// ── Meta (mit MIO-Profilreferenz) ─────────────────────────────────────────────

export interface FhirMeta {
    profile?:     string[];   // MIO-Pflichtfeld: KBV StructureDefinition URL
    lastUpdated:  string;     // ISO 8601
    versionId:    string;
}

// ── FHIR Bundle ───────────────────────────────────────────────────────────────

export interface FhirBundleEntry<T> {
    fullUrl:  string;
    resource: T;
}

export interface FhirBundle<T> {
    resourceType: "Bundle";
    type:         "searchset" | "collection";
    total:        number;
    entry:        FhirBundleEntry<T>[];
}

// ── Patient (KBV_PR_MIO_TELE_Patient) ────────────────────────────────────────

export interface FhirPatient {
    resourceType: "Patient";
    id:           string;
    meta:         FhirMeta;
    identifier:   FhirIdentifier[];
    name:         FhirHumanName[];
    gender:       "male" | "female" | "other" | "unknown";
    birthDate:    string;              // YYYY-MM-DD
    telecom?:     FhirContactPoint[];
    address?:     FhirAddress[];
    active:       boolean;
}

// ── Device (KBV_PR_MIO_TELE_Device) ──────────────────────────────────────────

export interface FhirDevice {
    resourceType: "Device";
    id:           string;
    meta:         FhirMeta;
    identifier:   FhirIdentifier[];
    type?: {
        coding: FhirCoding[];            // version-Feld fuer SNOMED enthalten
    };
    modelNumber?: string;
    manufacturer?: string;
    patient:      { reference: string };
}

// ── Observation (KBV_PR_MIO_TELE_Observation_Free) ───────────────────────────

export interface FhirObservation {
    resourceType:      "Observation";
    id:                string;
    meta:              FhirMeta;
    status:            "final" | "preliminary" | "registered" | "amended";
    code:              FhirCodeableConcept;
    subject?:          { reference: string };
    device?:           { reference: string };
    effectiveDateTime?: string;
    valueQuantity?:    FhirQuantity;
    valueString?:      string;
    valueBoolean?:     boolean;
    referenceRange?:   { text: string }[];
    interpretation?:   { coding: FhirCoding[] }[];
}

// ── DiagnosticReport (KBV_PR_MIO_TELE_DiagnosticReport) ──────────────────────

export interface FhirDiagnosticReport {
    resourceType:      "DiagnosticReport";
    id:                string;
    meta:              FhirMeta;
    status:            "final" | "preliminary" | "registered" | "amended";
    category:          { coding: FhirCoding[] }[];  // Pflichtfeld gemaess MIO
    code:              FhirCodeableConcept;
    subject?:          { reference: string };
    effectiveDateTime?: string;
    issued?:           string;
    result?:           { reference: string }[];
}

// ── API-spezifische Types ─────────────────────────────────────────────────────

export interface ApiError {
    resourceType: "OperationOutcome";
    issue: {
        severity: "error" | "warning" | "information";
        code:     string;
        details:  { text: string };
    }[];
}

export interface UploadResult {
    success:          boolean;
    fileName:         string;
    patientsImported: number;
    errors:           string[];
}

// ── Patient Detail (aggregiert) ───────────────────────────────────────────────
// Wird von GET /api/patients/:id/detail zurueckgegeben

export interface PatientDetail {
    patient:          FhirPatient;
    devices:          FhirDevice[];
    observations:     FhirObservation[];
    diagnosticReports: FhirDiagnosticReport[];
}