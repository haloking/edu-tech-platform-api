import mongoose from 'mongoose';
const { Schema, ObjectId } = mongoose;

const tapescriptSchema = new Schema(
    {
        tapescript: [
            {
                english: String,
                vietnamese: String,
                timeStart: Number,
                timeEnd: Number,
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.model('TapeScript', tapescriptSchema);
