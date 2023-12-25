import { model, Schema, ObjectId } from 'mongoose';

const schema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true,
        },
        name: {
            type: String,
            trim: true,
            default: '',
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            maxlength: 256,
        },
        address: { type: String, default: '' },
        company: { type: String, default: '' },
        phone: { type: String, default: '' },
        photo: {},
        role: {
            type: [String],
            default: ['Student'],
            enum: ['Student', 'Lecturer', 'Admin'],
        },
        enrolledCourses: [{ type: ObjectId, ref: 'Course' }],
        postedCourses: [{ type: ObjectId, ref: 'Course' }],
        wishlist: [{ type: ObjectId, ref: 'Ad' }],
        resetCode: { type: String, default: '' },
    },
    { timestamps: true },
);

export default model('User', schema);
