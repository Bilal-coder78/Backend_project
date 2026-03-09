import mongoose,{ Schema } from 'mongoose';

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // ref to the user who is subscribing
        ref: 'User',
    },
    channel: {
        type: Schema.Types.ObjectId, // ref to the user who is being subscribed to (the channel)
        ref: 'User',
    }
}, { timestamps: true })

const Subscription = mongoose.model('Subscription',subscriptionSchema)