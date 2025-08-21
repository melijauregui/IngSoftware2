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
