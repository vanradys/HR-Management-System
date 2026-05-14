const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid." });
  }
}

function allowRoles(...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    next();
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Backend HR PTAA aktif." });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah." });
  }

  if (user.status !== "Aktif") {
    return res.status(403).json({ message: "Akun tidak aktif." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email atau password salah." });
  }

  const token = createToken(user);

  res.json({
    message: "Login berhasil.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
});

app.get("/api/permissions", async (req, res) => {
  try {
    const permissions = await prisma.rolePermission.findMany();

    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil permissions." });
  }
});

app.post("/api/permissions/toggle", async (req, res) => {
  try {
    const { menu, role } = req.body;

    if (!menu || !role) {
      return res.status(400).json({ message: "Menu dan role wajib diisi." });
    }

    if (role === "Admin" || role === "Director") {
      return res.status(403).json({
        message: "Admin dan Director wajib memiliki akses semua fitur.",
      });
    }

    const existing = await prisma.rolePermission.findUnique({
      where: {
        menu_role: {
          menu,
          role,
        },
      },
    });

    const permission = await prisma.rolePermission.upsert({
      where: {
        menu_role: {
          menu,
          role,
        },
      },
      update: {
        canAccess: existing ? !existing.canAccess : true,
      },
      create: {
        menu,
        role,
        canAccess: true,
      },
    });

    res.json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengubah permission." });
  }
});

app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  res.json(user);
});

app.get("/api/employees", authMiddleware, allowRoles("Admin", "HR", "Manager"), async (req, res) => {
  const employees = await prisma.employee.findMany({
    orderBy: { id: "desc" },
  });

  res.json(employees);
});

app.post("/api/employees", authMiddleware, allowRoles("Admin", "HR"), async (req, res) => {
  const employee = await prisma.employee.create({
    data: req.body,
  });

  res.status(201).json(employee);
});

app.get("/api/leave-requests", authMiddleware, async (req, res) => {
  const requests = await prisma.leaveRequest.findMany({
    include: { employee: true },
    orderBy: { id: "desc" },
  });

  res.json(requests);
});

app.post("/api/leave-requests", authMiddleware, async (req, res) => {
  const request = await prisma.leaveRequest.create({
    data: req.body,
  });

  await prisma.notification.create({
    data: {
      title: "Pengajuan cuti baru",
      message: "Ada pengajuan cuti/izin yang perlu diperiksa.",
      type: "leave",
      isRead: false,
    },
  });

  res.status(201).json(request);
});

app.patch("/api/leave-requests/:id/status", authMiddleware, allowRoles("Admin", "HR", "Manager"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const request = await prisma.leaveRequest.update({
    where: { id },
    data: { status },
  });

  res.json(request);
});

app.get("/api/notifications", authMiddleware, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    orderBy: { id: "desc" },
  });

  res.json(notifications);
});

app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  const notification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.json(notification);
});

app.patch("/api/notifications/read-all", authMiddleware, async (req, res) => {
  await prisma.notification.updateMany({
    data: { isRead: true },
  });

  res.json({ message: "Semua notifikasi ditandai sudah dibaca." });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Backend HR PTAA jalan di http://localhost:${port}`);
});