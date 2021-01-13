import { CustomError } from "../interfaces/response";

export function sendError(status: number, message: string): CustomError {
    return {
        status,
        message
    }
}