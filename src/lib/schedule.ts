// Rutina del dia: bloques con duracion que se encadenan desde la hora de despertar.
// El sueno no es un bloque editable: ocupa lo que queda hasta la siguiente
// hora de despertar.

export const ICON_KEYS = [
  "wake",
  "water",
  "exercise",
  "shower",
  "breakfast",
  "focus",
  "break",
  "tasks",
  "lunch",
  "work",
  "free",
  "dinner",
  "read",
  "sleep",
  "study",
  "walk",
  "meditate",
  "music",
  "people",
  "commute",
  "home",
  "code",
] as const;

export type ActivityIcon = (typeof ICON_KEYS)[number];

export type Block = { id: string; name: string; icon: ActivityIcon; duration: number };

export type ScheduleItem = Block & {
  /** minutos desde la hora de despertar */
  start: number;
  isSleep: boolean;
};

export type DayLog = { date: string; done: string[] };

const DAY = 1440;
export const SLEEP_ID = "sleep";
export const MAX_BLOCKS = 30;
/** La rutina deja al menos 2 h libres para dormir. */
export const MAX_ROUTINE_MINUTES = DAY - 120;
export const RECOMMENDED_SLEEP_MINUTES = 7 * 60;

export const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

type TemplateBlock = [name: string, icon: ActivityIcon, duration: number];

const template = (prefix: string, blocks: TemplateBlock[]): Block[] =>
  blocks.map(([name, icon, duration], index) => ({
    id: `${prefix}${String(index).padStart(2, "0")}`,
    name,
    icon,
    duration,
  }));

export const TEMPLATES: { id: string; name: string; description: string; blocks: Block[] }[] = [
  {
    id: "equilibrada",
    name: "Equilibrada",
    description: "Ejercicio temprano y dos bloques de trabajo",
    blocks: template("eq", [
      ["Despertar", "wake", 10],
      ["Tomar agua y estirarse", "water", 20],
      ["Ejercicio", "exercise", 45],
      ["Ducha", "shower", 15],
      ["Desayuno", "breakfast", 30],
      ["Trabajo profundo", "focus", 150],
      ["Descanso", "break", 15],
      ["Tareas y correos", "tasks", 75],
      ["Almuerzo", "lunch", 60],
      ["Trabajo", "work", 180],
      ["Tiempo libre", "free", 90],
      ["Cena", "dinner", 90],
      ["Leer y desconectarse", "read", 180],
    ]),
  },
  {
    id: "enfoque",
    name: "Enfoque temprano",
    description: "Lo más difícil primero, antes del desayuno",
    blocks: template("en", [
      ["Despertar", "wake", 10],
      ["Tomar agua", "water", 10],
      ["Meditar", "meditate", 15],
      ["Trabajo profundo", "focus", 180],
      ["Desayuno", "breakfast", 30],
      ["Ejercicio", "exercise", 60],
      ["Ducha", "shower", 15],
      ["Trabajo", "work", 180],
      ["Almuerzo", "lunch", 60],
      ["Tareas y correos", "tasks", 90],
      ["Caminar", "walk", 30],
      ["Tiempo libre", "free", 120],
      ["Cena", "dinner", 60],
      ["Leer y desconectarse", "read", 120],
    ]),
  },
  {
    id: "estudio",
    name: "Estudio",
    description: "Sesiones de estudio con pausas y clases por la tarde",
    blocks: template("es", [
      ["Despertar", "wake", 10],
      ["Desayuno", "breakfast", 30],
      ["Estudio", "study", 120],
      ["Descanso", "break", 15],
      ["Estudio", "study", 120],
      ["Almuerzo", "lunch", 60],
      ["Clases", "people", 180],
      ["Ejercicio", "exercise", 60],
      ["Ducha", "shower", 15],
      ["Repaso", "read", 90],
      ["Cena", "dinner", 60],
      ["Tiempo libre", "free", 120],
    ]),
  },
];

export const DEFAULT_BLOCKS: Block[] = TEMPLATES[0].blocks;

export function totalMinutes(blocks: readonly Block[]): number {
  return blocks.reduce((sum, block) => sum + block.duration, 0);
}

/** Encadena los bloques desde el minuto 0 y agrega el sueno con lo que sobra del dia. */
export function buildSchedule(blocks: readonly Block[]): ScheduleItem[] {
  let start = 0;
  const items: ScheduleItem[] = blocks.map((block) => {
    const item = { ...block, start, isSleep: false };
    start += block.duration;
    return item;
  });
  const sleep = DAY - start;
  if (sleep > 0) {
    items.push({ id: SLEEP_ID, name: "Dormir", icon: "sleep", duration: sleep, start, isSleep: true });
  }
  return items;
}

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
  /** minutos transcurridos del bloque actual */
  elapsed: number;
};

export function getScheduleState(
  items: readonly ScheduleItem[],
  wakeMinutes: number,
  nowMinutes: number,
): ScheduleState {
  const sinceWake = (((nowMinutes - wakeMinutes) % DAY) + DAY) % DAY;
  let currentIndex = 0;
  items.forEach((item, index) => {
    if (item.start <= sinceWake) currentIndex = index;
  });
  return { currentIndex, elapsed: sinceWake - items[currentIndex].start };
}
