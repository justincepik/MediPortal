import { type FC, useState } from "react";
import type { FhirPatient } from "@mediportal/shared";
import StatusBadge from "./StatusBadge";
import PatientDetailModal from "./PatientDetailModal";

// ── Helpers ───────────────────────────────────

const getFullName = (p: FhirPatient): string => {
    const name = p.name[0];
    if (!name) return "—";
    return `${name.given.join(" ")} ${name.family}`;
};

const getPatientId = (p: FhirPatient): string =>
    p.identifier[0]?.value ?? p.id;

const formatDate = (isoDate: string): string => {
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
};

const formatLastUpdated = (iso: string): string =>
    formatDate(iso.split("T")[0] ?? iso);

// ── Sub-components ────────────────────────────

const TABLE_COLUMNS: string[] = ["ID", "Name", "Geburtsdatum", "Status", "Letzter Import"];

interface PatientRowProps {
    patient: FhirPatient;
    onClick: (id: string) => void;
}

const PatientRow: FC<PatientRowProps> = ({ patient, onClick }) => (
    <tr
        className="patients-row-clickable"
        onClick={() => onClick(patient.id)}
        title="Klicken fuer Details"
    >
        <td><span className="patient-id">{getPatientId(patient)}</span></td>
        <td><span className="patient-name">{getFullName(patient)}</span></td>
        <td>{formatDate(patient.birthDate)}</td>
        <td><StatusBadge active={patient.active} /></td>
        <td>{formatLastUpdated(patient.meta.lastUpdated)}</td>
    </tr>
);

// ── Main Component ────────────────────────────

interface PatientsViewProps {
    patients: FhirPatient[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const PatientsView: FC<PatientsViewProps> = ({ patients, loading, error, refetch }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <>
            <div className="patients-wrap">
                <div className="patients-header">
                    <h1 className="patients-title">Patienten</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {loading
                            ? <span className="patients-count">Laden ...</span>
                            : <span className="patients-count">{patients.length} EINTRAEGE</span>
                        }
                        <button className="refetch-btn" onClick={refetch} disabled={loading}>
                            &#x21BB;
                        </button>
                    </div>
                </div>

                {error && <div className="error-banner">&#9888; {error}</div>}

                <div className="table-card">
                    <table>
                        <thead>
                        <tr>{TABLE_COLUMNS.map((col) => <th key={col}>{col}</th>)}</tr>
                        </thead>
                        <tbody>
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}>
                                    {TABLE_COLUMNS.map((col) => (
                                        <td key={col}><span className="skeleton" /></td>
                                    ))}
                                </tr>
                            ))
                            : patients.map((patient) => (
                                <PatientRow
                                    key={patient.id}
                                    patient={patient}
                                    onClick={setSelectedId}
                                />
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal — rendered outside the table for correct z-index */}
            <PatientDetailModal
                patientId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </>
    );
};

export default PatientsView;