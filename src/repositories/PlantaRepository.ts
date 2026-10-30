import { Prisma } from "@prisma/client"
import prisma from "@database"

type FindManyFilterQuery = {
  nome?: string
  luminosidade?: "SOMBRA" | "MEIA_SOMBRA" | "SOL_PLENO"
  petFriendly?: boolean
  disponivel?: boolean
}

export const create = async (data: Prisma.PlantaCreateInput) => {
  return await prisma.planta.create({
    data
  });
}

export const findMany = async (page: number = 1, take: number = 10, orderBy: string = "id", filter?: FindManyFilterQuery) => {
  return await prisma.planta.findMany({
    where: {
      nome: filter?.nome 
        ? { contains: filter.nome as string, mode: "insensitive"}
        : undefined,
      luminosidade: filter?.luminosidade,
      petFriendly: filter?.petFriendly,
      estoque: filter?.disponivel === undefined
        ? undefined
        : filter.disponivel
          ? { gt: 0 }
          : { lte: 0 }
    },

    orderBy: { 
      [orderBy]: "asc"
    },

    skip: (page - 1) * take,
    take
  });
}

export const findById = async (id: number) => {
  return await prisma.planta.findUnique({
    where: { id }
  });
}

export const updateById = async (id: number, data: Prisma.PlantaUpdateInput) => {
  return await prisma.planta.update({
    where: { id },
    data
  });
}

export const deleteById = async (id: number) => {
  return await prisma.planta.delete({
    where: { id }
  });
}

export const vendaById = async (id: number, quantidade: number) => {
  const { count } = await prisma.planta.updateMany({
    where: {
      id,
      estoque: { gte: quantidade }
    },
    data: {
      estoque: { decrement: quantidade }
    }
  });

  if (count === 0) {
    return null;
  }

  return await prisma.planta.findUnique({
    where: { id }
  });
}

export const getValorTotal = async () => {
  const plantas = await prisma.planta.findMany({
    select: {
      preco: true,
      estoque: true
    }
  });

  const valorTotal = plantas.reduce((sum, planta) => sum += Number(planta.estoque) * Number(planta.preco), 0);

  return valorTotal;
}

export const getTotalVasos = async () => {
  const { _sum: { estoque }} = await prisma.planta.aggregate({
    _sum: {
      estoque: true
    }
  });

  return estoque ?? 0;
}


