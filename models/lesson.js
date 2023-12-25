import mongoose from 'mongoose';
const { Schema, ObjectId } = mongoose;

const lessonSchema = new Schema(
    {
        title: {
            type: String,
            // required: true,
            maxLength: 255,
        },
        tapescript: {
            type: ObjectId,
            ref: 'TapeScript',
        },

        description: {
            type: String,
            maxLength: 255,
        },
        videoId: {
            type: String,
            maxLength: 255,
        },
        audio: {
            type: String,
            maxLength: 255,
        },
        level: {
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
        type: {
            type: String,
            default: 'lecture', // listening, quiz, information
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

export default mongoose.model('Lesson', lessonSchema);
