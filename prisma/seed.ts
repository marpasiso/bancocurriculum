import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: { passwordHash, role: UserRole.ADMIN },
    create: {
      email: "admin@local.test",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: "owner@local.test" },
    update: { passwordHash, role: UserRole.SUPER_ADMIN },
    create: {
      email: "owner@local.test",
      passwordHash,
      role: UserRole.SUPER_ADMIN
    }
  });

  const employerUser = await prisma.user.upsert({
    where: { email: "empregador@local.test" },
    update: { passwordHash, role: UserRole.EMPLOYER, isActive: true },
    create: {
      email: "empregador@local.test",
      passwordHash,
      role: UserRole.EMPLOYER,
      isActive: true
    }
  });

  await prisma.employer.upsert({
    where: { userId: employerUser.id },
    update: {
      companyName: "Empresa Local de Teste",
      contactName: "Responsavel Local",
      document: "00000000000100",
      isActive: true
    },
    create: {
      userId: employerUser.id,
      companyName: "Empresa Local de Teste",
      contactName: "Responsavel Local",
      document: "00000000000100",
      isActive: true
    }
  });

  await Promise.all([
    prisma.systemJobFunction.upsert({
      where: { name: "Auxiliar administrativo" },
      update: {
        description: "Rotinas administrativas, organização de documentos e apoio ao atendimento.",
        isActive: true
      },
      create: {
        name: "Auxiliar administrativo",
        description: "Rotinas administrativas, organização de documentos e apoio ao atendimento.",
        isActive: true
      }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Atendente" },
      update: {
        description: "Atendimento ao público, recepção e apoio em demandas operacionais.",
        isActive: true
      },
      create: {
        name: "Atendente",
        description: "Atendimento ao público, recepção e apoio em demandas operacionais.",
        isActive: true
      }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Vendedor(a)" },
      update: { description: "Atendimento comercial, vendas e relacionamento com clientes.", isActive: true },
      create: { name: "Vendedor(a)", description: "Atendimento comercial, vendas e relacionamento com clientes.", isActive: true }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Serviços gerais" },
      update: { description: "Apoio em limpeza, organização e atividades gerais.", isActive: true },
      create: { name: "Serviços gerais", description: "Apoio em limpeza, organização e atividades gerais.", isActive: true }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Cuidador(a)" },
      update: {
        description: "Acompanhamento e cuidado de pessoas com responsabilidade e atenção.",
        isActive: true
      },
      create: {
        name: "Cuidador(a)",
        description: "Acompanhamento e cuidado de pessoas com responsabilidade e atenção.",
        isActive: true
      }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Doméstica" },
      update: { description: "Serviços domésticos, organização e cuidado do ambiente residencial.", isActive: true },
      create: {
        name: "Doméstica",
        description: "Serviços domésticos, organização e cuidado do ambiente residencial.",
        isActive: true
      }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Motorista" },
      update: { description: "Condução de veículos e apoio em deslocamentos.", isActive: true },
      create: { name: "Motorista", description: "Condução de veículos e apoio em deslocamentos.", isActive: true }
    }),
    prisma.systemJobFunction.upsert({
      where: { name: "Cozinheiro(a)" },
      update: { description: "Preparo de alimentos, organização de cozinha e apoio em rotina alimentar.", isActive: true },
      create: {
        name: "Cozinheiro(a)",
        description: "Preparo de alimentos, organização de cozinha e apoio em rotina alimentar.",
        isActive: true
      }
    })
  ]);

  await prisma.auditLog.create({
    data: {
      action: "SEED_ADMIN_CREATED",
      entity: "User",
      entityId: "admin@local.test"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
