import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatDisplayDate } from "@/lib/dateUtils";
import { sessionVolume } from "@/lib/volume";
import { dailyTotals } from "@/lib/dietTotals";
import type { DailyDietLog, WorkoutLog } from "@/types";

// jspdf-autotable stashes the table's final Y position on the doc instance
// after each call, so the next section knows where to start.
interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

const MARGIN_X = 14;
const BRAND_COLOR: [number, number, number] = [79, 70, 229];

interface ReportOptions {
  from: string;
  to: string;
  unit: string;
  workoutLogs: WorkoutLog[];
  dietLogs: DailyDietLog[];
}

export function generateReportPdf({ from, to, unit, workoutLogs, dietLogs }: ReportOptions) {
  const doc = new jsPDF() as DocWithAutoTable;
  let cursorY = 18;

  doc.setFontSize(18);
  doc.text("Workout Planner Report", MARGIN_X, cursorY);
  cursorY += 7;

  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`${formatDisplayDate(from)} - ${formatDisplayDate(to)}`, MARGIN_X, cursorY);
  cursorY += 5;
  doc.text(`Generated ${new Date().toLocaleString()}`, MARGIN_X, cursorY);
  cursorY += 10;
  doc.setTextColor(20);

  if (workoutLogs.length > 0) {
    cursorY = addWorkoutSection(doc, workoutLogs, unit, cursorY);
  }

  if (dietLogs.length > 0) {
    if (cursorY > 250) {
      doc.addPage();
      cursorY = 18;
    }
    addDietSection(doc, dietLogs, unit, cursorY);
  }

  if (workoutLogs.length === 0 && dietLogs.length === 0) {
    doc.setFontSize(11);
    doc.text("No data logged in this date range.", MARGIN_X, cursorY);
  }

  doc.save(`workout-planner-report_${from}_to_${to}.pdf`);
}

function addWorkoutSection(
  doc: DocWithAutoTable,
  workoutLogs: WorkoutLog[],
  unit: string,
  startY: number
): number {
  let cursorY = startY;

  doc.setFontSize(14);
  doc.text("Workouts", MARGIN_X, cursorY);
  cursorY += 3;

  const sessionRows = workoutLogs.map((log) => [
    formatDisplayDate(log.date),
    log.templateName,
    String(log.exercises.length),
    `${sessionVolume(log.exercises).toLocaleString()} ${unit}`,
  ]);
  autoTable(doc, {
    startY: cursorY,
    head: [["Date", "Workout", "Exercises", "Volume"]],
    body: sessionRows,
    margin: { left: MARGIN_X, right: MARGIN_X },
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND_COLOR },
  });
  cursorY = doc.lastAutoTable.finalY + 8;

  const setRows: string[][] = [];
  const prRows: string[][] = [];
  workoutLogs.forEach((log) => {
    log.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const row = [
          formatDisplayDate(log.date),
          exercise.exerciseName,
          `Set ${set.setNumber}`,
          `${set.reps} reps`,
          `${set.weight} ${unit}`,
        ];
        setRows.push(row);
        if (set.isPR) prRows.push(row);
      });
    });
  });

  doc.setFontSize(12);
  doc.text("All sets", MARGIN_X, cursorY);
  cursorY += 3;
  autoTable(doc, {
    startY: cursorY,
    head: [["Date", "Exercise", "Set", "Reps", "Weight"]],
    body: setRows,
    margin: { left: MARGIN_X, right: MARGIN_X },
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_COLOR },
  });
  cursorY = doc.lastAutoTable.finalY + 8;

  if (prRows.length > 0) {
    if (cursorY > 250) {
      doc.addPage();
      cursorY = 18;
    }
    doc.setFontSize(12);
    doc.text("Personal records in this range", MARGIN_X, cursorY);
    cursorY += 3;
    autoTable(doc, {
      startY: cursorY,
      head: [["Date", "Exercise", "Set", "Reps", "Weight"]],
      body: prRows,
      margin: { left: MARGIN_X, right: MARGIN_X },
      styles: { fontSize: 8 },
      headStyles: { fillColor: BRAND_COLOR },
    });
    cursorY = doc.lastAutoTable.finalY + 8;
  }

  return cursorY;
}

function addDietSection(
  doc: DocWithAutoTable,
  dietLogs: DailyDietLog[],
  unit: string,
  startY: number
) {
  let cursorY = startY;

  doc.setFontSize(14);
  doc.text("Diet", MARGIN_X, cursorY);
  cursorY += 3;

  const dietRows = [...dietLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => {
      const totals = dailyTotals(log.entries);
      return [
        formatDisplayDate(log.date),
        log.bodyWeight != null ? `${log.bodyWeight} ${unit}` : "-",
        `${totals.calories} kcal`,
        `${Math.round(totals.protein)}g`,
        `${Math.round(totals.carbs)}g`,
        `${Math.round(totals.fat)}g`,
      ];
    });

  autoTable(doc, {
    startY: cursorY,
    head: [["Date", "Body weight", "Calories", "Protein", "Carbs", "Fat"]],
    body: dietRows,
    margin: { left: MARGIN_X, right: MARGIN_X },
    styles: { fontSize: 8 },
    headStyles: { fillColor: BRAND_COLOR },
  });
}
