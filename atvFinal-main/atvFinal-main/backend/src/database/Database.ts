import type { DatabaseSchema } from "./Schema";
import { Kysely } from "kysely";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from "kysely-bun-sqlite"
import { migrateToLatest } from "./Migrations";

const db = new Kysely<DatabaseSchema>({
    dialect: new BunSqliteDialect({
        database: new Database(":memory:"),
    }),
});

await migrateToLatest(db);

await db.insertInto('recurso').values([
    {
        id: 'recurso-1',
        secretToken: 'token-1',
        nome: 'Recurso 1',
        descricao: 'Descrição do Recurso 1',
    },
    {
        id: 'recurso-2',
        secretToken: 'token-2',
        nome: 'Recurso 2',
        descricao: 'Descrição do Recurso 2',
    },
    {
        id: 'recurso-3',
        secretToken: 'token-3',
        nome: 'Recurso 3',
        descricao: 'Descrição do Recurso 3',
    },
]).execute();

await db.insertInto('usuario').values([
    {
        id: 'admin',
        nome: 'Admin User',
        senhaHash: await Bun.password.hash('admin'),
        role: "ADMIN"
    }
]).execute();

await db.insertInto('usuario').values([
    {
        id: 'user',
        nome: 'Normal User',
        senhaHash: await Bun.password.hash('user'),
        role: "USER"
    }
]).execute();

export { db }