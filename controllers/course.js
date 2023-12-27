import { nanoid } from 'nanoid';
import * as config from '../config.js';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { emailTemplate } from '../helpers/email.js';

import Course from '../models/course.js';
import Curriculum from '../models/curriculum.js';
import Lesson from '../models/lesson.js';
import TapeScript from '../models/tapescript.js';

import User from '../models/user.js';
import slugify from 'slugify';

import fs from 'fs';
import multer from 'multer';
const upload = multer({ dest: 'public/uploads/' }).single('file');

import { memoryStorage } from 'multer';
const storage = memoryStorage();
const uploadIntoBuffer = multer({ storage }).single('audiofile');

// get all courses
export const courses = async (req, res) => {
    try {
        const data = await Course.find();

        res.json(data);
    } catch (err) {
        console.log(err);
    }
};

// get course specified by slug of the course
export const readCourse = async (req, res) => {
    try {
        const slug = req.params.slug;
        // console.log(slug);

        const course = await Course.findOne({ slug });
        // .populate('curriculum', 'name lession description length slug');

        res.json(course);
    } catch (err) {
        console.log(err);
    }
};

// get all curriculums of the course specified by slug of the course, return an array
export const readCurriculum = async (req, res) => {
    try {
        const slug = req.params.slug;
        const course = await Course.findOne({ slug });

        const curriculums = await Curriculum.find({ _id: course.curriculums }).populate('lessons');

        // const curriculums = await Curriculum.find({ slug: course.curriculumsSlug }).populate('lessons');

        res.json(curriculums);
    } catch (err) {
        console.log(err);
    }
};

// get lesson by id, return lesson and tapescript
export const readLesson = async (req, res) => {
    try {
        const lessonId = req.params._id;
        const lesson = await Lesson.findById(lessonId);
        const tapescriptId = lesson.tapescript;
        const tapescript = await TapeScript.findById(tapescriptId);

        res.json({ lesson, tapescript });
    } catch (err) {
        console.log(err);
    }
};

// get enrolled courses of the logged in user
export const enrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const courses = await Course.find({ _id: user.enrolledCourses }).sort({
            createdAt: -1,
        });
        res.json(courses);
    } catch (err) {
        console.log(err);
    }
};

// get posted courses of the logged in user
export const postedCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const courses = await Course.find({ _id: user.postedCourses }).sort({
            createdAt: -1,
        });
        res.json(courses);
    } catch (err) {
        console.log(err);
    }
};

export const uploadFileTxt = (req, res) => {
    upload(req, res, (err) => {
        const file = req.file;

        if (!err) {
            console.log(file);

            //Normalizing the path for windows environment
            // var path = require('path')
            // var normalPath = path.normalize(__dirname + '/test.txt');
            //Reading the test.txt file in Async mode
            // fs.readFile(normalPath, function (err, data) {
            //     console.log(data.toString());
            // });

            fs.readFile(`${file.path}`, async function (err, data) {
                if (!err) {
                    // console.log(data.toString());
                    let array = data.toString().split(/\r?\n/);
                    // console.log(array);

                    var count = 1;
                    var english = '';
                    var vietnamese = '';
                    // var timeStart = 0;
                    var timeStart = '';

                    var tapescript = [];
                    array?.map((line) => {
                        if (count === 1) {
                            // timeStart = parseInt(line);
                            timeStart = line;
                            console.log(`timeStart: ${line}`);
                            count = 2;
                        } else if (count === 2) {
                            english = line;
                            console.log(`English: ${line}`);
                            count = 3;
                        } else if (count === 3) {
                            if (isNaN(line)) {
                                vietnamese = line;
                                console.log(`Vietnamese: ${line}`);
                                count = 1;

                                let newLine = {
                                    english,
                                    vietnamese,
                                    timeStart,
                                };

                                console.log(newLine);

                                tapescript.push(newLine);
                                // tapescript = [...tapescript, newLine];
                            } else {
                                vietnamese = '';
                                let newLine = {
                                    english,
                                    vietnamese,
                                    timeStart,
                                };

                                console.log(newLine);

                                tapescript.push(newLine);
                                // tapescript = [...tapescript, newLine];

                                timeStart = line;
                                count = 2;
                            }
                        }
                    });
                    console.log(tapescript);
                    try {
                        const tapescriptDb = await new TapeScript({ tapescript });
                        const tapescriptId = tapescriptDb._id;
                        tapescriptDb.save();
                        res.json(tapescriptId);
                    } catch (err) {
                        console.log(err);
                        res.json({ error: 'Something went wrong when uploading a file. Try later.' });
                    }
                } else {
                    console.log(err);
                }
            });

            // var data = fs.readFileSync(`${file.path}`);
            // console.log(data);
        } else {
            console.log(err);
        }
    });
};

