import bcrypt from "bcrypt";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { Discussion, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());
// fixing "413 Request Entity Too Large" errors
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/api/login", async (req: Request, res: Response) => {
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
        const sessionToken = "_" + Math.random().toString(36).substring(2, 9);

        // Update user
        await prisma.user.update({
          data: { ...user, sessionToken },
          where: { id: user.id },
        });

        res
          .status(200)
          .json({ data: { ...user, sessionToken }, success: true });
        return;
      } else {
        res.status(400).json({ success: false, message: "AAAAAAAAAAH" });
        return;
      }
    } else {
      res
        .status(404)
        .json({ success: false, message: "L'utilisateur n'existe pas" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
});

// GET Relations by user
app.get("/api/relations/:userId", async (req: Request, res: Response) => {
  try {
    const userRelations = await prisma.userRelation.findMany({
      where: {
        userId: parseInt(req.params.userId),
      },
    });

    const relations = await prisma.relation.findMany({
      where: {
        id: { in: userRelations.map(({ relationId }) => relationId) },
      },
      include: {
        UsersRelation: true,
      },
    });
    res.status(200).json({ success: true, data: relations });
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
});
// POST Relation
app.post("/api/relations", async (req: Request, res: Response) => {
  try {
    let relation = req.body;
    const userRelationWhosHasBeenLikedId = relation.userWhoHasBeenLiked;
    const userRelationWhoLikedId = relation.userWhoLiked;

    // Create relation
    relation = await prisma.relation.create({
      data: {
        isMatch: false,
      },
    });

    // Create two userRelation
    const userRelationWhosHasBeenLiked = await prisma.userRelation.create({
      data: {
        userId: parseInt(userRelationWhosHasBeenLikedId),
        relationId: relation.id,
        hadLiked: false,
      },
    });
    const userRelationWhoLiked = await prisma.userRelation.create({
      data: {
        userId: parseInt(userRelationWhoLikedId),
        relationId: relation.id,
        hadLiked: true,
      },
    });

    relation.UsersRelation = [
      userRelationWhosHasBeenLiked,
      userRelationWhoLiked,
    ];

    res.status(200).json({ data: relation, success: true });
  } catch (e) {
    res.status(500).json({ message: e, success: false });
  }
});
// PUT Relation
app.put("/api/relations/:relationId", async (req: Request, res: Response) => {
  try {
    let relation = req.body;

    relation = await prisma.relation.update({
      data: relation,
      where: {
        id: parseInt(req.params.relationId),
      },
    });

    res.status(200).json({ data: relation, success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
});

// GET Discussions by id
app.get("/api/discussions/:id", async (req: Request, res: Response) => {
  try {
    const discussions = await prisma.discussion.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        UsersDiscussion: {
          include: { user: true },
        },
        Messages: {
          select: {
            userId: true,
            content: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, data: discussions });
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
});
// GET Discussions by user
app.get(
  "/api/discussions/user/:userId",
  async (req: Request, res: Response) => {
    try {
      const userDiscussions = await prisma.userDiscussion.findMany({
        where: {
          userId: parseInt(req.params.userId),
        },
      });

      const discussions = await prisma.discussion.findMany({
        where: {
          id: { in: userDiscussions.map(({ discussionId }) => discussionId) },
        },
        include: {
          UsersDiscussion: {
            include: { user: true },
          },
        },
      });
      res.status(200).json({ success: true, data: discussions });
    } catch (e) {
      res.status(500).json({ success: false, message: e });
    }
  }
);
// POST Discussion
app.post("/api/discussions", async (req: Request, res: Response) => {
  try {
    // body -> {usersId: [1, 2]}

    // Create discussion
    const discussion = await prisma.discussion.create({
      data: {} as Discussion,
    });

    // Create discussion relations
    req.body.usersId.forEach(async (id: number) => {
      await prisma.userDiscussion.create({
        data: {
          discussionId: discussion.id,
          userId: id,
        },
      });
    });

    res.status(200).json({ data: discussion, success: true });
  } catch (e) {
    res.status(500).json({ message: e, success: false });
  }
});

// POST Message
app.post("/api/messages", async (req: Request, res: Response) => {
  try {
    // Create discussion
    const message = await prisma.message.create({
      data: {
        content: req.body.content,
        userId: parseInt(req.body.userId),
        discussionId: parseInt(req.body.discussionId),
      },
    });

    console.log(message);

    res.status(200).json({ data: message, success: true });
  } catch (e) {
    res.status(500).json({ message: e, success: false });
  }
});

// PUT User Relation
app.put(
  "/api/usersrelation/:userrelationId",
  async (req: Request, res: Response) => {
    try {
      let relation = req.body;

      relation = await prisma.userRelation.update({
        data: relation,
        where: {
          id: parseInt(req.params.userrelationId),
        },
      });

      res.status(200).json({ data: relation, success: true });
    } catch (e) {
      res.status(500).json({ success: false, message: e });
    }
  }
);

// GET User by id
app.get("/api/users/:userId", async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (user) {
      res.status(200).json({ success: true, data: user });
    } else
      res
        .status(404)
        .json({ success: false, message: "L'utilisateur n'existe po" });
  } catch (e) {
    res.status(500).json({ message: e, success: false });
  }
});
// POST User
app.post("/api/users", async (req: Request, res: Response) => {
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
// PUT User
app.put("/api/users/:userId", async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (user) {
      user = { ...user, ...req.body };
      // Update user
      await prisma.user.update({
        data: { ...user },
        where: { id: parseInt(id) },
      });

      res.status(200).json({ success: true, data: user });
    } else
      res
        .status(404)
        .json({ success: false, message: "L'utilisateur n'existe po" });
  } catch (e) {
    res.status(500).json({ message: e, success: false });
  }
});

http.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
