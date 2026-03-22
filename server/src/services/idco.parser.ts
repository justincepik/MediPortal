export interface MshSegment {
    sendingSystem: string;
    sendingFacility: string;
    timestamp: string;
    messageType: string;
    messageId: string;
}

export interface PidSegment {
    patientId: string;
    familyName: string;
    givenName: string;
    birthDate: string;        // YYYYMMDD
    gender: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface ObrSegment {
    requestId: string;
    reportId: string;
    observationCode: string;
    observationTime: string;
}

export interface ObxSegment {
    setId: string;
    valueType: string;        // NM, ST, CWE ...
    observationId: string;
    observationCode: string;
    observationDisplay: string;
    observationSystem: string;
    value: string;
    unit: string;
    unitCode: string;
    referenceRange: string;
    abnormalFlag: string;
    observationDateTime: string;
}

export interface ParsedIdcoMessage {
    msh: MshSegment;
    pid: PidSegment;
    obr: ObrSegment;
    obx: ObxSegment[];
}

// ── Helpers ───────────────────────────────────

/** Split HL7 field that uses ^ as component separator */
const components = (field: string): string[] => field.split("^");

/** Safe field access — returns "" instead of undefined */
const f = (segments: string[], index: number): string =>
    segments[index]?.trim() ?? "";

// ── Segment Parsers ───────────────────────────

const parseMsh = (fields: string[]): MshSegment => ({
    sendingSystem: f(fields, 3),
    sendingFacility: f(fields, 4),
    timestamp: f(fields, 7),
    messageType: f(fields, 9),
    messageId: f(fields, 10),
});

const parsePid = (fields: string[]): PidSegment => {
    const patientIdField = components(f(fields, 3));
    const nameField = components(f(fields, 5));
    const addressField = components(f(fields, 11));

    return {
        patientId: patientIdField[0] ?? "",
        familyName: nameField[0] ?? "",
        givenName: nameField[1] ?? "",
        birthDate: f(fields, 7),
        gender: f(fields, 8),
        street: addressField[0] ?? "",
        city: addressField[2] ?? "",
        postalCode: addressField[4] ?? "",
        country: addressField[5] ?? "",
    };
};

const parseObr = (fields: string[]): ObrSegment => ({
    requestId: f(fields, 2),
    reportId: f(fields, 3),
    observationCode: f(fields, 4),
    observationTime: f(fields, 7),
});

const parseObx = (fields: string[]): ObxSegment => {
    const codeField = components(f(fields, 3));
    const unitField = components(f(fields, 6));

    return {
        setId: f(fields, 1),
        valueType: f(fields, 2),
        observationId: codeField[0] ?? "",
        observationCode: codeField[0] ?? "",
        observationDisplay: codeField[1] ?? "",
        observationSystem: codeField[2] ?? "",
        value: f(fields, 5),
        unit: unitField[0] ?? "",
        unitCode: unitField[1] ?? "",
        referenceRange: f(fields, 7),
        abnormalFlag: f(fields, 8),
        observationDateTime: f(fields, 14),
    };
};

// ── Main Parser ───────────────────────────────

export const parseIdcoMessage = (raw: string): ParsedIdcoMessage => {
    const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    let msh: MshSegment | null = null;
    let pid: PidSegment | null = null;
    let obr: ObrSegment | null = null;
    const obxList: ObxSegment[] = [];

    for (const line of lines) {
        const fields = line.split("|");
        const segmentType = fields[0];

        switch (segmentType) {
            case "MSH":
                msh = parseMsh(fields);
                break;
            case "PID":
                pid = parsePid(fields);
                break;
            case "OBR":
                obr = parseObr(fields);
                break;
            case "OBX":
                obxList.push(parseObx(fields));
                break;
        }
    }

    if (!msh || !pid || !obr) {
        throw new Error("Ungültige IDCO-Nachricht: MSH, PID oder OBR fehlt.");
    }

    return {msh, pid, obr, obx: obxList};
};