export const uploadFileHtml = (req, res) => {
    upload(req, res, (err) => {
        const file = req.file;

        if (!err) {
            console.log(file);

            //Normalizing the path for windows environment
            // var path = require('path')
            // var normalPath = path.normalize(__dirname + '/test.txt');
            //Reading the test.txt file in Async mode
            // fs.readFile(normalPath, function (err, data) {
            //     console.log(data.toString());
            // });

            fs.readFile(`${file.path}`, async function (err, data) {
                if (!err) {
                    // console.log(data.toString());
                    let array = data.toString().split(/\r?\n/);
                    // console.log(array);

                    var tapescript = [];
                    var strTapescript = '';
                    var fileName = '';
                    array?.map((line) => {
                        if (line.includes('data-time')) {
                            const tempArray = line.split(`"`);
                            // console.log('found data time:', tempArray);
                            // console.log('time:', tempArray[3]);

                            const time = tempArray[3];
                            tapescript.push(time);
                            if (strTapescript === '') {
                                strTapescript = strTapescript + time;
                            } else {
                                strTapescript = strTapescript + `\n` + time;
                            }
                        } else if (line.includes('item-text-content')) {
                            const tempArray = line.replaceAll('>', '<').split(/</);
                            const english = tempArray[2];
                            tapescript.push(english);
                            strTapescript = strTapescript + `\n` + english;
                        } else if (line.includes('item-subtext')) {
                            const tempArray = line.replaceAll('>', '<').split(/</);
                            const vietnamese = tempArray[2];
                            tapescript.push(vietnamese);
                            strTapescript = strTapescript + `\n` + vietnamese;
                        } else if (line.includes('h4')) {
                            const tempArray = line.replaceAll('>', '<').split(/</);
                            fileName = tempArray[2];
                            console.log('filename:', fileName);
                            fileName = fileName.replaceAll(':', '').replaceAll(',', '');
                        }
                    });
                    fs.writeFile(`public\\uploads\\${fileName}.txt`, strTapescript, (err) => {
                        if (err) console.log(err);
                        else {
                            console.log(`File ${fileName}.txt written successfully\n`);
                            //   console.log("The written has the following contents:");
                            //   console.log(fs.readFileSync("books.txt", "utf8"));
                        }
                    });

                    // console.log(tapescript);
                    console.log(strTapescript);
                    res.json(tapescript);

                    // try {
                    //     const tapescriptDb = await new TapeScript({ tapescript });
                    //     const tapescriptId = tapescriptDb._id;
                    //     tapescriptDb.save();
                    //     res.json(tapescriptId);
                    // } catch (err) {
                    //     console.log(err);
                    //     res.json({ error: 'Something went wrong when uploading a file. Try later.' });
                    // }
                } else {
                    console.log(err);
                }
            });

            // var data = fs.readFileSync(`${file.path}`);
            // console.log(data);
        } else {
            console.log(err);
        }
    });
};

// create and save new course with curriculums, lessons
export const create = async (req, res) => {
    try {
        // console.log(req.body.objs[0]);
        // console.log(req.body.objs[1]);

        const courseData = req.body.objs[0];
        const { photos, title, description, objective, price, type } = courseData;
        const curriculumsData = req.body.objs[1];

        // validation
        // if (!photos?.length) {
        //     return res.json({ error: 'Photos are required' });
        // }
        // if (!price) {
        //     return res.json({ error: 'Price is required' });
        // }
        // if (!type) {
        //     return res.json({ error: 'Is property house or land?' });
        // }
        // if (!address) {
        //     return res.json({ error: 'Address is required' });
        // }
        // if (!description) {
        //     return res.json({ error: 'Description is required' });
        // }
        if (!title) {
            return res.json({ error: 'Title is required' });
        }

        const curriculums = [];
        curriculumsData?.map((curriculum) => {
            const lessons = [];
            curriculum?.lessons?.map((lesson, index) => {
                try {
                    const lessonDb = new Lesson({ ...lesson, postedBy: req.user._id });
                    // if (lesson?.tapescript) {
                    //     lessonDb.tapescript = lesson.tapescript;
                    // }
                    const newLessonId = lessonDb._id;
                    lessons.push(newLessonId);
                    lessonDb.save();

                    // console.log(newLessonId);
                    console.log('lesson:', lesson);
                } catch (err) {
                    console.log(err);
                    res.json({ error: 'Can not save lesson!' });
                }
            });
            try {
                const curriculumDb = new Curriculum({ ...curriculum, lessons: lessons, postedBy: req.user._id });
                const newCurriculumId = curriculumDb._id;
                curriculums.push(newCurriculumId);
                curriculumDb.save();

                // console.log(newCurriculumId);
                // console.log('curriculums:', curriculums);
            } catch (err) {
                console.log(err);
                res.json({ error: 'Can not save curriculum!' });
            }
        });

        const courseDb = new Course({ ...courseData, curriculums: curriculums, postedBy: req.user._id });
        const newCourseId = courseDb._id;
        try {
            await courseDb.save();
        } catch (err) {
            console.log(err);
            res.json({ error: 'Can not save course!' });
        }

        // make user role
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { role: 'Lecturer', postedCourses: newCourseId },
            },
            { new: true },
        );
        user.password = undefined;
        user.resetCode = undefined;
        res.json({
            courseDb,
            user,
        });
    } catch (err) {
        console.log(err);
        res.json({ error: 'Something went wrong. Try later.' });
    }
};

