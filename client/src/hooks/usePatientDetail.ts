// ─────────────────────────────────────────────
//  usePatientDetail Hook
//  Lädt alle Daten eines Patienten vom Backend.
// ─────────────────────────────────────────────

import {useEffect, useState} from "react";
import {fetchPatientDetail} from "../services/api.service.detail";
import type {PatientDetail} from "../types/fhir.types.ts";

interface UsePatientDetailResult {
    detail: PatientDetail | null;
    loading: boolean;
    error: string | null;
}

export const usePatientDetail = (patientId: string | null): UsePatientDetailResult => {
    const [detail, setDetail] = useState<PatientDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!patientId) {
            setDetail(null);
            return;
        }

        setLoading(true);
        setError(null);

        fetchPatientDetail(patientId)
            .then(setDetail)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [patientId]);

    return {detail, loading, error};
};