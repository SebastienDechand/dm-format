export interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  feedback: string;
  trainingId: string;
  createdAt?: Date;
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial | Testimonial[];
  count?: number;
  message?: string;
}
