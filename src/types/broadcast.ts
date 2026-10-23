export type BroadcastAudience = "all" | "citizen" | "enterprise" | "super_admin";

export type BroadcastTheme = "info" | "success" | "warning" | "danger" | "purple" | "custom";

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  theme: BroadcastTheme;
  custom_bg_color?: string | null;
  custom_text_color?: string | null;
  is_dismissible: boolean;
  is_active: boolean;
  priority: number; // 1: Normal, 2: High, 3: Urgent
  action_label?: string | null;
  action_url?: string | null;
  starts_at: string;
  expires_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBroadcastInput {
  title: string;
  message: string;
  audience?: BroadcastAudience;
  theme?: BroadcastTheme;
  custom_bg_color?: string | null;
  custom_text_color?: string | null;
  is_dismissible?: boolean;
  is_active?: boolean;
  priority?: number;
  action_label?: string | null;
  action_url?: string | null;
  starts_at?: string;
  expires_at?: string | null;
}

export interface UpdateBroadcastInput extends Partial<CreateBroadcastInput> {
  id: string;
}
