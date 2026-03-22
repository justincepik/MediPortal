export type TabId = "import" | "patients";

export type PatientStatus = "Aktiv" | "Inaktiv";

export interface Patient {
    id: string;
    name: string;
    dob: string;
    status: PatientStatus;
    lastImport: string;
}