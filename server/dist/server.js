"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());
// fixing "413 Request Entity Too Large" errors
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user
        const user = yield prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (user) {
            // Check password
            const match = yield bcrypt_1.default.compare(req.body.password, user.passwordHash);
            if (match) {
                // session token
                const sessionToken = "_" + Math.random().toString(36).substring(2, 9);
                // Update user
                yield prisma.user.update({
                    data: Object.assign(Object.assign({}, user), { sessionToken }),
                    where: { id: user.id },
                });
                res
                    .status(200)
                    .json({ data: Object.assign(Object.assign({}, user), { sessionToken }), success: true });
                return;
            }
            else {
                res.status(400).json({ success: false, message: "AAAAAAAAAAH" });
                return;
            }
        }
        else {
            res
                .status(404)
                .json({ success: false, message: "L'utilisateur n'existe pas" });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
app.get("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.status(200).json({ success: true, data: users });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// GET Relations by user
app.get("/api/relations/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRelations = yield prisma.userRelation.findMany({
            where: {
                userId: parseInt(req.params.userId),
            },
        });
        const relations = yield prisma.relation.findMany({
            where: {
                id: { in: userRelations.map(({ relationId }) => relationId) },
            },
            include: {
                UsersRelation: true,
            },
        });
        res.status(200).json({ success: true, data: relations });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// POST Relation
app.post("/api/relations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let relation = req.body;
        const userRelationWhosHasBeenLikedId = relation.userWhoHasBeenLiked;
        const userRelationWhoLikedId = relation.userWhoLiked;
        // Create relation
        relation = yield prisma.relation.create({
            data: {
                isMatch: false,
            },
        });
        // Create two userRelation
        const userRelationWhosHasBeenLiked = yield prisma.userRelation.create({
            data: {
                userId: parseInt(userRelationWhosHasBeenLikedId),
                relationId: relation.id,
                hadLiked: false,
            },
        });
        const userRelationWhoLiked = yield prisma.userRelation.create({
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
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// PUT Relation
app.put("/api/relations/:relationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let relation = req.body;
        relation = yield prisma.relation.update({
            data: relation,
            where: {
                id: parseInt(req.params.relationId),
            },
        });
        res.status(200).json({ data: relation, success: true });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// GET Discussions by id
app.get("/api/discussions/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const discussions = yield prisma.discussion.findUnique({
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
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// GET Discussions by user
app.get("/api/discussions/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDiscussions = yield prisma.userDiscussion.findMany({
            where: {
                userId: parseInt(req.params.userId),
            },
        });
        const discussions = yield prisma.discussion.findMany({
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
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// POST Discussion
app.post("/api/discussions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // body -> {usersId: [1, 2]}
        // Create discussion
        const discussion = yield prisma.discussion.create({
            data: {},
        });
        // Create discussion relations
        req.body.usersId.forEach((id) => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.userDiscussion.create({
                data: {
                    discussionId: discussion.id,
                    userId: id,
                },
            });
        }));
        res.status(200).json({ data: discussion, success: true });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// POST Message
app.post("/api/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create discussion
        const message = yield prisma.message.create({
            data: {
                content: req.body.content,
                userId: parseInt(req.body.userId),
                discussionId: parseInt(req.body.discussionId),
            },
        });
        console.log(message);
        res.status(200).json({ data: message, success: true });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// PUT User Relation
app.put("/api/usersrelation/:userrelationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let relation = req.body;
        relation = yield prisma.userRelation.update({
            data: relation,
            where: {
                id: parseInt(req.params.userrelationId),
            },
        });
        res.status(200).json({ data: relation, success: true });
    }
    catch (e) {
        res.status(500).json({ success: false, message: e });
    }
}));
// GET User by id
app.get("/api/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.userId;
        // Check if user exists
        let user = yield prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (user) {
            res.status(200).json({ success: true, data: user });
        }
        else
            res
                .status(404)
                .json({ success: false, message: "L'utilisateur n'existe po" });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// POST User
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = req.body;
        // Password procress
        const hash = yield bcrypt_1.default.hash(user.password, 10);
        user = yield prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                passwordHash: hash,
            },
        });
        res.status(200).json({ user });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
// PUT User
app.put("/api/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.userId;
        // Check if user exists
        let user = yield prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (user) {
            user = Object.assign(Object.assign({}, user), req.body);
            // Update user
            yield prisma.user.update({
                data: Object.assign({}, user),
                where: { id: parseInt(id) },
            });
            res.status(200).json({ success: true, data: user });
        }
        else
            res
                .status(404)
                .json({ success: false, message: "L'utilisateur n'existe po" });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// GET game levels
app.get("/api/gameLevels", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists
        let gameLevels = yield prisma.gameLevel.findMany();
        if (gameLevels) {
            res.status(200).json({ success: true, data: gameLevels });
        }
        else
            res
                .status(404)
                .json({ success: false, message: "L'utilisateur n'existe po" });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
// GET user game level by user id
app.get("/api/userGameLevels/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.userId;
        // Check if user exists
        let userGameLevels = yield prisma.userGameLevel.findMany({ where: { userId: parseInt(id) } });
        if (userGameLevels) {
            res.status(200).json({ success: true, data: userGameLevels });
        }
        else
            res
                .status(404)
                .json({ success: false, message: "L'utilisateur n'existe po" });
    }
    catch (e) {
        res.status(500).json({ message: e, success: false });
    }
}));
http.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
//# sourceMappingURL=server.js.map