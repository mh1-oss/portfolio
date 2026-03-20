export const ADMIN_ROUTE = "/admin";
export const ADMIN_COOKIE_NAME = "portfolio_admin_session";
export const DEFAULT_ADMIN_ACCESS_KEY = "7777";
export const VERCEL_PROJECTS_PAGE_SIZE = 100;

export const DEFAULT_PORTFOLIO_SETTINGS = {
  brandName: "م. محمد مصطفى",
  heroPrefix: "مهندس برمجيات",
  heroHighlight: "وصانع تجارب رقمية لا تُنسى",
  bio: "مهندس برمجيات متخصص في بناء تطبيقات الويب الحديثة وتجارب المستخدم الاستثنائية. أعمل على تحويل الأفكار إلى منتجات رقمية متقنة باستخدام أحدث التقنيات.",
  contactTitle: "هل لديك مشروع تريد النقاش عنه؟",
  contactText: "أنا دائماً منفتح على الفرص الجديدة والتعاون في المشاريع المثيرة للاهتمام. تواصل معي وسنبني شيئاً رائعاً معاً.",
  contactEmail: "m.mustafa@example.com",
  siteUrl: ""
};

export const DEFAULT_CV_SETTINGS = {
  education: [
    { id: 1, degree: "بكالوريوس هندسة برمجيات", school: "جامعة بغداد", year: "2018 - 2022" }
  ],
  experience: [
    { id: 1, role: "مطور واجهات أمامية (Senior)", company: "شركة تقنية رائدة", period: "2023 - الحالي", description: "بناء تطبيقات ويب معقدة باستخدام Next.js و React مع التركيز على الأداء وتجربة المستخدم." }
  ],
  skills: ["React", "Next.js", "JavaScript (ES6+)", "CSS/Tailwind", "Node.js", "Git & GitHub"],
  languages: ["العربية (اللغة الأم)", "الإنجليزية (احترافي)"]
};
