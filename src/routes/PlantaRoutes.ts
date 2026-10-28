import { Router } from "express";
import * as PlantaController from "@controllers/PlantaController";

export const router = Router();

router.post("/", PlantaController.create);
router.get("/", PlantaController.findMany);
router.get("/:id", PlantaController.findById);
router.patch("/:id", PlantaController.updateById);
router.delete("/:id", PlantaController.deleteById);
