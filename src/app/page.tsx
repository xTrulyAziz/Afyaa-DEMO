import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import VisionSection from "@/components/public/VisionSection";
import PartnersSection from "@/components/public/PartnersSection";
import ProjectsSection from "@/components/public/ProjectsSection";
import TeamSection from "@/components/public/TeamSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import { createClient } from "@/lib/supabase/server";
import type { AboutContent, VisionContent, Project, ContactContent, TeamMember, Partner } from "@/types/database";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: about },
    { data: vision },
    { data: partners },
    { data: projects },
    { data: team },
    { data: contact },
  ] = await Promise.all([
    supabase.from("about_content").select("*").limit(1).single(),
    supabase.from("vision_content").select("*").limit(1).single(),
    supabase
      .from("partners")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("team_members")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    supabase.from("contact_content").select("*").limit(1).single(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection data={(about as AboutContent) ?? null} />
        <VisionSection data={(vision as VisionContent) ?? null} />
        <PartnersSection data={(partners as Partner[]) ?? []} />
        <ProjectsSection data={(projects as Project[]) ?? []} />
        <TeamSection data={(team as TeamMember[]) ?? []} />
        <ContactSection data={(contact as ContactContent) ?? null} />
      </main>
      <Footer contact={(contact as ContactContent) ?? null} />
    </>
  );
}
