import {type FC, useEffect} from "react";
import {usePatientDetail} from "../hooks/usePatientDetail";
import type {FhirDevice, FhirDiagnosticReport, FhirObservation, FhirPatient} from "@mediportal/shared"

// ── Helpers ───────────────────────────────────

const fmt = (iso: string | undefined): string => {
    if (!iso) return "—";
    const d = iso.split("T")[0] ?? iso;
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
};

const obsValue = (o: FhirObservation): string => {
    if (o.valueQuantity !== undefined) {
        return `${o.valueQuantity.value ?? "?"} ${o.valueQuantity.unit ?? ""}`.trim();
    }
    if (o.valueString !== undefined) return o.valueString;
    if (o.valueBoolean !== undefined) return o.valueBoolean ? "Ja" : "Nein";
    return "—";
};

// ── Section components ────────────────────────

const Section: FC<{ title: string; children: React.ReactNode }> = ({title, children}) => (
    <div className="detail-section">
        <h3 className="detail-section-title">{title}</h3>
        {children}
    </div>
);

const Row: FC<{ label: string; value: string }> = ({label, value}) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value}</span>
    </div>
);

// ── Stammdaten ────────────────────────────────

const PatientSection: FC<{ patient: FhirPatient }> = ({patient}) => {
    const name = patient.name[0];
    const address = patient.address?.[0];
    const phone = patient.telecom?.find((t) => t.system === "phone")?.value;
    const email = patient.telecom?.find((t) => t.system === "email")?.value;

    return (
        <Section title="Stammdaten">
            <Row label="Name" value={name ? `${name.given.join(" ")} ${name.family}` : "—"}/>
            <Row label="Geburtsdatum" value={fmt(patient.birthDate)}/>
            <Row label="Geschlecht" value={patient.gender}/>
            <Row label="Status" value={patient.active ? "Aktiv" : "Inaktiv"}/>
            {address && (
                <>
                    <Row label="Adresse" value={address.line?.join(", ") ?? "—"}/>
                    <Row label="Stadt" value={`${address.postalCode ?? ""} ${address.city ?? ""}`.trim()}/>
                    <Row label="Land" value={address.country ?? "—"}/>
                </>
            )}
            {phone && <Row label="Telefon" value={phone}/>}
            {email && <Row label="E-Mail" value={email}/>}
            <Row label="Letztes Update" value={fmt(patient.meta.lastUpdated)}/>
        </Section>
    );
};

// ── Device ────────────────────────────────────

const DeviceSection: FC<{ devices: FhirDevice[] }> = ({devices}) => (
    <Section title={`Geraeteinformationen (${devices.length})`}>
        {devices.length === 0
            ? <p className="detail-empty">Keine Geraete gefunden.</p>
            : devices.map((d) => (
                <div key={d.id} className="detail-card">
                    <Row label="ID" value={d.identifier?.[0].value ?? d.id}/>
                    <Row label="Typ" value={d.type?.coding[0].display ?? d.type?.coding[0].code ?? "—"}/>
                    <Row label="Modell" value={d.modelNumber ?? "—"}/>
                    <Row label="Update" value={fmt(d.meta?.lastUpdated)}/>
                </div>
            ))
        }
    </Section>
);

// ── Observations ──────────────────────────────

