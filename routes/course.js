import express from 'express';
import * as courseController from '../controllers/course.js';
import { requireSignin } from '../middlewares/auth.js';

const router = express.Router();

// get all courses
router.get('/courses', courseController.courses);

// get a specific course with slug
router.get('/course/:slug', courseController.readCourse);

// get an array of curriculums of a specific course specified by slug of the course
router.get('/course/curriculum/:slug', courseController.readCurriculum);

// get a lesson by id
router.get('/course/lesson/:_id', courseController.readLesson);

// get enrolled courses of the logged in user
router.get('/enrolled-courses', requireSignin, courseController.enrolledCourses);

// get posted courses of the logged in user
router.get('/posted-courses', requireSignin, courseController.postedCourses);

// create and save new course with curriculums, lessons
router.post('/course', requireSignin, courseController.create);

// edit and delete course
router.put('/course', requireSignin, courseController.update);
// router.delete('/course/:_id', requireSignin, adController.remove);

// send txt tapescript file to process
router.post('/upload-file-txt', requireSignin, courseController.uploadFileTxt);

// send study4 tapescript html file to process into txt file
router.post('/upload-file-html', requireSignin, courseController.uploadFileHtml);

// upload audio file to Amazon AWS S3
router.post('/upload-file-audio', requireSignin, courseController.uploadFileAudio);

// upload and remove images
router.post('/upload-image', requireSignin, courseController.uploadImage);
router.post('/remove-image', requireSignin, courseController.removeImage);

export default router;
