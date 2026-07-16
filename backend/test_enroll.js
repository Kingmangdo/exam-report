import dotenv from 'dotenv';
dotenv.config();

import { Reservation } from './models/Reservation.js';
import { Student } from './models/Student.js';

async function run() {
  try {
    const r = await Reservation.create({
      name: 'Test Enroll',
      visit_date: new Date().toISOString(),
      student_phone: '010-1111-2222',
      parent_phone: '010-3333-4444'
    });
    console.log('Created Reservation:', r);

    const reservation = await Reservation.getById(r.id);
    console.log('Fetched Reservation:', reservation);

    const studentData = {
      name: reservation.name,
      school: reservation.school || null,
      grade: reservation.grade || null,
      phone: reservation.student_phone || null,
      parent_phone: reservation.parent_phone || null,
      class_name: null
    };
    
    console.log('StudentData to insert:', studentData);

    const student = await Student.create(studentData);
    console.log('Created Student:', student);

    await Reservation.delete(r.id);
    await Student.delete(student.id);
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
run();