const ObservationSection: FC<{ observations: FhirObservation[] }> = ({observations}) => (
    <Section title={`Messwerte & Beobachtungen (${observations.length})`}>
        {observations.length === 0
            ? <p className="detail-empty">Keine Messwerte gefunden.</p>
            : (
                <div className="detail-table-wrap">
                    <table className="detail-table">
                        <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Wert</th>
                            <th>Status</th>
                            <th>Zeitpunkt</th>
                        </tr>
                        </thead>
                        <tbody>
                        {observations.map((o) => (
                            <tr key={o.id}>
                                <td>{o.code.text ?? o.code.coding[0]?.display ?? o.code.coding[0]?.code ?? "—"}</td>
                                <td className="obs-value">{obsValue(o)}</td>
                                <td>
                                    <span className={`obs-status obs-${o.status}`}>{o.status}</span>
                                </td>
                                <td>{fmt(o.effectiveDateTime)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )
        }
    </Section>
);

// ── DiagnosticReport ──────────────────────────

const DiagnosticReportSection: FC<{ reports: FhirDiagnosticReport[] }> = ({reports}) => (
    <Section title={`Befundberichte (${reports.length})`}>
        {reports.length === 0
            ? <p className="detail-empty">Keine Berichte gefunden.</p>
            : reports.map((r) => (
                <div key={r.id} className="detail-card">
                    <Row label="Typ" value={r.code.text ?? r.code.coding[0]?.display ?? "—"}/>
                    <Row label="Status" value={r.status}/>
                    <Row label="Datum" value={fmt(r.effectiveDateTime)}/>
                    <Row label="Erstellt" value={fmt(r.issued)}/>
                    <Row label="Ergebnisse" value={`${r.result?.length ?? 0} Observationen`}/>
                </div>
            ))
        }
    </Section>
);

// ── Modal Styles ──────────────────────────────

const modalStyles = `
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: #FAFAF8;
    border-radius: 16px;
    width: 100%;
    max-width: 780px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #EEECEA;
    flex-shrink: 0;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .modal-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #aaa;
    margin-top: 2px;
    letter-spacing: 0.04em;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #EEECEA;
    color: #666;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .modal-close:hover { background: #E0DEDA; color: #1a1a1a; }

  .modal-body {
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .modal-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: #888;
    font-size: 14px;
    gap: 10px;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-top-color: #4A6CF7;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Sections */
  .detail-section { display: flex; flex-direction: column; gap: 8px; }

  .detail-section-title {
    font-size: 11px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: 'DM Mono', monospace;
    padding-bottom: 8px;
    border-bottom: 1px solid #EEECEA;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 5px 0;
    font-size: 14px;
  }

  .detail-label { color: #888; flex-shrink: 0; margin-right: 16px; }
  .detail-value { color: #1a1a1a; font-weight: 500; text-align: right; }

  .detail-card {
    background: #fff;
    border: 1px solid #EEECEA;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .detail-empty { font-size: 13px; color: #bbb; font-style: italic; }

  /* Observations table */
  .detail-table-wrap {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid #EEECEA;
  }

  .detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .detail-table thead { background: #F7F7F5; }

  .detail-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'DM Mono', monospace;
    border-bottom: 1px solid #EEECEA;
    white-space: nowrap;
  }

  .detail-table td {
    padding: 10px 14px;
    color: #333;
    border-bottom: 1px solid #F2F0EC;
  }

  .detail-table tr:last-child td { border-bottom: none; }
  .detail-table tr:hover td { background: #FAFAF8; }

  .obs-value   { font-family: 'DM Mono', monospace; color: #1a1a1a; }

  .obs-status  { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
  .obs-final   { background: #E8F7EE; color: #1a7a42; }
  .obs-preliminary { background: #FEF9E7; color: #92610a; }

  /* Clickable table rows in PatientsView */
  .patients-row-clickable { cursor: pointer; }
  .patients-row-clickable:hover td { background: #F0F2FF !important; }
`;

// ── Main Modal Component ──────────────────────

interface PatientDetailModalProps {
    patientId: string | null;
    onClose: () => void;
}

const PatientDetailModal: FC<PatientDetailModalProps> = ({patientId, onClose}) => {
    const {detail, loading, error} = usePatientDetail(patientId);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    if (!patientId) return null;

    const patient = detail?.patient;
    const name = patient?.name[0];
    const fullName = name ? `${name.given.join(" ")} ${name.family}` : "Patient";

    return (
        <>
            <style>{modalStyles}</style>
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="modal-header">
                        <div>
                            <div className="modal-title">{loading ? "Lade..." : fullName}</div>
                            <div className="modal-subtitle">
                                {patient?.identifier?.[0]?.value ?? patientId}
                            </div>
                        </div>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {loading && (
                            <div className="modal-loading">
                                <div className="spinner"/>
                                Patientendaten werden geladen ...
                            </div>
                        )}

                        {error && (
                            <div className="error-banner">⚠ {error}</div>
                        )}

                        {detail && !loading && (
                            <>
                                <PatientSection patient={detail.patient}/>
                                <DeviceSection devices={detail.devices}/>
                                <ObservationSection observations={detail.observations}/>
                                <DiagnosticReportSection reports={detail.diagnosticReports}/>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default PatientDetailModal;