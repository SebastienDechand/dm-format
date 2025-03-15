export interface Testimonial {
  _id?: string | { $oid: string };
  name: string;
  role: string;
  feedback: string;
  trainingId: string | { $oid: string };
  createdAt?: string;
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial | Testimonial[];
  count?: number;
  message?: string;
}
