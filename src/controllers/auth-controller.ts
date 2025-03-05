import { NextFunction, Request, Response } from "express"
import { z } from "zod"
import db from "../utils/db"
import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

export async function registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const validationSchema = z.object({
    username: z
      .string({ message: "Username must be a string", required_error: "Username is required" })
      .min(4, { message: "Username must be at least 4 characters long" })
      .max(8, { message: "Username must be at most 8 characters long" })
      .refine(async username => {
        return await db.user.count({ where: { username }, take: 1 }) === 0
      }, { message: "Username is already taken" }),
    email: z
      .string({ message: "Email must be a string", required_error: "Email is required" })
      .email({ message: "Email must be a valid email address" })
      .refine(async email => {
        return await db.user.count({ where: { email }, take: 1 }) === 0
      }, { message: "Email is already taken" }),
    password: z
      .string({ message: "Password must be a string", required_error: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .max(8, { message: "Password must be at most 8 characters long" })
      .transform(password => bcrypt.hashSync(password, 8))
  })
  const { error, success, data } = await validationSchema.safeParseAsync(req.body)

  if (!success) {
    return next(error)
  }

  const { id: userId } = await db.user.create({ data, select: { id: true } })

  res.status(201).json({ message: "User registered successfully", data: { token: generateUserToken(userId) } })
  return
}

export async function loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await db.user.findFirst({ where: { username: req.body.username }, select: { id: true, password: true } })
  const validationSchema = z.object({
    username: z
      .string()
      .min(4)
      .max(8),
    password: z
      .string()
      .min(6)
      .max(8)
  }).refine(async data => {
    if (!user) {
      return false
    }
    return bcrypt.compareSync(data.password, user.password)
  })

  const { success } = await validationSchema.safeParseAsync(req.body)

  if (!success) {
    res.status(401).json({ message: "Invalid credentials" })
    return
  }

  res.status(200).json({ message: "User logged in successfully", data: { token: generateUserToken(user!.id) } })
  return
}

function generateUserToken(userId: string) {
  return jwt.sign({ userId }, process.env.USER_TOKEN_SECRET || "", { expiresIn: '1y' })
}