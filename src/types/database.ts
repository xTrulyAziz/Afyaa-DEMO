export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface AboutValue {
  title: string;
  description: string;
}

export interface VisionGoal {
  text: string;
}

export interface AboutContent {
  id: string;
  main_title: string;
  short_description: string;
  full_text: string;
  values: AboutValue[];
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisionContent {
  id: string;
  vision_text: string;
  mission_text: string;
  goals: VisionGoal[];
  stat_projects: number;
  stat_years: number;
  stat_clients: number;
  stat_green_areas: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  project_date: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  job_title: string;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactContent {
  id: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  maps_link: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  receiving_email: string;
  created_at: string;
  updated_at: string;
}
