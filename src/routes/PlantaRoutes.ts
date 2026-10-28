import { Router } from "express";
import * as PlantaController from "@controllers/PlantaController";

export const router = Router();

router.post("/", PlantaController.create);
router.post("/:id/venda", PlantaController.vender);
router.get("/", PlantaController.findMany);
router.get("/:id", PlantaController.findById);
router.get("/estoque/valor-total", PlantaController.getTotal);
router.patch("/:id", PlantaController.updateById);
router.delete("/:id", PlantaController.deleteById);
