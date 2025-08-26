import { z } from "zod";
// ErrorResponse:
//       type: object
//       properties:
//         type:
//           type: string
//         title:
//           type: string
//         status:
//           type: integer
//         detail:
//           type: string
//         instance:
//           type: string

export const ErrorResponseSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string(),
});

export type ErrorResponseSchemaType = z.infer<typeof ErrorResponseSchema>;

// Custom error class for 404 Not Found errors
export class NotFoundError extends Error {
  public status: number;
  public type: string;
  public title: string;
  public detail: string;
  public instance: string;

  constructor(message: string, instance: string, title: string) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
    this.type = "about:blank";
    this.title = title;
    this.detail = message;
    this.instance = instance;
  }
}

// Helper function to create NotFoundError instances
export function createNotFoundError(
  resource: string,
  id: string | number,
  path: string
): NotFoundError {
  const error = new NotFoundError(
    `The ${resource} with ID ${id} was not found`,
    path,
    `${resource} Not Found`
  );
  return error;
}
