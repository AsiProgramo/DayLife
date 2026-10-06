// Rutina del dia. Hay dos clases de actividades:
// - fijas: tienen hora de inicio (trabajo, clases...) y no se mueven.
// - flexibles: solo duracion; se acomodan en orden en los huecos libres
//   entre la hora de despertar, las fijas y la hora de dormir.
// Lo que no se reparte queda como "Tiempo libre". El sueno va de la hora de
// dormir a la siguiente hora de despertar.

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

export type Block = {
  id: string;
  name: string;
  icon: ActivityIcon;
  duration: number;
  /** hora fija "HH:MM" (24 h); sin ella la actividad es flexible */
  fixedAt?: string;
};

export type ScheduleItem = Block & {
  /** minutos desde la hora de despertar */
  start: number;
  /** task: actividad de la rutina; free: hueco sin repartir; sleep: dormir */
  kind: "task" | "free" | "sleep";
};

export type DayLog = { date: string; done: string[] };

const DAY = 1440;
export const SLEEP_ID = "sleep";
export const MAX_BLOCKS = 30;
/** La rutina deja al menos 2 h libres para dormir. */
export const MAX_ROUTINE_MINUTES = DAY - 120;
export const RECOMMENDED_SLEEP_MINUTES = 7 * 60;
/** Horas despierto por defecto cuando aun no se eligio hora de dormir. */
export const DEFAULT_AWAKE_MINUTES = 16 * 60;

export const DURATION_OPTIONS = [
  5, 10, 15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300, 360, 420, 480, 540, 600, 720,
];

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

const mod = (minutes: number): number => ((minutes % DAY) + DAY) % DAY;

/** Hora de dormir por defecto: 16 h despierto, o mas si la rutina no cabe. */
export function defaultBedTime(blocks: readonly Block[], wakeMinutes: number): number {
  const awake = Math.min(Math.max(DEFAULT_AWAKE_MINUTES, totalMinutes(blocks)), MAX_ROUTINE_MINUTES);
  return mod(wakeMinutes + awake);
}

export type DayPlan = {
  items: ScheduleItem[];
  /** minutos entre despertar y dormir */
  awake: number;
  /** minutos ocupados por actividades fijas */
  fixedTotal: number;
  /** minutos que quedan para repartir: despierto menos fijas */
  freeTotal: number;
  /** minutos repartidos en actividades flexibles */
  flexibleTotal: number;
  /** minutos libres que no se repartieron */
  unassigned: number;
  /** avisos para el usuario (choques, cosas que no caben); vacio = todo bien */
  problems: string[];
};

/**
 * Arma el dia: pone las fijas en su hora y acomoda cada flexible, en el orden de
 * la lista, en el primer hueco libre donde cabe. Lo que no se llena queda como
 * tiempo libre; lo que no cabe en ningun hueco va despues de la hora de dormir
 * y se avisa.
 */
export function planDay(blocks: readonly Block[], wakeMinutes: number, bedMinutes: number): DayPlan {
  const awake = mod(bedMinutes - wakeMinutes) || DAY;
  const problems: string[] = [];

  const fixed = blocks
    .filter((block) => block.fixedAt)
    .map((block) => ({ ...block, start: mod(parseTime(block.fixedAt!) - wakeMinutes) }))
    .sort((a, b) => a.start - b.start);
  const flexible = blocks.filter((block) => !block.fixedAt);

  // huecos libres [start, end) entre despertar, las fijas y la hora de dormir
  const gaps: { start: number; end: number }[] = [];
  let cursor = 0;
  fixed.forEach((block, index) => {
    if (block.start + block.duration > awake) {
      problems.push(`“${block.name}” queda fuera de tu día: termina después de la hora de dormir.`);
    }
    const prev = fixed[index - 1];
    if (prev && block.start < prev.start + prev.duration) {
      problems.push(`“${prev.name}” y “${block.name}” se cruzan.`);
    }
    if (block.start > cursor) gaps.push({ start: cursor, end: Math.min(block.start, awake) });
    cursor = Math.max(cursor, block.start + block.duration);
  });
  if (cursor < awake) gaps.push({ start: cursor, end: awake });

  const items: ScheduleItem[] = fixed.map((block) => ({ ...block, kind: "task" as const }));
  let overflow = Math.max(cursor, awake);
  const leftOut: string[] = [];
  for (const block of flexible) {
    const gap = gaps.find((g) => g.end - g.start >= block.duration);
    if (gap) {
      items.push({ ...block, start: gap.start, kind: "task" });
      gap.start += block.duration;
    } else {
      items.push({ ...block, start: overflow, kind: "task" });
      overflow += block.duration;
      leftOut.push(block.name);
    }
  }
  for (const gap of gaps) {
    if (gap.end > gap.start) {
      items.push({ id: `free-${gap.start}`, name: "Tiempo libre", icon: "free", duration: gap.end - gap.start, start: gap.start, kind: "free" });
    }
  }
  items.sort((a, b) => a.start - b.start);

  const fixedTotal = totalMinutes(fixed);
  const flexibleTotal = totalMinutes(flexible);
  const freeTotal = Math.max(0, awake - fixedTotal);

  if (flexibleTotal > freeTotal) {
    problems.push(
      `Repartiste más tiempo del que tienes libre: te pasas por ${formatDuration(flexibleTotal - freeTotal)}. Acorta o quita algo.`,
    );
  } else if (leftOut.length > 0) {
    // cabe en total, pero ningun hueco es lo bastante largo
    problems.push(
      `${leftOut.map((name) => `“${name}”`).join(", ")} no cabe en ningún hueco libre. Acórtalo o pártelo en dos.`,
    );
  }

  const sleepStart = Math.max(overflow, awake);
  if (sleepStart < DAY) {
    items.push({ id: SLEEP_ID, name: "Dormir", icon: "sleep", duration: DAY - sleepStart, start: sleepStart, kind: "sleep" });
  }

  return {
    items,
    awake,
    fixedTotal,
    freeTotal,
    flexibleTotal,
    unassigned: items.filter((item) => item.kind === "free").reduce((sum, item) => sum + item.duration, 0),
    problems,
  };
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

/** 390 -> "06:30" (para inputs type="time") */
export function toTimeValue(minutes: number): string {
  const total = mod(minutes);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
