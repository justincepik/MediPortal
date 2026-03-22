import { useState, useEffect, useCallback } from "react";
import { fetchPatients } from "../services/api.service";
import type { FhirPatient } from "../types/fhir.types";

interface UsePatientsResult {
    patients: FhirPatient[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const usePatients = (activeOnly?: boolean): UsePatientsResult => {
    const [patients, setPatients] = useState<FhirPatient[]>([]);
    const [loading, setLoading]   = useState<boolean>(true);
    const [error, setError]       = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);

        fetchPatients(activeOnly)
            .then((bundle) => setPatients(bundle.entry.map((e) => e.resource)))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [activeOnly]);

    useEffect(() => { load(); }, [load]);

    return { patients, loading, error, refetch: load };
};