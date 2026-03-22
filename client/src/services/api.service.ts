import type {FhirBundle, FhirPatient, PatientDetail, UploadResult} from "@mediportal/shared";

const BASE_URL = "http://localhost:3000/api";

// ── Helpers ───────────────────────────────────

const handleResponse = async <T>(res: Response): Promise<T> => {
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.issue?.[0]?.details?.text ?? `HTTP ${res.status}`;
        throw new Error(message);
    }
    return res.json() as Promise<T>;
};

// ── Patients ──────────────────────────────────

export const fetchPatientDetail = (id: string): Promise<PatientDetail> =>
    fetch(`${BASE_URL}/patients/${id}/detail`)
        .then((res) => handleResponse<PatientDetail>(res));

export const fetchPatients = async (activeOnly?: boolean): Promise<FhirBundle<FhirPatient>> => {
    const query = activeOnly ? "?active=true" : "";
    const res = await fetch(`${BASE_URL}/patients${query}`);
    return await handleResponse<FhirBundle<FhirPatient>>(res);
};

export const fetchPatientById = (id: string): Promise<FhirPatient> =>
    fetch(`${BASE_URL}/patients/${id}`)
        .then((res) => handleResponse<FhirPatient>(res));

export const createPatient = (
    data: Omit<FhirPatient, "id" | "resourceType" | "meta">
): Promise<FhirPatient> =>
    fetch(`${BASE_URL}/patients`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then((res) => handleResponse<FhirPatient>(res));

export const updatePatient = (
    id: string,
    data: Partial<FhirPatient>
): Promise<FhirPatient> =>
    fetch(`${BASE_URL}/patients/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then((res) => handleResponse<FhirPatient>(res));

// ── Upload ────────────────────────────────────

export const uploadFhirFile = async (file: File): Promise<UploadResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, {method: "POST", body: form});
    return await handleResponse<UploadResult>(res);
};