// edit then update course
export const update = async (req, res) => {
    try {
        console.log('courseData: ', req.body.objs[0]);
        console.log('curriculumsData:', req.body.objs[1]);

        const courseData = req.body.objs[0];
        const { photos, title } = courseData;
        const curriculumsData = req.body.objs[1];

        const courseDb = await Course.findById(courseData._id);
        const owner = req.user._id == courseDb?.postedBy;

        if (!owner) {
            return res.json({ error: 'Permission denied' });
        } else {
            //validation
            // if (!photos?.length) {
            //     return res.json({ error: 'Photos are required' });
            // }
            // if (!price) {
            //     return res.json({ error: 'Price is required' });
            // }
            // if (!type) {
            //     return res.json({ error: 'Is property house or land?' });
            // }
            // if (!address) {
            //     return res.json({ error: 'Address is required' });
            // }
            // if (!description) {
            //     return res.json({ error: 'Description is required' });
            // }
            if (!title) {
                return res.json({ error: 'Title is required' });
            }

            // get existing array of curriculums in course from database, in term of ObjectID
            const existingCurriculums = courseDb.curriculums;
            console.log('existing curriculums: ', existingCurriculums);

            // get updated array of curriculums, in term of _id, not including new curriculum which will be created
            const updatedCurriculums = [];
            curriculumsData?.map((curriculum) => {
                if (curriculum._id) {
                    updatedCurriculums.push(curriculum._id);
                }
            });
            console.log('updated curriculums: ', updatedCurriculums);

            // delete curriculums and lessons inside it
            existingCurriculums?.map(async (_id) => {
                if (!updatedCurriculums.includes(_id.toString())) {
                    console.log('i am here:', _id.toString());

                    const curriculumDb = await Curriculum.findById(_id);
                    await Lesson.deleteMany({ _id: curriculumDb.lessons });
                    console.log('many related lessons deleted');

                    await Curriculum.findByIdAndDelete(_id);
                    console.log('deleted curriculum:', _id);
                }
            });

            // update or add new curriculums
            curriculumsData?.map(async (curriculum) => {
                // if the curriculum is already in database, then update
                if (curriculum._id) {
                    console.log('i am here:', curriculum._id);

                    // get existing array of lessons which already in curriculum from database, if terms of ObjectID
                    const curriculumDb = await Curriculum.findById(curriculum._id);
                    const existingLessons = curriculumDb.lessons;
                    console.log(`existing lessons of ${curriculum._id}:`, existingLessons);

                    // get updated array of lessons , if terms of _id
                    var updatedLessons = [];
                    curriculum?.lessons?.map(async (lesson) => {
                        if (lesson._id) {
                            updatedLessons.push(lesson._id);
                        }
                    });

                    // delete lessons
                    existingLessons?.map(async (_id) => {
                        if (!updatedLessons.includes(_id.toString())) {
                            await Lesson.findByIdAndDelete(_id);
                            console.log('deleted lesson:', _id);
                        }
                    });

                    // update or add new lesson
                    curriculum?.lessons?.map(async (lesson, index) => {
                        // if the lesson is already in database, then update
                        if (lesson._id) {
                            try {
                                const lessonDb = await Lesson.findByIdAndUpdate(lesson._id, { ...lesson });
                            } catch (err) {
                                console.log(err);
                                res.json({ error: 'Can not update lesson!' });
                            }
                        } else
                            try {
                                // if the lesson is new then create new lesson
                                const lessonDb = new Lesson({ ...lesson, postedBy: req.user._id });

                                const newLessonId = lessonDb._id;
                                updatedLessons.push(newLessonId);

                                lessonDb.save();

                                // console.log(newLessonId);
                                // console.log('lesson:', lesson);
                            } catch (err) {
                                console.log(err);
                                res.json({ error: 'Can not save lesson!' });
                            }
                    });

                    // update curriculum
                    try {
                        const curriculumDb = await Curriculum.findByIdAndUpdate(curriculum._id, {
                            ...curriculum,
                            lessons: updatedLessons,
                        });
                    } catch (err) {
                        console.log(err);
                        res.json({ error: 'Can not update curriculum!' });
                    }
                } else {
                    // if the curriculum is new, then create new curriculums and lessons
                    const lessons = [];
                    curriculum?.lessons?.map(async (lesson, index) => {
                        try {
                            const lessonDb = new Lesson({ ...lesson, postedBy: req.user._id });

                            const newLessonId = lessonDb._id;
                            lessons.push(newLessonId);

                            lessonDb.save();

                            // console.log(newLessonId);
                            // console.log('lesson:', lesson);
                        } catch (err) {
                            console.log(err);
                            res.json({ error: 'Can not save lesson!' });
                        }
                    });

                    // create new curriculum
                    try {
                        const curriculumDb = new Curriculum({
                            ...curriculum,
                            lessons: lessons,
                            postedBy: req.user._id,
                        });
                        const newCurriculumId = curriculumDb._id;
                        updatedCurriculums.push(newCurriculumId);
                        curriculumDb.save();

                        // console.log(newCurriculumId);
                        // console.log('curriculums:', curriculums);
                    } catch (err) {
                        console.log(err);
                        res.json({ error: 'Can not save curriculum!' });
                    }
                }
            });

            try {
                await courseDb.updateOne({ ...courseData, curriculums: updatedCurriculums });
            } catch (err) {
                console.log(err);
                res.json({ error: 'Can not update course!' });
            }

            res.json({ ok: true });
        }
    } catch (err) {
        console.log(err);
    }
};

