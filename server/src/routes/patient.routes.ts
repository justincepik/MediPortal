import { Router } from "express";
import * as patientController from "../controllers/patient.controller";
import { getPatientDetail }   from "../controllers/patient.detail.controller";

const router = Router();

router.get("/",            patientController.getPatients);
router.get("/:id/detail",  getPatientDetail);
router.get("/:id",         patientController.getPatient);

export default router;