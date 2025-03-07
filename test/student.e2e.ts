import app from '../src/main'
import db from '../src/utils/db'
import request from 'supertest'
import jwt from "jsonwebtoken"
import { faker } from "@faker-js/faker"
import { Prodi, Student } from "@prisma/client"
import * as bcrypt from "bcrypt"

let userToken: string
let userId: string

beforeAll(async () => {
  const { id } = await db.user.create({
    data: {
      username: faker.internet.username().slice(0, 8),
      email: faker.internet.email(),
      password: bcrypt.hashSync(faker.internet.password({ length: 8 }), 8)
    },
    select: { id: true }
  })

  userId = id
  userToken =  jwt.sign({ userId }, process.env.USER_TOKEN_SECRET || "", { expiresIn: '1y' })
})

afterAll(async () => await db.user.deleteMany())

describe('POST /api/v1/students', () => {
  afterEach(async () => {
    db.student.deleteMany()
  })

  it('should response 201', async () => {
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
      })

    expect(res.status).toBe(201)
    expect(res.body.message).toEqual('Student has been created')
    expect(res.body.data).toBeDefined()
  })

  it('should response 400', async () => {
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: '', age: '', nim: '', isGraduate: '' })

    expect(res.status).toBe(400)
    expect(res.body.message).toEqual('Bad Request')
    expect(res.body.errors).toBeDefined()
  })
})

describe('GET /api/v1/students', () => {
  let studentsMock: Student[]

  beforeEach(async () => {
    await db.student.createMany({
      data: Array.from({ length: 1000 }, () => ({
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
        createdById: userId
      }))
    })

    studentsMock = await db.student.findMany()
    // @ts-ignore
    studentsMock = studentsMock.map(student => ({
      ...student,
      createdAt: student.createdAt.toISOString(),
      updatedAt: student.updatedAt.toISOString(),
    }))
  })

  afterEach(async () => await db.student.deleteMany())

  it('should response 200', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toEqual('Ok')
    expect(res.body.data).toEqual(studentsMock)
  })
})

describe('GET /api/v1/students/:id', () => {
  let studentMock: Student

  beforeEach(async () => {
    studentMock = await db.student.create({
      data: {
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
        createdById: userId
      }
    })
    // @ts-ignore
    studentMock.createdAt = studentMock.createdAt.toISOString()
    // @ts-ignore
    studentMock.updatedAt = studentMock.updatedAt.toISOString()
  })

  afterEach(async () => await db.student.deleteMany())

  it('should response 200', async () => {
    const res = await request(app)
      .get(`/api/v1/students/${studentMock.id}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(studentMock)
  })

  it('should response 404', async () => {
    const res = await request(app)
      .get('/api/v1/students/' + crypto.randomUUID())
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toEqual('Student not found')
  })
})

describe('PATCH /api/v1/students/:id', () => {
  let studentMock: Student

  beforeEach(async () => {
    studentMock = await db.student.create({
      data: {
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
        createdById: userId
      }
    })
  })

  afterEach(async () => await db.student.deleteMany())

  it('should response 200', async () => {
    const res = await request(app)
      .patch(`/api/v1/students/${studentMock.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
      })

    expect(res.status).toBe(200)
    expect(res.body.message).toEqual('Student has been updated')
    expect(res.body.data).toBeDefined()
  })

  it('should response 404', async () => {
    const res = await request(app)
      .patch('/api/v1/students/' + crypto.randomUUID())
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
      })

    expect(res.status).toBe(404)
    expect(res.body.message).toEqual('Student not found')
  })
})

describe('DELETE /api/v1/students/:id', () => {
  let studentMock: Student

  beforeEach(async () => {
    studentMock = await db.student.create({
      data: {
        name: faker.person.fullName(),
        age: faker.number.int({ min: 10, max: 100 }),
        nim: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
        prodi: faker.helpers.enumValue(Prodi),
        isGraduate: faker.helpers.arrayElement([true, false]),
        createdById: userId
      }
    })
  })

  afterEach(async () => await db.student.deleteMany())

  it('should response 204', async () => {
    const res = await request(app)
      .delete(`/api/v1/students/${studentMock.id}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(204)
  })
})