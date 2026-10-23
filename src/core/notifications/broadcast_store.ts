import { BroadcastNotification, CreateBroadcastInput, UpdateBroadcastInput, BroadcastAudience } from "@/types/broadcast";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

class BroadcastNotificationStore {
  private inMemoryBroadcasts: Map<string, BroadcastNotification> = new Map();

  constructor() {
    // Seed initial demo welcome broadcast
    const initialWelcome: BroadcastNotification = {
      id: "bcast_welcome_sovereignty",
      title: "Welcome to SabiProfile Sovereign Infrastructure",
      message: "Zero physical raw files are ever centralized. All credentials remain encrypted in your cloud storage with SHA-256 on-chain proofing.",
      audience: "all",
      theme: "purple",
      custom_bg_color: null,
      custom_text_color: null,
      is_dismissible: true,
      is_active: true,
      priority: 2,
      action_label: "Learn More",
      action_url: "/security",
      starts_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: null,
      created_by: "system_admin",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.inMemoryBroadcasts.set(initialWelcome.id, initialWelcome);
  }

  /**
   * Retrieves active, non-expired broadcasts matching the requested audience.
   * Matches both the target role AND 'all' (general).
   */
  public async getActiveBroadcasts(targetRole: BroadcastAudience = "all"): Promise<BroadcastNotification[]> {
    try {
      const admin = createAdminSupabaseClient();
      const now = new Date().toISOString();

      const query = admin
        .from("broadcast_notifications")
        .select("*")
        .eq("is_active", true)
        .lte("starts_at", now)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (targetRole !== "all") {
        query.in("audience", [targetRole, "all"]);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Filter out expired items in case expires_at is in the past
        return data.filter((item: BroadcastNotification) => !item.expires_at || new Date(item.expires_at) > new Date());
      }
    } catch {
      // Supabase unconfigured or offline fallback
    }

    // In-memory fallback
    const now = new Date();
    return Array.from(this.inMemoryBroadcasts.values())
      .filter((b) => {
        if (!b.is_active) return false;
        if (new Date(b.starts_at) > now) return false;
        if (b.expires_at && new Date(b.expires_at) <= now) return false;
        if (targetRole === "all") return true;
        return b.audience === targetRole || b.audience === "all";
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Retrieves all broadcasts for Super Admin console management.
   */
  public async getAllBroadcasts(): Promise<BroadcastNotification[]> {
    try {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin
        .from("broadcast_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as BroadcastNotification[];
      }
    } catch {
      // In-memory fallback
    }

    return Array.from(this.inMemoryBroadcasts.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Creates a new broadcast notification.
   */
  public async createBroadcast(input: CreateBroadcastInput, createdBy?: string): Promise<BroadcastNotification> {
    const id = `bcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: BroadcastNotification = {
      id,
      title: input.title.trim(),
      message: input.message.trim(),
      audience: input.audience || "all",
      theme: input.theme || "info",
      custom_bg_color: input.custom_bg_color || null,
      custom_text_color: input.custom_text_color || null,
      is_dismissible: input.is_dismissible !== undefined ? input.is_dismissible : true,
      is_active: input.is_active !== undefined ? input.is_active : true,
      priority: input.priority || 1,
      action_label: input.action_label?.trim() || null,
      action_url: input.action_url?.trim() || null,
      starts_at: input.starts_at || now,
      expires_at: input.expires_at || null,
      created_by: createdBy || "super_admin",
      created_at: now,
      updated_at: now,
    };

    try {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin
        .from("broadcast_notifications")
        .insert({
          title: record.title,
          message: record.message,
          audience: record.audience,
          theme: record.theme,
          custom_bg_color: record.custom_bg_color,
          custom_text_color: record.custom_text_color,
          is_dismissible: record.is_dismissible,
          is_active: record.is_active,
          priority: record.priority,
          action_label: record.action_label,
          action_url: record.action_url,
          starts_at: record.starts_at,
          expires_at: record.expires_at,
          created_by: record.created_by,
        })
        .select()
        .single();

      if (!error && data) {
        this.inMemoryBroadcasts.set(data.id, data);
        return data;
      }
    } catch {
      // In-memory fallback
    }

    this.inMemoryBroadcasts.set(record.id, record);
    return record;
  }

  /**
   * Updates an existing broadcast notification.
   */
  public async updateBroadcast(input: UpdateBroadcastInput): Promise<BroadcastNotification | null> {
    const now = new Date().toISOString();

    try {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin
        .from("broadcast_notifications")
        .update({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.message !== undefined && { message: input.message }),
          ...(input.audience !== undefined && { audience: input.audience }),
          ...(input.theme !== undefined && { theme: input.theme }),
          ...(input.custom_bg_color !== undefined && { custom_bg_color: input.custom_bg_color }),
          ...(input.custom_text_color !== undefined && { custom_text_color: input.custom_text_color }),
          ...(input.is_dismissible !== undefined && { is_dismissible: input.is_dismissible }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
          ...(input.priority !== undefined && { priority: input.priority }),
          ...(input.action_label !== undefined && { action_label: input.action_label }),
          ...(input.action_url !== undefined && { action_url: input.action_url }),
          ...(input.starts_at !== undefined && { starts_at: input.starts_at }),
          ...(input.expires_at !== undefined && { expires_at: input.expires_at }),
          updated_at: now,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (!error && data) {
        this.inMemoryBroadcasts.set(data.id, data);
        return data;
      }
    } catch {
      // In-memory fallback
    }

    const existing = this.inMemoryBroadcasts.get(input.id);
    if (!existing) return null;

    const updated: BroadcastNotification = {
      ...existing,
      ...input,
      updated_at: now,
    };
    this.inMemoryBroadcasts.set(input.id, updated);
    return updated;
  }

  /**
   * Deletes a broadcast notification.
   */
  public async deleteBroadcast(id: string): Promise<boolean> {
    try {
      const admin = createAdminSupabaseClient();
      const { error } = await admin.from("broadcast_notifications").delete().eq("id", id);
      if (!error) {
        this.inMemoryBroadcasts.delete(id);
        return true;
      }
    } catch {
      // In-memory fallback
    }

    return this.inMemoryBroadcasts.delete(id);
  }
}

export const broadcastStore = new BroadcastNotificationStore();
