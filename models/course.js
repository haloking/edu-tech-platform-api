import mongoose from 'mongoose';
const { Schema, ObjectId } = mongoose;

const courseSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 255,
        },
        curriculums: [
            {
                type: ObjectId,
                ref: 'Curriculum',
            },
        ],
        curriculumsSlug: [],
        photos: [{}],
        thumbnail: {
            type: String,
            // required: true,
            maxLength: 255,
            default:
                'https://images.ctfassets.net/szez98lehkfm/15tNzFBEIKF40C3Lw1MslM/2e9cf03b376e991830031b55b517f58d/MyIC_Article_14609?fm=webp',
        },
        description: {
            type: String,
            // required: true,
            maxLength: 255,
        },
        videoId: {
            type: String,
            // required: true,
            maxLength: 255,
        },
        level: {
            type: String,
            maxLength: 255,
            default: 'medium',
        },
        price: {
            type: Number,
            maxLength: 255,
            default: 0,
        },
        slug: {
            type: String,
            lowercase: true,
            unique: true,
        },
        postedBy: {
            type: ObjectId,
            ref: 'User',
        },
        published: {
            type: Boolean,
            default: true,
        },
        field: {
            type: String,
            default: 'English', // Maths, Physics, Chemistry
        },
        type: {
            type: String,
            default: 'Ielts', // Ielts, Toeic, Toefl, THPT
        },
        views: {
            type: Number,
            default: 0,
        },
        length: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export default mongoose.model('Course', courseSchema);
