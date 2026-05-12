const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const users = [
  {
    employeeId: "PTAA-001",
    name: "Admin HR PTAA",
    email: "admin@adiyasa.com",
    password: "AdiyasaFamily",
    role: "Admin",
    department: "HRD",
    position: "Administrator",
  },

  {
    employeeId: "PTAA-002",
    name: "Marketing PTAA",
    email: "marketing@adiyasa.com",
    password: "MarketingPTAA",
    role: "Marketing",
    department: "Marketing",
    position: "Marketing Staff",
  },

  {
    employeeId: "PTAA-003",
    name: "Finance PTAA",
    email: "finance@adiyasa.com",
    password: "FinancePTAA",
    role: "Finance",
    department: "Finance",
    position: "Finance Staff",
  },

  {
    employeeId: "PTAA-004",
    name: "HRD PTAA",
    email: "hrd@adiyasa.com",
    password: "HRDPTAA",
    role: "HRD",
    department: "HRD",
    position: "HRD Staff",
  },

  {
    employeeId: "PTAA-005",
    name: "Director PTAA",
    email: "director@adiyasa.com",
    password: "DirectorPTAA",
    role: "Director",
    department: "Management",
    position: "Director",
  },

  {
    employeeId: "PTAA-006",
    name: "GA PTAA",
    email: "ga@adiyasa.com",
    password: "GAPTAA",
    role: "GA",
    department: "General Affairs",
    position: "GA Staff",
  },

  {
    employeeId: "PTAA-007",
    name: "Purchasing PTAA",
    email: "purchasing@adiyasa.com",
    password: "PurchasingPTAA",
    role: "Purchasing",
    department: "Purchasing",
    position: "Purchasing Staff",
  },

  {
    employeeId: "PTAA-008",
    name: "Engineering 1 PTAA",
    email: "engineering1@adiyasa.com",
    password: "Engineering1PTAA",
    role: "Engineering",
    department: "Engineering",
    position: "Engineering Staff",
  },

  {
    employeeId: "PTAA-009",
    name: "Engineering 2 PTAA",
    email: "engineering2@adiyasa.com",
    password: "Engineering2PTAA",
    role: "Engineering",
    department: "Engineering",
    position: "Engineering Staff",
  },

  {
    employeeId: "PTAA-010",
    name: "Engineering 3 PTAA",
    email: "engineering3@adiyasa.com",
    password: "Engineering3PTAA",
    role: "Engineering",
    department: "Engineering",
    position: "Engineering Staff",
  },
];

async function main() {
  for (const item of users) {
    const passwordHash = await bcrypt.hash(item.password, 10);

    const user = await prisma.user.upsert({
      where: {
        email: item.email,
      },

      update: {
        name: item.name,
        passwordHash,
        role: item.role,
        status: "Aktif",
      },

      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        role: item.role,
        status: "Aktif",
      },
    });

    await prisma.employee.upsert({
      where: {
        employeeId: item.employeeId,
      },

      update: {
        userId: user.id,
        name: item.name,
        department: item.department,
        position: item.position,
        phone: "",
        address: "Bekasi",
        joinDate: "2026-01-01",
        employmentStatus: "Aktif",
      },

      create: {
        userId: user.id,
        employeeId: item.employeeId,
        name: item.name,
        department: item.department,
        position: item.position,
        phone: "",
        address: "Bekasi",
        joinDate: "2026-01-01",
        employmentStatus: "Aktif",
      },
    });

    console.log(`User ${item.email} berhasil dibuat / diupdate.`);
  }

  console.log("Semua seed data berhasil dibuat.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });