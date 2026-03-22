// =============================================================================
//  Modul 2: Transformation — IDCO -> FHIR (MIO-konform)
//
//  Bildet die geparsten IDCO-Segmente gemäß Tabelle 1 der Bachelorarbeit
//  auf FHIR R4-Ressourcen ab — mit MIO TM 1.0.0 Profilreferenzen:
//
//    PID          -> Patient   (KBV_PR_MIO_TELE_Patient)
//    OBX (Device) -> Device    (KBV_PR_MIO_TELE_Device)
//    OBX (Werte)  -> Observation (KBV_PR_MIO_TELE_Observation_Free)
//    OBR          -> DiagnosticReport (KBV_PR_MIO_TELE_DiagnosticReport)
//
//  MIO TM 1.0.0 Pflichtfelder gemäß:
//  https://hub.kbv.de/display/TM1X0X0/Telemedizinisches+Monitoring+1.0.0
// =============================================================================

import {v4 as uuidv4} from "uuid";
import type {ObxSegment, ParsedIdcoMessage} from "./idco.parser";
import type {
    FhirBundle,
    FhirBundleEntry,
    FhirDevice,
    FhirDiagnosticReport,
    FhirObservation,
    FhirPatient,
} from "@mediportal/shared";
import {DEVICE_CODES, MIO_PROFILES, SNOMED_VERSION, SYSTEMS} from "../util/constants";
import {mapGender, mioMeta, resolveSystem, toIsoDate, toIsoDateTime} from "../util/functions";

// ── Typ-Definitionen ──────────────────────────────────────────────────────────

export interface TransformResult {
    patient: FhirPatient;
    device: FhirDevice;
    observations: FhirObservation[];
    diagnosticReport: FhirDiagnosticReport;
    bundle: FhirBundle<FhirPatient | FhirDevice | FhirObservation | FhirDiagnosticReport>;
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

// ── 1. Patient (KBV_PR_MIO_TELE_Patient) ─────────────────────────────────────
//
// MIO-Pflichtfelder:
//   - meta.profile
//   - identifier (hier: interne ID, da KVNR aus IDCO nicht ableitbar)
//   - name (family + given)
//   - gender (aus MIO-ValueSet)
//   - birthDate

const buildPatient = (pid: ParsedIdcoMessage["pid"]): FhirPatient => ({
    resourceType: "Patient",
    id: uuidv4(),
    meta: {
        ...mioMeta(MIO_PROFILES.patient),
    },
    identifier: [
        {
            // MIO schreibt KVNR vor — da IDCO keine KVNR enthaelt,
            // verwenden wir die interne Patienten-ID als Fallback.
            // Im Produktivbetrieb muss hier die GKV-KVNR eingesetzt werden.
            system: "urn:oid:1.2.276.0.76.4.8",   // OID für Patientennummer (lokal)
            value: pid.patientId,
        },
    ],
    name: [
        {
            use: "official",
            family: pid.familyName,
            given: [pid.givenName],
        },
    ],
    gender: mapGender(pid.gender),
    birthDate: toIsoDate(pid.birthDate),
    active: true,
    address: pid.street ? [
        {
            line: [pid.street],
            city: pid.city,
            postalCode: pid.postalCode,
            country: pid.country || "DE",
        },
    ] : undefined,
});

// ── 2. Device (KBV_PR_MIO_TELE_Device) ───────────────────────────────────────
//
// MIO-Pflichtfelder:
//   - meta.profile
//   - identifier
//   - type (mit SNOMED-Code fuer Herzschrittmacher/ICD)
//   - patient (Referenz auf Patient)

const buildDevice = (
    obxList: ObxSegment[],
    patientRef: string
): FhirDevice => {
    const idObx = obxList.find((o) => o.observationCode === "182756003");
    const modelObx = obxList.find((o) => o.observationCode === "413568008");

    return {
        resourceType: "Device",
        id: uuidv4(),
        meta: mioMeta(MIO_PROFILES.device),
        identifier: [
            {
                system: "urn:oid:1.2.840.10004.1.1.1.0.0.1.0.0.10.8678",  // IEEE-11073 Device ID OID
                value: idObx?.value ?? "UNKNOWN",
            },
        ],
        type: {
            coding: [
                {
                    system: SYSTEMS.snomed,
                    version: SNOMED_VERSION,
                    // SNOMED CT Code für implantierbaren kardialen Defibrillator
                    code: "72506001",
                    display: "Implantable defibrillator (physical object)",
                },
            ],
        },
        modelNumber: modelObx?.value,
        patient: {reference: patientRef},
    };
};

// ── 3. Observation (KBV_PR_MIO_TELE_Observation_Free) ────────────────────────
//
// MIO-Pflichtfelder:
//   - meta.profile
//   - status = "final"
//   - code (mit SNOMED-Code + Version)
//   - subject (Referenz auf Patient)
//   - effectiveDateTime

const buildObservation = (
    obx: ObxSegment,
    patientRef: string,
    deviceRef: string,
    reportTime: string
): FhirObservation => {
    const system = resolveSystem(obx.observationSystem);
    const isSnomedCode = system === SYSTEMS.snomed;

    const obs: FhirObservation = {
        resourceType: "Observation",
        id: uuidv4(),
        meta: mioMeta(MIO_PROFILES.observation),
        status: "final",
        code: {
            coding: [
                {
                    system,
                    // SNOMED-Version ist Pflicht bei SNOMED-Codes gemäß MIO
                    ...(isSnomedCode && {version: SNOMED_VERSION}),
                    code: obx.observationCode,
                    display: obx.observationDisplay || obx.observationCode,
                },
            ],
        },
        subject: {reference: patientRef},
        device: {reference: deviceRef},
        effectiveDateTime: toIsoDateTime(obx.observationDateTime || reportTime),
    };

    if (obx.valueType === "NM" && obx.value) {
        obs.valueQuantity = {
            value: parseFloat(obx.value),
            unit: obx.unit || "1",
            system: SYSTEMS.ucum,
            code: obx.unitCode || "1",
        };
    } else if (obx.valueType === "ST" && !DEVICE_CODES.has(obx.observationCode)) {
        obs.valueString = obx.value;
    }

    if (obx.referenceRange) {
        obs.referenceRange = [{text: obx.referenceRange}];
    }

    if (obx.abnormalFlag && obx.abnormalFlag !== "N") {
        obs.interpretation = [
            {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                        code: obx.abnormalFlag,
                        display: obx.abnormalFlag === "H" ? "High"
                            : obx.abnormalFlag === "L" ? "Low"
                                : "Abnormal",
                    },
                ],
            },
        ];
    }

    return obs;
};

// ── 4. DiagnosticReport (KBV_PR_MIO_TELE_DiagnosticReport) ───────────────────
//
// MIO-Pflichtfelder:
//   - meta.profile
//   - status = "final"
//   - category (Pflicht gemaess MIO TELE DiagnosticReport-Profil)
//   - code (LOINC fuer kardialen Telemonitoring-Bericht)
//   - subject
//   - effectiveDateTime
//   - result (Referenzen auf Observations)

const buildDiagnosticReport = (
    obr: ParsedIdcoMessage["obr"],
    patientRef: string,
    observationRefs: string[]
): FhirDiagnosticReport => ({
    resourceType: "DiagnosticReport",
    id: uuidv4(),
    meta: mioMeta(MIO_PROFILES.diagnosticReport),
    status: "final",
    // category ist Pflichtfeld im MIO TELE DiagnosticReport-Profil
    category: [
        {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "LP29708-2",
                    display: "Cardiology",
                },
            ],
        },
    ],
    code: {
        coding: [
            {
                system: SYSTEMS.loinc,
                code: "11527-7",
                display: "Cardiology Telemonitoring note",
            },
        ],
        text: "IDCO Telemedizinisches Monitoring (TM 1.0.0)",
    },
    subject: {reference: patientRef},
    effectiveDateTime: toIsoDateTime(obr.observationTime),
    issued: new Date().toISOString(),
    result: observationRefs.map((ref) => ({reference: ref})),
});

// ── Haupt-Transformationsfunktion ─────────────────────────────────────────────

export const transformIdcoToFhir = (parsed: ParsedIdcoMessage): TransformResult => {
    const patient = buildPatient(parsed.pid);
    const patientRef = `Patient/${patient.id}`;

    const device = buildDevice(parsed.obx, patientRef);
    const deviceRef = `Device/${device.id}`;

    const measurementObx = parsed.obx.filter(
        (o) => !DEVICE_CODES.has(o.observationCode)
    );

    const observations = measurementObx.map((obx) =>
        buildObservation(obx, patientRef, deviceRef, parsed.obr.observationTime)
    );

    const observationRefs = observations.map((o) => `Observation/${o.id}`);
    const diagnosticReport = buildDiagnosticReport(
        parsed.obr, patientRef, observationRefs
    );

    const allResources = [patient, device, ...observations, diagnosticReport];
    const bundle: FhirBundle<typeof allResources[number]> = {
        resourceType: "Bundle",
        type: "collection",
        total: allResources.length,
        entry: allResources.map((r) => ({
            fullUrl: `${r.resourceType}/${r.id}`,
            resource: r,
        })) as FhirBundleEntry<typeof allResources[number]>[],
    };

    return {patient, device, observations, diagnosticReport, bundle};
};