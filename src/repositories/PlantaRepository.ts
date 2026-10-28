import { Prisma } from "@prisma/client"
import prisma from "@database"

type FindManyFilterQuery = {
  luminosidade?: "SOMBRA" | "MEIA_SOMBRA" | "SOL_PLENO"
  petFriendly?: boolean
  disponivel?: boolean
}

export const create = async (data: Prisma.PlantaCreateInput) => {
  return await prisma.planta.create({
    data
  });
}

export const findMany = async (page: number = 1, take: number = 10, filter: FindManyFilterQuery) => {
  return await prisma.planta.findMany({
    where: {
      luminosidade: filter.luminosidade,
      petFriendly: filter.petFriendly,
      estoque: filter.disponivel ? {
        gt: 0
      } : undefined
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
  return await prisma.planta.update({
    where: { id },
    data: {
      estoque: { decrement: quantidade }
    }
  });
}

export const getValorTotal = async () => {
  const { _sum: { estoque, preco } } = await prisma.planta.aggregate({
    _sum: {
      estoque: true,
      preco: true
    }
  });

  return (estoque as number) * (preco as number);
}

export const getTotalVasos = async () => {
  const { _sum: { estoque }} = await prisma.planta.aggregate({
    _sum: {
      estoque: true
    }
  });

  return estoque;
}


