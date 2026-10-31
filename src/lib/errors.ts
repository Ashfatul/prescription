import { ZodError } from "zod";

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      message: "Validation failed",
      details: error.flatten(),
    };
  }

  return {
    status: 500,
    message: "Internal server error",
  };
}
