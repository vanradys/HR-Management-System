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

app.get(
  "/api/users",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: [{ id: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });

      res.json(users.map((user) => ({
        ...user,
        id: String(user.id),
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil daftar pengguna." });
    }
  }
);

app.get(
  "/api/permissions",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const permissions = await prisma.rolePermission.findMany({
        orderBy: [{ menu: "asc" }, { role: "asc" }],
      });

      res.json(permissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil permissions." });
    }
  }
);

app.put(
  "/api/users/:id",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, status } = req.body;

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          name,
          role,
          status,
        },
      });

      res.json({
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal update user." });
    }
  }
);


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