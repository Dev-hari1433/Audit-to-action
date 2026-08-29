import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { buildings, initialReports, seededIssues } from "@/lib/mock-data";
import type { Building, CitizenReport, Issue } from "@/types";

export interface AccessTrackDataService {
  mode: "supabase" | "demo";
  getBuildings(): Promise<Building[]>;
  getIssues(): Promise<Issue[]>;
  getReports(): Promise<CitizenReport[]>;
}

const demoService: AccessTrackDataService = {
  mode: "demo",
  async getBuildings() { return buildings; },
  async getIssues() { return seededIssues; },
  async getReports() { return initialReports; },
};

const supabaseService: AccessTrackDataService = {
  mode: "supabase",
  async getBuildings() {
    const client = createSupabaseBrowserClient();
    if (!client) return buildings;
    const { data, error } = await client.from("buildings").select("*").order("name");
    if (error) throw error;
    return data as Building[];
  },
  async getIssues() {
    const client = createSupabaseBrowserClient();
    if (!client) return seededIssues;
    const { data, error } = await client.from("issues").select("*, buildings(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as Issue[];
  },
  async getReports() {
    const client = createSupabaseBrowserClient();
    if (!client) return initialReports;
    const { data, error } = await client.from("citizen_reports").select("*, buildings(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as CitizenReport[];
  },
};

export function getDataService(): AccessTrackDataService {
  return isSupabaseConfigured() ? supabaseService : demoService;
}
