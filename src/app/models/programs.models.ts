import { Testimonial } from './testimonials.model';

export interface Program {
  _id: string;
  title: string;
  description: string;
  duration: string;
  audience: string;
  prerequisite: string;
  banner: {
    src: string;
    alt: string;
  };
  summary: string;
  content: string;
  details: string[];
  methodology: string[];
  modules: Array<{
    title: string;
    description: string;
  }>;
  images: string[];
  pdf: Array<{
    title: string;
    url: string;
    preview: string;
  }>;
}
