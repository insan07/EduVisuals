export function formatDownloadCount(count?: number | null): string {
  const num = Number(count) || 0;
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

export function getSubjectColor(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("biology")) return "from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/60";
  if (s.includes("chemistry")) return "from-purple-50 to-purple-100/50 text-purple-700 border-purple-200/60";
  if (s.includes("physics")) return "from-indigo-50 to-indigo-100/50 text-indigo-700 border-indigo-200/60";
  if (s.includes("math")) return "from-blue-50 to-blue-100/50 text-blue-700 border-blue-200/60";
  if (s.includes("ict") || s.includes("comp")) return "from-cyan-50 to-cyan-100/50 text-cyan-700 border-cyan-200/60";
  if (s.includes("history")) return "from-amber-50 to-amber-100/50 text-amber-700 border-amber-200/60";
  if (s.includes("geography")) return "from-teal-50 to-teal-100/50 text-teal-700 border-teal-200/60";
  if (s.includes("commerce") || s.includes("econ")) return "from-rose-50 to-rose-100/50 text-rose-700 border-rose-200/60";
  return "from-slate-50 to-slate-100/50 text-slate-700 border-slate-200/60";
}

export function formatLKR(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-LK");
}

export function cn(...inputs: any[]): string {
  return inputs.flat().filter(Boolean).join(" ");
}
