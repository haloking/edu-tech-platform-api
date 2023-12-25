import mongoose from 'mongoose';
const { Schema, ObjectId } = mongoose;

const curriculumSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 255,
        },
        lessons: [
            {
                type: ObjectId,
                ref: 'Lesson',
            },
        ],
        lessonsSlug: [],
        description: {
            type: String,
            maxLength: 255,
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
        views: {
            type: Number,
            default: 0,
        },
        length: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Curriculum', curriculumSchema);
