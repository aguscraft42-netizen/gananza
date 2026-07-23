// Bootstrap contract generated from the V5 migrations.
// After starting Supabase locally, run `npm run supabase:types` for the authoritative generated file.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "user" | "support" | "reviewer" | "admin";
export type OfferCategory = "game" | "survey" | "app" | "service";
export type OfferStatus = "draft" | "active" | "paused" | "ended";
export type TaskSessionStatus = "opened" | "started" | "registered" | "pending" | "confirmed" | "rejected" | "reversed" | "expired";
export type ConversionStatus = "pending" | "confirmed" | "rejected" | "reversed";
export type WithdrawalStatus = "requested" | "reviewing" | "approved" | "paid" | "rejected" | "cancelled";
export type PayoutMethodType = "mercado_pago" | "bank_transfer";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; country_code: string; birth_date: string | null; interests: string[]; payout_preference: PayoutMethodType; onboarding_completed_at: string | null; risk_score: number; level: number; experience_points: number; streak_days: number; hide_balance: boolean; notification_preferences: Json; suspended_at: string | null; suspension_reason: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string; country_code?: string; birth_date?: string | null; interests?: string[]; payout_preference?: PayoutMethodType; onboarding_completed_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]> & { hide_balance?: boolean; notification_preferences?: Json };
        Relationships: [];
      };
      user_roles: {
        Row: { id: number; user_id: string; role: AppRole; granted_by: string | null; created_at: string };
        Insert: { user_id: string; role?: AppRole; granted_by?: string | null };
        Update: { role?: AppRole; granted_by?: string | null };
        Relationships: [];
      };
      providers: {
        Row: { id: string; slug: string; name: string; website_url: string | null; support_url: string | null; is_active: boolean; callback_mode: string; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; name: string; website_url?: string | null; support_url?: string | null; is_active?: boolean; callback_mode?: string };
        Update: Partial<Database["public"]["Tables"]["providers"]["Insert"]>;
        Relationships: [];
      };
      offers: {
        Row: { id: string; provider_id: string; external_offer_id: string; title: string; brand: string; description: string; category: OfferCategory; status: OfferStatus; country_codes: string[]; platform: string; reward_amount: number; gross_amount: number; currency_code: string; estimated_minutes: number | null; validation_label: string | null; difficulty_label: string | null; badge_label: string | null; instructions: Json; requirements: Json; tracking_url_template: string | null; starts_at: string | null; ends_at: string | null; daily_cap: number | null; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; provider_id: string; external_offer_id: string; title: string; brand: string; description?: string; category: OfferCategory; status?: OfferStatus; country_codes?: string[]; platform?: string; reward_amount: number; gross_amount: number; currency_code?: string; estimated_minutes?: number | null; requirements?: Json };
        Update: Partial<Database["public"]["Tables"]["offers"]["Insert"]>;
        Relationships: [];
      };
      task_sessions: {
        Row: { id: string; offer_id: string; user_id: string; status: TaskSessionStatus; provider_click_id: string | null; progress: number; started_at: string | null; registered_at: string | null; completed_at: string | null; last_provider_update_at: string | null; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; offer_id: string; user_id: string; status?: TaskSessionStatus; provider_click_id?: string | null; progress?: number };
        Update: { status?: TaskSessionStatus; progress?: number; metadata?: Json };
        Relationships: [];
      };
      wallets: {
        Row: { user_id: string; pending_balance: number; available_balance: number; held_balance: number; withdrawn_balance: number; debt_balance: number; lifetime_earned: number; version: number; updated_at: string };
        Insert: { user_id: string };
        Update: never;
        Relationships: [];
      };
      ledger_entries: {
        Row: { id: string; user_id: string; entry_type: string; pending_delta: number; available_delta: number; held_delta: number; withdrawn_delta: number; debt_delta: number; conversion_id: string | null; withdrawal_id: string | null; idempotency_key: string; description: string; metadata: Json; created_by: string | null; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      payout_methods: {
        Row: { id: string; user_id: string; method_type: PayoutMethodType; label: string; destination: string; destination_masked: string; holder_name: string | null; holder_document: string | null; destination_hash: string; is_default: boolean; is_verified: boolean; verified_at: string | null; verification_note: string | null; cooldown_until: string | null; last_used_at: string | null; disabled_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; method_type: PayoutMethodType; label: string; destination: string; destination_masked?: string; holder_name?: string | null; holder_document?: string | null; is_default?: boolean };
        Update: { label?: string; destination?: string; destination_masked?: string; holder_name?: string | null; holder_document?: string | null; is_default?: boolean; disabled_at?: string | null };
        Relationships: [];
      };
      withdrawals: {
        Row: { id: string; user_id: string; payout_method_id: string; amount: number; currency_code: string; status: WithdrawalStatus; idempotency_key: string; reviewed_by: string | null; reviewed_at: string | null; paid_at: string | null; rejection_reason: string | null; provider_reference: string | null; payout_snapshot: Json; payment_receipt_url: string | null; payment_receipt_name: string | null; payment_sent_at: string | null; created_at: string; updated_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      support_tickets: {
        Row: { id: string; user_id: string; task_session_id: string | null; withdrawal_id: string | null; subject: string; category: string; status: string; priority: string; assigned_to: string | null; resolved_at: string | null; created_at: string; updated_at: string };
        Insert: { user_id: string; subject: string; category?: string; task_session_id?: string | null; withdrawal_id?: string | null };
        Update: never;
        Relationships: [];
      };
      conversions: { Row: Record<string, unknown>; Insert: never; Update: never; Relationships: [] };
      withdrawal_events: { Row: Record<string, unknown>; Insert: never; Update: never; Relationships: [] };
      support_messages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: never; Relationships: [] };
      devices: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      fraud_flags: { Row: Record<string, unknown>; Insert: never; Update: never; Relationships: [] };
      audit_logs: { Row: Record<string, unknown>; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      start_task: { Args: { p_offer_id: string }; Returns: Database["public"]["Tables"]["task_sessions"]["Row"] };
      request_withdrawal: { Args: { p_amount: number; p_payout_method_id: string; p_idempotency_key: string }; Returns: Database["public"]["Tables"]["withdrawals"]["Row"] };
      cancel_withdrawal: { Args: { p_withdrawal_id: string }; Returns: Database["public"]["Tables"]["withdrawals"]["Row"] };
      create_support_ticket: { Args: { p_subject: string; p_category: string; p_body: string; p_task_session_id?: string | null; p_withdrawal_id?: string | null }; Returns: Database["public"]["Tables"]["support_tickets"]["Row"] };
      admin_dashboard_metrics: { Args: Record<string, never>; Returns: Json };
      review_withdrawal: { Args: { p_withdrawal_id: string; p_action: string; p_note?: string | null; p_provider_reference?: string | null; p_receipt_url?: string | null; p_receipt_name?: string | null }; Returns: Database["public"]["Tables"]["withdrawals"]["Row"] };
    };
    Enums: {
      app_role: AppRole;
      offer_category: OfferCategory;
      offer_status: OfferStatus;
      task_session_status: TaskSessionStatus;
      conversion_status: ConversionStatus;
      withdrawal_status: WithdrawalStatus;
      payout_method_type: PayoutMethodType;
    };
    CompositeTypes: Record<string, never>;
  };
};
