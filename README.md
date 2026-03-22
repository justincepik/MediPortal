# MediPortal — Pipeline Setup

## Architektur

```
  IDCO/.hl7 Upload
         │
         ▼ 
┌─────────────────┐
│   idco.parser   │  Modul 1: HL7v2 → Segmente (MSH, PID, OBR, OBX)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ idco.transformer│  Modul 2: Segmente → FHIR R4 (Patient, Device,
└────────┬────────┘           Observation, DiagnosticReport)
         │
         ▼
┌─────────────────┐
│   fhir.client   │  Modul 3: FHIR-Ressourcen → HAPI FHIR Server
└────────┬────────┘
         │
         ▼
  HAPI FHIR Server (http://localhost:8080/fhir)
         │
         ▼
  Frontend (GET /api/patients → FHIR Bundle)
```
---

## Setup

### 1. HAPI FHIR Server starten
```bash
docker compose up -d
# Server läuft auf http://localhost:8080/fhir
# Web-UI:           http://localhost:8080
```

### 2. Server starten
```bash
cd client
npm install
npm run dev
# API läuft auf http://localhost:3000
```

### 3. Client starten
```bash
cd server
npm install
npm run dev
```