export const uploadImage = async (req, res) => {
    try {
        // console.log(req.body);
        // console.log('i get here 1');
        const { image } = req.body;
        if (!image) return res.status(400).send('No image');
        // console.log('i get here 2');

        // prepare the image
        const base64Data = new Buffer.from(image.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
        const type = image.split(';')[0].split('/')[1];
        // console.log(type);

        // image params
        const params = {
            Bucket: 'education-platform-bucket',
            Key: `${nanoid()}.${type}`,
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${type}`,
        };

        // upload to s3
        const command = new PutObjectCommand(params);
        await config.AWSS3.send(command, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            } else {
                // console.log(data);
                // res.send(data);
                let url = `https://${params.Bucket}.s3.${config.awsConfig.region}.amazonaws.com/${params.Key}`;
                // console.log(url);
                // res.send(url);
                res.json({ Bucket: params.Bucket, Location: url, Key: params.Key });
            }
        });
    } catch (err) {
        console.log(err);
        res.json({ error: 'Upload failed. Try again.' });
    }
};

export const removeImage = async (req, res) => {
    try {
        const { Key, Bucket } = req.body;

        // image params
        const params = {
            Bucket: Bucket,
            Key: Key,
        };

        // delete from s3
        const command = new DeleteObjectCommand(params);
        await config.AWSS3.send(command, (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            } else {
                // console.log(data);
                res.send({ ok: true });
            }
        });
    } catch (err) {
        console.log(err);
    }
};

export const uploadFileAudio = async (req, res) => {
    uploadIntoBuffer(req, res, async (err) => {
        const file = req.file;
        const fileOnBuffer = file.buffer;
        console.log(file);
        console.log(fileOnBuffer);

        if (!err) {
            // audio params
            const params = {
                Bucket: 'education-platform-bucket',
                Key: `${nanoid(8)}-${file.originalname}`,
                Body: fileOnBuffer,
                ACL: 'public-read',
                ContentType: `audio/mpeg`,
            };

            try {
                // upload to s3
                const command = new PutObjectCommand(params);
                await config.AWSS3.send(command, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    } else {
                        // console.log(data);
                        // res.send(data);
                        let url = `https://${params.Bucket}.s3.${config.awsConfig.region}.amazonaws.com/${params.Key}`;
                        // console.log(url);
                        // res.send(url);
                        res.json({ Bucket: params.Bucket, Location: url, Key: params.Key });
                    }
                });
            } catch (err) {
                console.log(err);
                res.json({ error: 'Upload failed. Try again.' });
            }
        } else {
            console.log(err);
        }
    });
};
