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


export const findMany = async (req: Request, res: Response) => {
  try {
    const { page, take, luminosidade, petFriendly, disponivel } = req.query;

    if (luminosidade && !["SOMBRA", "MEIA_SOMBRA", "SOL_PLENO"].includes(luminosidade as string)) {
      return res.status(400).json({
        message: "Informe um filtro de luminosidade válido.",
      });
    }

    if (petFriendly && toBool(petFriendly as string) === null) {
      return res.status(400).json({
        message: "Informe um filtro de pet-friendly válido.",
      });
    }

    if (disponivel && toBool(disponivel as string) === null) {
      return res.status(400).json({
        message: "Informe um filtro de disponibilidade válido.",
      });
    }

    const filter = {
      luminosidade: (luminosidade as "SOMBRA" | "MEIA_SOMBRA" | "SOL_PLENO" | undefined),
      petFriendly: petFriendly ? toBool(petFriendly as string) as boolean : undefined,
      disponivel: disponivel ? toBool(disponivel as string) as boolean : undefined,
    };

    const plantas = await PlantaRepository.findMany(Number(page), Number(take), filter);

    return res.status(200).json(plantas);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao ler as plantas." });
  }
}

export const findById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const planta = await PlantaRepository.findById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    return res.status(200).json(planta);

  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar planta." });
  }
}

export const updateById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const planta = PlantaRepository.findById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    if (data?.preco < 0) {
      return res.status(400).json({
        message: "Informe um preço válido.",
      });
    }

    if (data?.regaACadaDias < 1) {
      return res.status(400).json({
        message: "Informe um intervalo de regagem válido.",
      });
    }
     
    if (data?.estoque < 0) {
      return res.status(400).json({
        message: "Informe um valor de estoque válido.",
      });
    }

    if (data?.luminosidade && !["SOMBRA", "MEIA_SOMBRA", "SOL_PLENO"].includes(data?.luminosidade as string)) {
      return res.status(400).json({
        message: "Informe um valor de luminosidade válido.",
      });
    }

    if (data?.petFriendly && typeof(data?.petFriendly) !== "boolean") {
      return res.status(400).json({
        message: "Informe um valor de pet-friendly válido.",
      });
    }

    const plantaUpdated = await PlantaRepository.updateById(id, {
      ...data
    });

    return res.status(200).json(plantaUpdated);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
}

export const deleteById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const planta = await PlantaRepository.findById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantaRepository.deleteById(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao deletar planta." });
  }
}

export const vender = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params?.id);
    const { quantidade } = req.body
    const planta = await PlantaRepository.findById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    if (quantidade > planta.estoque) {
      return res.status(400).json({ message: "Sem estoque suficiente." });
    }

    const plantaUpdated = await PlantaRepository.vendaById(id, quantidade);

    return res.status(200).json(plantaUpdated)
    
  } catch (error) {
    return res.status(500).json({ message: "Erro ao vender a planta." });
  }
}
