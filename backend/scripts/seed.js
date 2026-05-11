const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("AdiyasaFamily", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@adiyasa.com" },
    update: {
        passwordHash,
        name: "Admin HR PTAA",
        role: "Admin",
        status: "Aktif",
        },
    create: {
      name: "Admin HR PTAA",
      email: "admin@adiyasa.com",
      passwordHash,
      role: "Admin",
      status: "Aktif",
    },
  });

 await prisma.employee.upsert({
  where: { employeeId: "PTAA-001" },
  update: {
    userId: admin.id,
    name: "Admin HR PTAA",
    department: "HR",
    position: "Administrator",
    phone: "08128341837",
    address: "Bekasi",
    joinDate: "2026-01-01",
    employmentStatus: "Aktif",
  },
  create: {
    userId: admin.id,
    employeeId: "PTAA-001",
    name: "Admin HR PTAA",
    department: "HR",
    position: "Administrator",
    phone: "08128341837",
    address: "Bekasi",
    joinDate: "2026-01-01",
    employmentStatus: "Aktif",
  },
});

  console.log("Seed data berhasil dibuat.");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });