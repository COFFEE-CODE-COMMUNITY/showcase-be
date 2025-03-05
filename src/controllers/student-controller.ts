import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import db from "../utils/db"
import { Prodi } from "@prisma/client"

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  const validationSchema = z.object({
    name: z
      .string({ message: "Name must be a string", required_error: "Name is required" })
      .min(6, { message: "Name must be at least 6 characters long" })
      .max(32, { message: "Name must be at most 32 characters long" }),
    age: z
      .number({ message: "Age must be a number", required_error: "Age is required" })
      .int({ message: "Age must be an integer" })
      .positive({ message: "Age must be a positive number" })
      .min(10, { message: "Age must be at least 10 years old" })
      .max(100, { message: "Age must be at most 100 years old" }),
    nim: z
      .string({ message: "NIM must be a string", required_error: "NIM is required" })
      .length(8, { message: "NIM must be 10 characters long" })
      .refine(async nim => await db.student.count({ where: { nim } }) === 0, { message: "NIM already exists" }),
    prodi: z
      .nativeEnum(Prodi, { message: "Prodi must be one of the available values", required_error: "Prodi is required" }),
    isGraduate: z
      .boolean({ message: "isGraduate must be a boolean", required_error: "isGraduate is required" })
  })
  const { success, data, error } = await validationSchema.safeParseAsync(req.body)

  if (!success) {
    return next(error)
  }

  const student = await db.student.create({ data: { ...data, createdById: req.userId } })

  res.status(201).json({ message: "Student created successfully", data: student })
  return
}

export async function getStudents(req: Request, res: Response): Promise<void> {
  const students = await db.student.findMany()

  res.json({ message: "Ok", data: students })
  return
}

export async function getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  const student = await db.student.findUnique({ where: { id: req.params.id } })

  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }

  res.json(student)
  return
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  const student = await db.student.findUnique({ where: { id: req.params.id } })

  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }

  const validationSchema = z.object({
    name: z
      .string({ message: "Name must be a string", required_error: "Name is required" })
      .min(6, { message: "Name must be at least 6 characters long" })
      .max(32, { message: "Name must be at most 32 characters long" })
      .optional(),
    age: z
      .number({ message: "Age must be a number", required_error: "Age is required" })
      .int({ message: "Age must be an integer" })
      .positive({ message: "Age must be a positive number" })
      .min(10, { message: "Age must be at least 10 years old" })
      .max(100, { message: "Age must be at most 100 years old" })
      .optional(),
    nim: z
      .string({ message: "NIM must be a string", required_error: "NIM is required" })
      .length(8, { message: "NIM must be 10 characters long" })
      .refine(async nim => await db.student.count({ where: { nim } }) === 0, { message: "NIM already exists" })
      .optional(),
    prodi: z
      .nativeEnum(Prodi, { message: "Prodi must be one of the available values", required_error: "Prodi is required" })
      .optional(),
    isGraduate: z
      .boolean({ message: "isGraduate must be a boolean", required_error: "isGraduate is required" })
      .optional()
  })
  const { success, data, error } = await validationSchema.safeParseAsync(req.body)

  if (!success) {
    return next(error)
  }

  const updatedStudent = await db.student.update({ where: { id: req.params.id }, data: data })

  res.json({ message: "Student updated successfully", data: updatedStudent })
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  await db.student.delete({ where: { id: req.params.id } })

  res.status(204).send()
}