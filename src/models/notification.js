import mongoose from "mongoose";

const NotificationsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    unread: {
        type: Boolean,
        default: true
    },
    content: {
        type: {
            notificationType: {
                type: String,
                enum: ["Chat", "Reminder", "Feedback"],
                required: true
            }
        },
        notificationContent: {
            type: String,
            required: true
        },
        required: true
    }
});

NotificationsSchema.set("timestamps", true);
NotificationsSchema.set("versionKey", false);

export default mongoose.model("Notifications", NotificationsSchema);