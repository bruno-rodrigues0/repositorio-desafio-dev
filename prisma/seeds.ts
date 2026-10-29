import "dotenv/config"
import prisma from "@database"

type PlantaSeed = {
  nome: string,
  especie: string,
  preco: number,
  estoque: number,
  luminosidade: "MEIA_SOMBRA" | "SOMBRA" | "SOL_PLENO",
  petFriendly: boolean,
  regaACadaDias: number
}

const seeds: PlantaSeed[] = [
  {
    "nome": "Samambaia-americana",
    "especie": "Nephrolepis exaltata",
    "preco": 2500,
    "estoque": 20,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 2
  },
  {
    "nome": "Espada-de-São-Jorge",
    "especie": "Dracaena trifasciata",
    "preco": 3500,
    "estoque": 12,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 10
  },
  {
    "nome": "Jiboia",
    "especie": "Epipremnum aureum",
    "preco": 1800,
    "estoque": 30,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 4
  },
  {
    "nome": "Lírio-da-paz",
    "especie": "Spathiphyllum wallisii",
    "preco": 4200,
    "estoque": 8,
    "luminosidade": "SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 3
  },
  {
    "nome": "Cacto-mandacaru",
    "especie": "Cereus jamacaru",
    "preco": 5500,
    "estoque": 6,
    "luminosidade": "SOL_PLENO",
    "petFriendly": false,
    "regaACadaDias": 12
  },
  {
    "nome": "Suculenta-echevéria",
    "especie": "Echeveria elegans",
    "preco": 1200,
    "estoque": 45,
    "luminosidade": "SOL_PLENO",
    "petFriendly": false,
    "regaACadaDias": 10
  },
  {
    "nome": "Palmeira-ráfis",
    "especie": "Rhapis excelsa",
    "preco": 8900,
    "estoque": 5,
    "luminosidade": "SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 4
  },
  {
    "nome": "Costela-de-adão",
    "especie": "Monstera deliciosa",
    "preco": 7500,
    "estoque": 9,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 5
  },
  {
    "nome": "Lavanda",
    "especie": "Lavandula angustifolia",
    "preco": 3200,
    "estoque": 18,
    "luminosidade": "SOL_PLENO",
    "petFriendly": false,
    "regaACadaDias": 5
  },
  {
    "nome": "Hibisco",
    "especie": "Hibiscus rosa-sinensis",
    "preco": 4800,
    "estoque": 11,
    "luminosidade": "SOL_PLENO",
    "petFriendly": false,
    "regaACadaDias": 2
  },
  {
    "nome": "Maranta-tricolor",
    "especie": "Maranta leuconeura",
    "preco": 3800,
    "estoque": 14,
    "luminosidade": "SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 3
  },
  {
    "nome": "Alecrim",
    "especie": "Salvia rosmarinus",
    "preco": 1500,
    "estoque": 25,
    "luminosidade": "SOL_PLENO",
    "petFriendly": true,
    "regaACadaDias": 4
  },
  {
    "nome": "Antúrio",
    "especie": "Anthurium andraeanum",
    "preco": 5900,
    "estoque": 7,
    "luminosidade": "MEIA_SOMBRA",
    "petFriendly": false,
    "regaACadaDias": 3
  },
  {
    "nome": "Peperômia-melancia",
    "especie": "Peperomia argyreia",
    "preco": 2900,
    "estoque": 16,
    "luminosidade": "SOMBRA",
    "petFriendly": true,
    "regaACadaDias": 6
  },
  {
    "nome": "Pata-de-elefante",
    "especie": "Beaucarnea recurvata",
    "preco": 11000,
    "estoque": 4,
    "luminosidade": "SOL_PLENO",
    "petFriendly": false,
    "regaACadaDias": 12
  }
]

async function main() {
  for (const planta of seeds) {
    const existente = await prisma.planta.findFirst({
      where: {
        nome: { equals: planta.nome, mode: "insensitive" },
        especie: { equals: planta.especie, mode: "insensitive" }
      }
    })

    if (!existente) {
      await prisma.planta.create({ data: planta })
    }
  }
}

main()
  .then(() => console.log("🌱 Seed executada com sucesso"))
  .catch((error) => {
    console.error("❌ Erro ao executar a seed", error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
