import express from 'express'
import authRouteV1 from "./routes/v1/auth-route"
import studentRouteV1 from "./routes/v1/student-route"
import errorHandlingMiddleware from "./middlewares/errorHandlingMiddleware"
import userAuthMiddleware from "./middlewares/userAuthMiddleware"

const PORT = process.env.APP_PORT || 3000
const app = express()

app.use(express.json())
app.use("/api/v1/auth", authRouteV1)
app.use(userAuthMiddleware)
app.use("/api/v1/students", studentRouteV1)
app.use(errorHandlingMiddleware)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
  })
}

export default app