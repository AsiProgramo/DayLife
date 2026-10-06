// Horario del dia generado a partir de la hora de despertar.

export type ActivityIcon =
  | "wake"
  | "water"
  | "exercise"
  | "shower"
  | "breakfast"
  | "focus"
  | "break"
  | "tasks"
  | "lunch"
  | "work"
  | "free"
  | "dinner"
  | "read"
  | "sleep";

export type Activity = { min: number; name: string; icon: ActivityIcon };

// minutos desde la hora de despertar
export const ACTIVITIES: readonly Activity[] = [
  { min: 0, name: "Despertar", icon: "wake" },
  { min: 10, name: "Tomar agua y estirarse", icon: "water" },
  { min: 30, name: "Ejercicio", icon: "exercise" },
  { min: 75, name: "Ducha", icon: "shower" },
  { min: 90, name: "Desayuno", icon: "breakfast" },
  { min: 120, name: "Trabajo profundo", icon: "focus" },
  { min: 270, name: "Descanso", icon: "break" },
  { min: 285, name: "Tareas y correos", icon: "tasks" },
  { min: 360, name: "Almuerzo", icon: "lunch" },
  { min: 420, name: "Trabajo", icon: "work" },
  { min: 600, name: "Tiempo libre", icon: "free" },
  { min: 690, name: "Cena", icon: "dinner" },
  { min: 780, name: "Leer y desconectarse", icon: "read" },
  { min: 960, name: "Dormir", icon: "sleep" },
];

const DAY = 1440;

/** "06:30" -> 390 */
export function parseTime(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** 390 -> "6:30 AM" */
export function formatTime(minutes: number): string {
  const total = ((minutes % DAY) + DAY) % DAY;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** 95 -> "1 h 35 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export type ScheduleState = {
  currentIndex: number;
  /** minutos transcurridos de la actividad actual */
  elapsed: number;
  /** duracion total de la actividad actual */
  duration: number;
};

export function getScheduleState(wakeMinutes: number, nowMinutes: number): ScheduleState {
  const sinceWake = (((nowMinutes - wakeMinutes) % DAY) + DAY) % DAY;
  let currentIndex = 0;
  ACTIVITIES.forEach((activity, index) => {
    if (activity.min <= sinceWake) currentIndex = index;
  });
  const start = ACTIVITIES[currentIndex].min;
  const end = ACTIVITIES[currentIndex + 1]?.min ?? DAY;
  return { currentIndex, elapsed: sinceWake - start, duration: end - start };
}
