import { Router } from 'express'
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } from '../../controllers/student-controller'

const studentRouteV1 = Router()

studentRouteV1.post('/', createStudent)
studentRouteV1.get('/', getStudents)
studentRouteV1.get('/:id', getStudentById)
studentRouteV1.patch('/:id', updateStudent)
studentRouteV1.delete('/:id', deleteStudent)

export default studentRouteV1