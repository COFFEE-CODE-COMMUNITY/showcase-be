import request from 'supertest'
import app from '../src/main'
import { faker } from "@faker-js/faker"
import db from "../src/utils/db"
import * as bcrypt from 'bcrypt'

describe('POST /api/v1/auth/admin/register', () => {
  afterEach(async () => {
    db.user.deleteMany()
  })

  it('should response 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/register')
      .send({
        username: faker.internet.username().slice(0, 8),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.message).toEqual('User registered successfully')
  })

  it('should response 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/register')
      .send({ username: '', email: '', password: '' })

    expect(res.status).toBe(400)
    expect(res.body.message).toEqual('Bad Request')
    expect(res.body.errors).toBeDefined()
  })
})

describe('POST /api/v1/auth/admin/login', () => {
  afterEach(async () => {
    db.user.deleteMany()
  })

  it('should response 200', async () => {
    const username = faker.internet.username().slice(0, 8)
    const password = faker.internet.password({ length: 8 })
    await db.user.create({
      data: {
        username,
        email: faker.internet.email(),
        password: bcrypt.hashSync(password, 8)
      }
    })

    const res = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ username: username, password: password })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.message).toEqual('User logged in successfully')
  })

  it('should response 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ username: 'username', password: 'password' })

    expect(res.status).toBe(401)
    expect(res.body.message).toEqual('Invalid credentials')
  })
})