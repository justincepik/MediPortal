import type {TransformResult} from "./idco.transformer";
import type {
    FhirBundle,
    FhirDevice,
    FhirDiagnosticReport,
    FhirObservation,
    FhirPatient,
    PatientDetail
} from "../types/fhir.types";

const FHIR_SERVER = process.env["FHIR_SERVER_URL"] ?? "http://localhost:8080/fhir";

// ── Helpers ───────────────────────────────────

interface FhirResponse {
    resourceType: string;
    id?: string;
    issue?: { severity: string; diagnostics?: string }[];
}

const fhirPost = async (resourceType: string, body: object): Promise<FhirResponse> => {
    const res = await fetch(`${FHIR_SERVER}/${resourceType}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/fhir+json",
            "Accept": "application/fhir+json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`FHIR POST ${resourceType} fehlgeschlagen (${res.status}): ${err}`);
    }

    return res.json() as Promise<FhirResponse>;
};

const fhirGet = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${FHIR_SERVER}/${path}`, {
        headers: {"Accept": "application/fhir+json"},
    });

    if (!res.ok) {
        throw new Error(`FHIR GET ${path} fehlgeschlagen (${res.status})`);
    }

    return res.json() as Promise<T>;
};

// ── Write: Store transformed resources ────────

export interface StoreResult {
    patientId: string;
    deviceId: string;
    observationIds: string[];
    diagnosticReportId: string;
}

export const storeOnFhirServer = async (result: TransformResult): Promise<StoreResult> => {
    // Resources are stored in dependency order:
    // Patient first (referenced by all others),
    // then Device, then Observations, then DiagnosticReport

    console.log("[FHIR] Speichere Patient...");
    const patientRes = await fhirPost("Patient", result.patient);
    const patientId = patientRes.id ?? result.patient.id;

    // Update references in child resources to use server-assigned id
    const deviceWithRef = {
        ...result.device,
        patient: {reference: `Patient/${patientId}`},
    };

    console.log("[FHIR] Speichere Device...");
    const deviceRes = await fhirPost("Device", deviceWithRef);
    const deviceId = deviceRes.id ?? result.device.id;

    console.log(`[FHIR] Speichere ${result.observations.length} Observation(s) ...`);
    const observationIds: string[] = [];

    for (const obs of result.observations) {
        const obsWithRefs = {
            ...obs,
            subject: {reference: `Patient/${patientId}`},
            device: {reference: `Device/${deviceId}`},
        };
        const obsRes = await fhirPost("Observation", obsWithRefs);
        observationIds.push(obsRes.id ?? obs.id);
    }

    const reportWithRefs = {
        ...result.diagnosticReport,
        subject: {reference: `Patient/${patientId}`},
        result: observationIds.map((id) => ({reference: `Observation/${id}`})),
    };

    console.log("[FHIR] Speichere DiagnosticReport...");
    const reportRes = await fhirPost("DiagnosticReport", reportWithRefs);
    const diagnosticReportId = reportRes.id ?? result.diagnosticReport.id;

    console.log("[FHIR] Alle Ressourcen gespeichert.");

    return {patientId, deviceId, observationIds, diagnosticReportId};
};

// ── Read: Fetch patients for frontend ─────────

export const fetchPatientsFromFhirServer = async (
    activeOnly?: boolean
): Promise<FhirBundle<FhirPatient>> => {
    const query = activeOnly ? "Patient?active=true" : "Patient";
    return fhirGet<FhirBundle<FhirPatient>>(query);
};

export const fetchPatientByIdFromFhirServer = async (
    id: string
): Promise<FhirPatient> => {
    return fhirGet<FhirPatient>(`Patient/${id}`);
};

const bundleResources = <T>(bundle: FhirBundle<T>): T[] =>
    bundle.entry?.map((e) => e.resource) ?? [];

// ── Patient Detail: alle verknüpften Ressourcen ──

export const fetchPatientDetail = async (patientId: string): Promise<PatientDetail> => {
    const ref = `Patient/${patientId}`;

    const [patientRes, deviceBundle, observationBundle, reportBundle] = await Promise.all([
        fhirGet<FhirPatient>(`Patient/${patientId}`),
        fhirGet<FhirBundle<FhirDevice>>(`Device?patient=${ref}`),
        fhirGet<FhirBundle<FhirObservation>>(`Observation?subject=${ref}&_count=200`),
        fhirGet<FhirBundle<FhirDiagnosticReport>>(`DiagnosticReport?subject=${ref}`),
    ]);

    return {
        patient: patientRes,
        devices: bundleResources(deviceBundle),
        observations: bundleResources(observationBundle),
        diagnosticReports: bundleResources(reportBundle),
    };
};