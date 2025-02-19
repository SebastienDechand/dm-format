export interface About {
  header: {
    title: string;
    highlight: string;
    description: string;
    image: { src: string; alt: string };
  };
  who_we_are: {
    title: string;
    icon: string;
    content: string[];
  };
  concept: {
    title: string;
    steps: { icon: string; title: string; description: string }[];
  };
  trainings: {
    title: string;
    description: string;
    list: string[];
    additional_info: string;
  };
  certifications: {
    title: string;
    description: string;
    logos: { src: string; alt: string }[];
  };
  prevention: {
    title: string;
    description: string;
    points: { icon: string; title: string; description: string }[];
  };
}
