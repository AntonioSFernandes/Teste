
  
import type { USER_ROLES } from "../types"

export interface RecursoRow {

    id: string,

    secretToken: string,

    nome: string,

    descricao: string,

}

export interface UsuarioRow {

    id: string,

    nome: string,

    senhaHash: string,

    role: USER_ROLES

}

export interface DatabaseSchema {
    recurso: RecursoRow,
    usuario: UsuarioRow,
}