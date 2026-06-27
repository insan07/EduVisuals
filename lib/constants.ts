export const SUBJECTS: (string | { group: string; options: string[] })[] = [
  { group: "Sciences", options: ["Physics", "Chemistry", "Biology", "Environmental Science"] },
  "Mathematics & Statistics",
  { group: "Engineering", options: ["Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Computer/Software Engineering", "Chemical Engineering", "Electronics"] },
  { group: "Computer Science / IT", options: ["Programming", "AI/ML", "Cybersecurity", "Data Science"] },
  "Medicine & Health Sciences",
  "Business, Economics & Finance",
  "Law",
  { group: "Arts & Humanities", options: ["History", "Literature", "Philosophy", "Languages"] },
  { group: "Social Sciences", options: ["Psychology", "Sociology", "Political Science"] },
  "Architecture & Design",
  "Agriculture"
];

export const GRADES = ["Pre-primary / Kindergarten", "Primary / Elementary", "Middle School", "High School", "O/L (Ordinary Level)", "A/L (Advanced Level)", "Undergraduate", "Postgraduate", "Doctoral / PhD", "Professional / Certifications"];

export const TYPES = ["Mind Map", "Diagram", "Graph", "Flowchart", "Timeline", "Illustration", "Comparison Table", "Cheat Sheet"];

export const SYLLABUSES: (string | { group: string; options: string[] })[] = [
  { group: "International", options: ["IB Diploma", "Cambridge IGCSE", "Cambridge A-Level", "Edexcel/Pearson"] },
  { group: "US", options: ["Common Core", "AP (Advanced Placement)", "State Standards"] },
  { group: "UK", options: ["National Curriculum", "AQA", "OCR"] },
  { group: "India", options: ["CBSE", "ICSE", "State Boards"] },
  { group: "Sri Lanka", options: ["National Syllabus", "Local University"] },
  "National Curriculum (Other)",
  { group: "Exam-Prep", options: ["SAT", "GRE", "GMAT", "JEE", "NEET", "IELTS"] }
];

export const MEDIUMS = ["English", "Sinhala", "Tamil", "Mandarin Chinese", "Spanish", "Hindi", "Arabic", "French", "Portuguese", "Russian", "Bengali", "German", "Japanese", "Indonesian/Malay", "Urdu", "Other"];
