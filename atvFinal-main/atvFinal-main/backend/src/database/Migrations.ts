import { Migrator, type Kysely, type Migration } from "kysely";


const migrations: Record<string, Migration> = {
    "001": {
        up: async (db: Kysely<any>) => {

            // Tabela recurso
            await db.schema
                .createTable("recurso")
                .addColumn("id", "varchar(36)", col => col.primaryKey())
                .addColumn("secretToken", "varchar(255)", col => col.notNull())
                .addColumn("nome", "varchar(255)", col => col.notNull())
                .addColumn("descricao", "text", col => col.notNull())
                .execute();

            // Tabela usuario
            await db.schema
                .createTable("usuario")
                .addColumn("id", "varchar(36)", col => col.primaryKey())
                .addColumn("nome", "varchar(255)", col => col.notNull())
                .addColumn("senhaHash", "varchar(255)", col => col.notNull())
                .addColumn("role", "varchar(255)", col => col.notNull())
                .execute();

        }
    },
}


export async function migrateToLatest(db: Kysely<any>) {

    const migrator = new Migrator({
        db,
        provider: {
            getMigrations: async () => migrations
        }
    })


    await migrator.migrateToLatest()

}


