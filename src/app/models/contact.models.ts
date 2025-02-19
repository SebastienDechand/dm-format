export interface ContactData {
  title: string;
  highlight: string;
  description: string;
  form: ContactForm;
  contact_info: ContactInfo;
  location: LocationInfo;
}

export interface ContactForm {
  fields: FormField[];
  submit_button: SubmitButton;
  required_note: string;
}

export interface FormField {
  label: string;
  icon: string;
  type: string;
  id: string;
  placeholder: string;
  required: boolean;
}

export interface SubmitButton {
  icon: string;
  text: string;
}

export interface ContactInfo {
  title: string;
  address: ContactDetail;
  phone: ContactDetail;
  email: ContactDetail;
  hours: ContactDetail;
}

export interface ContactDetail {
  label: string;
  icon: string;
  value: string;
}

export interface LocationInfo {
  title: string;
  map_embed: string;
}
