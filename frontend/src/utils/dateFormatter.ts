/**
 * Formats a date string into standard numeric format: Day/Month/Year (e.g. 3/9/2026).
 * Avoids long Arabic text month names as requested by the user.
 */
export function formatDate(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'غير محدد';
  try {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return 'غير محدد';
      return `${dateInput.getDate()}/${dateInput.getMonth() + 1}/${dateInput.getFullYear()}`;
    }
    if (typeof dateInput === 'number') {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return 'غير محدد';
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    const str = String(dateInput).trim();
    // If format is YYYY-MM-DD or ISO string
    const cleanStr = str.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(month) && !isNaN(day)) {
        return `${day}/${month}/${year}`;
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    return str;
  } catch (e) {
    return String(dateInput);
  }
}

export interface MaintenanceTimingInfo {
  diffDays: number;
  label: string;
  status: 'today' | 'overdue' | 'upcoming';
  badgeClass: string;
  dotColor: string;
}

export function getMaintenanceTiming(dateString: string | null | undefined): MaintenanceTimingInfo {
  if (!dateString) {
    return {
      diffDays: 0,
      label: 'غير محدد',
      status: 'upcoming',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-400'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      diffDays: 0,
      label: 'مطلوبة اليوم',
      status: 'today',
      badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-sm',
      dotColor: 'bg-amber-500 animate-pulse'
    };
  } else if (diffDays > 0) {
    let label = '';
    if (diffDays === 1) label = 'متبقي يوم واحد (غداً)';
    else if (diffDays === 2) label = 'متبقي يومان';
    else if (diffDays >= 3 && diffDays <= 10) label = `متبقي ${diffDays} أيام`;
    else label = `متبقي ${diffDays} يوماً`;

    return {
      diffDays,
      label,
      status: 'upcoming',
      badgeClass: 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-sm',
      dotColor: 'bg-indigo-600'
    };
  } else {
    const absDays = Math.abs(diffDays);
    let label = '';
    if (absDays === 1) label = 'متأخرة منذ يوم واحد (أمس)';
    else if (absDays === 2) label = 'متأخرة منذ يومين';
    else if (absDays >= 3 && absDays <= 10) label = `متأخرة منذ ${absDays} أيام`;
    else label = `متأخرة منذ ${absDays} يوماً`;

    return {
      diffDays,
      label,
      status: 'overdue',
      badgeClass: 'bg-rose-50 text-rose-900 border border-rose-200/80 shadow-sm',
      dotColor: 'bg-rose-500 animate-pulse'
    };
  }
}
