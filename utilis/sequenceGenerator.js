const mongoose = require('mongoose');

// Define the schema for our counter
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

// Create the model, ensuring it doesn't get re-created on every call
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

// This function will find the 'user_id' counter, increment it by 1,
// and return the new value. It's an atomic operation.
async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // 'new' returns the updated doc, 'upsert' creates it if it doesn't exist
    );
    return sequenceDocument.seq;
}

module.exports = { getNextSequenceValue };