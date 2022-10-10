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
app.use(express_1.default.json()); // for parsing application/json
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("login", req.body);
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
            }
            else {
                res.status(400).json({ error: "Mauvais logins" });
            }
        }
        else {
            res.status(404).json({ error: "L'utilisateur n'existe pas" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (e) {
        res.status(500).json({ error: e });
    }
}));
app.get("/api/users", (req, res) => {
    console.log("get");
    res.status(200).json({ error: "message" });
});
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("post", req.body);
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
http.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
//# sourceMappingURL=server.js.map