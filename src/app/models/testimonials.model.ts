export interface Testimonial {
  _id?: string | { $oid: string };
  name: string;
  role: string;
  feedback: string;
  // Populated as { _id, title } by the admin listing endpoint, otherwise a
  // plain id string/$oid.
  trainingId: string | { $oid: string } | { _id: string; title: string };
  createdAt?: string;
  approved?: boolean;
}

export interface TestimonialResponse {
  success: boolean;
  data: Testimonial | Testimonial[];
  count?: number;
  message?: string;
}
