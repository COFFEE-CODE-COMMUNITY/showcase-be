import { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"

function errorHandlingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof ZodError) {
    const formattedError = error.errors.reduce((acc, curr) => {
      const path = curr.path.join(".")

      if (!acc[path]) {
        acc[path] = []
      }

      acc[path].push(curr.message);

      return acc
    }, {} as Record<string, string[]>)

    res.status(400).json({ message: 'Bad Request', errors: formattedError })
    return
  } else {
    console.error(error)

    res.status(500).json({ message: 'Internal Server Error' })
    return
  }
}

export default errorHandlingMiddleware