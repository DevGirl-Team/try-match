import bcrypt from "bcrypt";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());
app.use(express.json()); // for parsing application/json

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/api/login", async (req: Request, res: Response) => {
  console.log("login", req.body);
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (user) {
      // Check password
      const match = await bcrypt.compare(req.body.password, user.passwordHash);

      if (match) {
        // session token
      } else {
        res.status(400).json({ error: "Mauvais logins" });
      }
    } else {
      res.status(404).json({ error: "L'utilisateur n'existe pas" });
      return;
    }

    res.status(200).json({ user });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

app.get("/api/users", (req: Request, res: Response) => {
  console.log("get");
  res.status(200).json({ error: "message" });
});

app.post("/api/users", async (req: Request, res: Response) => {
  console.log("post", req.body);
  try {
    let user = req.body;

    // Password procress
    const hash = await bcrypt.hash(user.password, 10);

    user = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: hash,
      },
    });

    res.status(200).json({ user });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

http.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
