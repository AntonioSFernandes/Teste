import { Elysia, t } from "elysia";
import type { USER_ROLES } from "../../types";
import { password, randomUUIDv7 } from "bun";
import { db } from "../../database/Database";
import { randomUUID } from "crypto"

const sessoes = new Map<string, {
    userId: string,
    sessionToken: string,
    username: string,
    role: USER_ROLES,
    expiresAt: number
}>(); // key: sessionToken

const SESSAO_DURACAO_MS = 1000 * 60 * 60 * 24 // 24 horas

setInterval(() => {
    const agora = Date.now();
    for (const [token, sessao] of sessoes) {
        if (sessao.expiresAt < agora) {
            sessoes.delete(token);
        }
    }
}, SESSAO_DURACAO_MS / 8);


export const AuthPlugin = new Elysia()
    .onRequest(({request})=>{
        // console.log("Request headers:", request.headers);
    })
    .guard({
        headers: t.Object({
            authorization: t.Optional(t.String())
        })
    })
    .macro("rawAuth", {
        resolve: async ({ headers, status }) => {
            const token = headers.authorization;

            // console.log("macro rawAuth headers:", headers);

            if (!token) {
                return { rawAuth: null };
            }

            const sessao = sessoes.get(token);

            // console.log("macro rawAuth sessao:", sessao);

            if (!sessao) {
                return { rawAuth: null };
            }

            if (sessao.expiresAt <= Date.now()) {
                sessoes.delete(token);
                return { rawAuth: null };
            }

            const rawAuth = {
                userId: sessao.userId,
                username: sessao.username,
                role: sessao.role,
            };

            // console.log("macro rawAuth:", rawAuth);

            return { rawAuth };
        },

    })
    .macro({
        requireBeUser: {
            resolve: async ({ headers, status }) => {
                const token = headers.authorization;

                if (!token) {

                    return status(401, "Token de autenticação não fornecido");

                }

                const sessao = sessoes.get(token);

                if (!sessao) {
                    return status(401, "Token de autenticação inválido");

                }

                if (sessao.expiresAt <= Date.now()) {
                    sessoes.delete(token);
                    return status(401, "Sessão expirada");
                }

                const auth = {
                    userId: sessao.userId,
                    username: sessao.username,
                    role: sessao.role,
                };

                return { auth };
            },
        },
    })
    .macro("requireBeAdmin", {
        requireBeUser: true,
        beforeHandle({ auth, status }) {
            if (auth.role != "ADMIN") {
                status(403, "Acesso negado");
                return false;
            }
        }
    })
    .post("/register", async ({ body, status }) => {

        const usuarioExistente = await db.selectFrom('usuario')
            .where('nome', '=', body.nome)
            .selectAll()
            .executeTakeFirst();

        if (usuarioExistente) {
            // console.log("/cadastro usuario ja existe:", body.nome);
            return status(409, `Usuário já existe`);
        }

        const hash = await password.hash(body.password);

        const id = randomUUIDv7();

        const novoUsuario = await db.insertInto('usuario').values({
            id,
            nome: body.nome,
            senhaHash: hash,
            role: "USER"
        }).returningAll().executeTakeFirst();

        if (!novoUsuario) {
            // console.log("/cadastro Erro ao criar usuário:", body.nome);
            return status(500, "Erro ao criar usuário");
        }

        // console.log("Novo usuário registrado:", novoUsuario);

        const sessionToken = randomUUID();

        const expiresAt = Date.now() + SESSAO_DURACAO_MS;

        sessoes.set(sessionToken, {
            sessionToken,
            expiresAt,
            userId: novoUsuario.id,
            username: novoUsuario.nome,
            role: novoUsuario.role,
        });

        // console.log("Sessão criada para novo usuário:", novoUsuario.nome, "  /  ", sessionToken);

        return status(200, {
            sessionToken,
            role: novoUsuario.role,
        });

    }, {
        body: t.Object({
            nome: t.String(),
            password: t.String(),
        }),
        response: {
            200: t.Object({
                sessionToken: t.String(),
                role: t.Enum({ ADMIN: "ADMIN", USER: "USER" } as const),
            }),
            409: t.String(),
            500: t.String(),
        }
    })
    .post("/login", async ({ body, status }) => {

        const usuario = await db.selectFrom('usuario')
            .where('nome', '=', body.nome)
            .selectAll()
            .executeTakeFirst();

        if (!usuario) {
            status(401, "Usuário ou senha inválidos");
            return;
        }

        const senhaValida = await password.verify(usuario.senhaHash, body.password);

        if (!senhaValida) {
            status(401, "Usuário ou senha inválidos");
            return;
        }

        const oldSessions = Array.from(sessoes.entries()).filter(([_, s]) => s.userId === usuario.id);
        for (const [token] of oldSessions) {
            sessoes.delete(token);
        }

        const sessionToken = randomUUID();
        const expiresAt = Date.now() + SESSAO_DURACAO_MS;

        sessoes.set(sessionToken, {
            sessionToken,
            expiresAt,
            userId: usuario.id,
            username: usuario.nome,
            role: usuario.role,
        });

        status(200, { sessionToken, role: usuario.role });

    },
        {
            body: t.Object({
                nome: t.String(),
                password: t.String(),
            })
        }
    )
    .post("/logout", ({ rawAuth, status }) => {
        if (!rawAuth) {
            return status(200)
        }

        Array.from(sessoes.entries()).filter(([_, s]) => s.userId === rawAuth.userId).forEach(([token]) => {
            sessoes.delete(token);
        });

        return status(200);

    }, {
        rawAuth: true,
    })
    .get("/me", ({ rawAuth, status }) => {


        if (!rawAuth) {
            console.log("/me  auth null");
            return { authStatus: null };
        }

        console.log("/me  auth:", rawAuth);

        return {
            authStatus: {
                username: rawAuth.username,
                role: rawAuth.role,
            }
        };
    }, {
        rawAuth: true,
    })
