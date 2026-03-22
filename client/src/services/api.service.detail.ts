// ─────────────────────────────────────────────
//  Ergänzung api.service.ts
//  Füge diesen Import und diese Funktion hinzu.
// ─────────────────────────────────────────────

import type { PatientDetail } from "../types/fhir.extended.types";

const BASE_URL = "http://localhost:3000/api";

const handleResponse = async <T>(res: Response): Promise<T> => {
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.issue?.[0]?.details?.text ?? `HTTP ${res.status}`;
        throw new Error(message);
    }
    return res.json() as Promise<T>;
};

// Füge diese Funktion in api.service.ts ein:
export const fetchPatientDetail = (id: string): Promise<PatientDetail> =>
    fetch(`${BASE_URL}/patients/${id}/detail`)
        .then((res) => handleResponse<PatientDetail>(res));