import { Request, Response } from "express";
import * as PlantaRepository from "@repositories/PlantaRepository";
import { toBool } from "../utils";


export const create = async (req: Request, res: Response) => {
  try {
    const { 
      nome, especie, preco,
      estoque, luminosidade,
      petFriendly, regaACadaDias
    } = req.body;

    if (
      !nome || !especie || !preco ||
      !estoque || !luminosidade ||
      !String(petFriendly) || !regaACadaDias
    ) {
      return res.status(400).json({
        message: "Preencha todos os campos.",
      });
    }

    if (preco < 0) {
      return res.status(400).json({
        message: "Informe um preço válido.",
      });
    }

    if (regaACadaDias < 1) {
      return res.status(400).json({
        message: "Informe um intervalo de regagem válido.",
      });
    }
     
    if (estoque < 0) {
      return res.status(400).json({
        message: "Informe um valor de estoque válido.",
      });
    }

    if (!["SOMBRA", "MEIA_SOMBRA", "SOL_PLENO"].includes(luminosidade)) {
      return res.status(400).json({
        message: "Informe um valor de luminosidade válido.",
      });
    }

    if (typeof(petFriendly) !== "boolean") {
      return res.status(400).json({
        message: "Informe um valor de pet-friendly válido.",
      });
    }

    const planta = await PlantaRepository.create({
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias
    });

    return res.status(201).json(planta);

  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar planta." });
  }
};
