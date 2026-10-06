import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// ---------- Usuario ----------
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, trim: true, maxlength: 40 },
    // hora de despertar "HH:MM" (24 h)
    wakeTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    // hora de dormir "HH:MM"; vacia = 16 h despues de despertar
    bedTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    // rutina personalizada; vacia = plantilla por defecto
    routine: {
      type: [
        {
          _id: false,
          id: { type: String, required: true },
          name: { type: String, required: true, trim: true, maxlength: 40 },
          icon: { type: String, required: true },
          duration: { type: Number, required: true, min: 5, max: 720 },
          // hora fija "HH:MM"; sin ella la actividad es flexible
          fixedAt: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
        },
      ],
      default: [],
    },
    // actividades marcadas como hechas en el dia en curso
    dayLog: {
      date: { type: String },
      done: { type: [String], default: [] },
    },
  },
  { timestamps: true },
);

// ---------- Sesion ----------
// Se guarda solo el hash del token: una fuga de la BD no permite suplantar sesiones.
const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, default: Date.now },
});

// ---------- Limite de peticiones ----------
const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

// ---------- Imagen ----------
const imageSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  filename: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", index: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: { type: [Schema.Types.ObjectId], default: [], select: false },
  timestamp: { type: Date, default: Date.now, index: true },
});

// ---------- Comentario ----------
const commentSchema = new Schema({
  image_id: { type: Schema.Types.ObjectId, ref: "Image", required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, trim: true, maxlength: 40 },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
});

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T> | undefined) ?? model<T>(name, schema);
}

export const User = getModel("User", userSchema);
export const Session = getModel("Session", sessionSchema);
export const RateLimit = getModel("RateLimit", rateLimitSchema);
export const Image = getModel("Image", imageSchema);
export const Comment = getModel("Comment", commentSchema);
