export type Program = {
  _id: number;
  title: string;
  description: string;
  duration: string;
  audience: string;
  prerequisite: string;
  banner: string;
  summary: string;
  modules: {
    title: string;
    description: string;
  }[];
  images: string[];
  content: string;
  details: string[];
  methodology: string[];
  testimonials: {
    name: string;
    role: string;
    feedback: string;
  }[];
};
