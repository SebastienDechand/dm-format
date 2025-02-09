export interface Program {
  _id: { $oid: string };
  title: string;
  description: string;
  duration: string;
  audience: string;
  prerequisite: string;
  banner: string;
  summary: string;
  content: string;
  details: string[];
  methodology: string[];
  modules: Array<{
    title: string;
    description: string;
  }>;
  images: string[];
  testimonials: Array<{
    name: string;
    role: string;
    feedback: string;
  }>;
}
