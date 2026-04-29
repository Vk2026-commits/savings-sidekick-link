export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string
          created_at: string
          details: Json
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      affiliate_agreement_acceptances: {
        Row: {
          agreement_version: string
          created_at: string
          id: string
          ip_address: string | null
          partner_id: string
          signature_date: string
          signature_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          agreement_version?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          partner_id: string
          signature_date?: string
          signature_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          agreement_version?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          partner_id?: string
          signature_date?: string
          signature_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_applications: {
        Row: {
          admin_notes: string | null
          agreement_accepted: boolean
          audience_size: string | null
          business_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          partner_type: string
          payment_details: string | null
          payment_method: string
          phone: string | null
          promotion_plan: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          agreement_accepted?: boolean
          audience_size?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          partner_type: string
          payment_details?: string | null
          payment_method: string
          phone?: string | null
          promotion_plan: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          agreement_accepted?: boolean
          audience_size?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          partner_type?: string
          payment_details?: string | null
          payment_method?: string
          phone?: string | null
          promotion_plan?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          landing_page: string | null
          partner_id: string
          referral_code: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          partner_id: string
          referral_code: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          partner_id?: string
          referral_code?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          collected_at: string
          commission_amount: number
          commission_rate: number
          created_at: string
          currency: string
          hold_until: string | null
          id: string
          net_revenue: number
          notes: string | null
          paid_at: string | null
          partner_id: string
          payout_id: string | null
          referral_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          collected_at?: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          currency?: string
          hold_until?: string | null
          id?: string
          net_revenue?: number
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          payout_id?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          collected_at?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          hold_until?: string | null
          id?: string
          net_revenue?: number
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          payout_id?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_partners: {
        Row: {
          application_id: string | null
          approved_at: string | null
          approved_by: string | null
          business_name: string | null
          commission_rate: number
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          partner_type: string
          payment_details: string | null
          payment_method: string | null
          payout_duration_months: number
          referral_code: string
          status: string
          total_clicks: number
          total_paid_conversions: number
          total_signups: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          commission_rate?: number
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          partner_type: string
          payment_details?: string | null
          payment_method?: string | null
          payout_duration_months?: number
          referral_code: string
          status?: string
          total_clicks?: number
          total_paid_conversions?: number
          total_signups?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_name?: string | null
          commission_rate?: number
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          partner_type?: string
          payment_details?: string | null
          payment_method?: string | null
          payout_duration_months?: number
          referral_code?: string
          status?: string
          total_clicks?: number
          total_paid_conversions?: number
          total_signups?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_partners_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "affiliate_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          id: string
          method: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          period_end: string | null
          period_start: string | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          period_end?: string | null
          period_start?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          period_end?: string | null
          period_start?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          attribution_date: string
          cancelled_at: string | null
          click_id: string | null
          conversion_status: string
          created_at: string
          first_paid_at: string | null
          id: string
          partner_id: string
          plan_type: string | null
          referred_email: string
          referred_first_name: string | null
          referred_user_id: string
          updated_at: string
        }
        Insert: {
          attribution_date?: string
          cancelled_at?: string | null
          click_id?: string | null
          conversion_status?: string
          created_at?: string
          first_paid_at?: string | null
          id?: string
          partner_id: string
          plan_type?: string | null
          referred_email: string
          referred_first_name?: string | null
          referred_user_id: string
          updated_at?: string
        }
        Update: {
          attribution_date?: string
          cancelled_at?: string | null
          click_id?: string | null
          conversion_status?: string
          created_at?: string
          first_paid_at?: string | null
          id?: string
          partner_id?: string
          plan_type?: string | null
          referred_email?: string
          referred_first_name?: string | null
          referred_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_clicks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount: number
          auto_pay: boolean
          category: string
          created_at: string
          due_date: number
          frequency: string
          id: string
          is_paid: boolean
          is_recurring: boolean | null
          month: string | null
          name: string
          owner: string
          paid_date: string | null
          payment_account_id: string | null
          pending_review: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          auto_pay?: boolean
          category?: string
          created_at?: string
          due_date?: number
          frequency?: string
          id?: string
          is_paid?: boolean
          is_recurring?: boolean | null
          month?: string | null
          name: string
          owner?: string
          paid_date?: string | null
          payment_account_id?: string | null
          pending_review?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay?: boolean
          category?: string
          created_at?: string
          due_date?: number
          frequency?: string
          id?: string
          is_paid?: boolean
          is_recurring?: boolean | null
          month?: string | null
          name?: string
          owner?: string
          paid_date?: string | null
          payment_account_id?: string | null
          pending_review?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      category_budgets: {
        Row: {
          budget_limit: number
          category: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_limit?: number
          category?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_limit?: number
          category?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_access_log: {
        Row: {
          action: string
          created_at: string
          document_id: string | null
          file_path: string
          id: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          document_id?: string | null
          file_path: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          document_id?: string | null
          file_path?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      estate_access_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          requested_at: string
          requester_email: string
          resolved_at: string | null
          status: string
          trusted_contact_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          requested_at?: string
          requester_email: string
          resolved_at?: string | null
          status?: string
          trusted_contact_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          requested_at?: string
          requester_email?: string
          resolved_at?: string | null
          status?: string
          trusted_contact_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_access_requests_trusted_contact_id_fkey"
            columns: ["trusted_contact_id"]
            isOneToOne: false
            referencedRelation: "estate_trusted_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_accounts: {
        Row: {
          account_number_last4: string | null
          account_type: string
          created_at: string
          estimated_value: number | null
          id: string
          institution: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number_last4?: string | null
          account_type?: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          institution?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number_last4?: string | null
          account_type?: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          institution?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      estate_beneficiaries: {
        Row: {
          beneficiary_type: string
          created_at: string
          id: string
          name: string
          notes: string | null
          percentage: number
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          beneficiary_type?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          percentage?: number
          relationship?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          beneficiary_type?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          percentage?: number
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_beneficiary_links: {
        Row: {
          beneficiary_id: string
          created_at: string
          id: string
          linked_id: string
          linked_type: string
          user_id: string
        }
        Insert: {
          beneficiary_id: string
          created_at?: string
          id?: string
          linked_id: string
          linked_type: string
          user_id: string
        }
        Update: {
          beneficiary_id?: string
          created_at?: string
          id?: string
          linked_id?: string
          linked_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_beneficiary_links_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "estate_beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_digital_access: {
        Row: {
          created_at: string
          email: string | null
          encrypted_secret: string | null
          encryption_iv: string | null
          encryption_salt: string | null
          id: string
          notes: string | null
          service_name: string
          updated_at: string
          url: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          encrypted_secret?: string | null
          encryption_iv?: string | null
          encryption_salt?: string | null
          id?: string
          notes?: string | null
          service_name?: string
          updated_at?: string
          url?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          encrypted_secret?: string | null
          encryption_iv?: string | null
          encryption_salt?: string | null
          id?: string
          notes?: string | null
          service_name?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      estate_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_insurance: {
        Row: {
          agent_name: string | null
          agent_phone: string | null
          coverage_amount: number | null
          created_at: string
          id: string
          notes: string | null
          policy_number: string | null
          policy_type: string
          premium: number | null
          premium_frequency: string | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          policy_number?: string | null
          policy_type?: string
          premium?: number | null
          premium_frequency?: string | null
          provider?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string | null
          agent_phone?: string | null
          coverage_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          policy_number?: string | null
          policy_type?: string
          premium?: number | null
          premium_frequency?: string | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_legal_documents: {
        Row: {
          attorney: string | null
          created_at: string
          date_signed: string | null
          document_type: string
          expiration_date: string | null
          id: string
          location: string | null
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attorney?: string | null
          created_at?: string
          date_signed?: string | null
          document_type?: string
          expiration_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attorney?: string | null
          created_at?: string
          date_signed?: string | null
          document_type?: string
          expiration_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_people: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_property: {
        Row: {
          created_at: string
          description: string
          estimated_value: number | null
          id: string
          location: string | null
          notes: string | null
          property_type: string
          title_holder: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          estimated_value?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          property_type?: string
          title_holder?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_value?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          property_type?: string
          title_holder?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_tab_status: {
        Row: {
          created_at: string
          id: string
          is_complete: boolean
          last_reviewed_at: string | null
          tab_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complete?: boolean
          last_reviewed_at?: string | null
          tab_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complete?: boolean
          last_reviewed_at?: string | null
          tab_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estate_trusted_contacts: {
        Row: {
          accepted_at: string | null
          contact_email: string
          contact_name: string
          created_at: string
          id: string
          invited_at: string
          revoked_at: string | null
          status: string
          updated_at: string
          user_id: string
          waiting_period_days: number
        }
        Insert: {
          accepted_at?: string | null
          contact_email: string
          contact_name?: string
          created_at?: string
          id?: string
          invited_at?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          waiting_period_days?: number
        }
        Update: {
          accepted_at?: string | null
          contact_email?: string
          contact_name?: string
          created_at?: string
          id?: string
          invited_at?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          waiting_period_days?: number
        }
        Relationships: []
      }
      estate_wishes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
          wish_type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
          wish_type?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          wish_type?: string
        }
        Relationships: []
      }
      expense_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      faith_devotional_log: {
        Row: {
          completed_at: string
          created_at: string
          devotional_date: string
          devotional_id: string
          id: string
          reflection: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          devotional_date: string
          devotional_id: string
          id?: string
          reflection?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          devotional_date?: string
          devotional_id?: string
          id?: string
          reflection?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          balance: number
          created_at: string
          id: string
          interest_rate: number
          minimum_payment: number
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number
          minimum_payment?: number
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number
          minimum_payment?: number
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          access_token: string
          account_ids: string[] | null
          created_at: string
          id: string
          institution_id: string | null
          institution_name: string
          item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_ids?: string[] | null
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name: string
          item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_ids?: string[] | null
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name?: string
          item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          nickname: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          nickname?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          nickname?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plaid_secrets: {
        Row: {
          access_token: string
          created_at: string
          id: string
          linked_account_id: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          linked_account_id: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          linked_account_id?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_reminder_log: {
        Row: {
          id: string
          reminder_type: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          reminder_type: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          reminder_type?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      preparedness_checklist: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_complete: boolean
          item_key: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean
          item_key: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean
          item_key?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          color: string
          created_at: string
          current_amount: number
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          target_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_reconciled: boolean
          notes: string | null
          source: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date: string
          description?: string
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          source?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          source?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          first_action: string | null
          goals: string[]
          id: string
          season: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          first_action?: string | null
          goals?: string[]
          id?: string
          season?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          first_action?: string | null
          goals?: string[]
          id?: string
          season?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pins: {
        Row: {
          created_at: string
          id: string
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          discount_expires_at: string | null
          id: string
          tier: string
          trial_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_expires_at?: string | null
          id?: string
          tier?: string
          trial_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_expires_at?: string | null
          id?: string
          tier?: string
          trial_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      linked_accounts_safe: {
        Row: {
          account_ids: string[] | null
          created_at: string | null
          id: string | null
          institution_id: string | null
          institution_name: string | null
          item_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_ids?: string[] | null
          created_at?: string | null
          id?: string | null
          institution_id?: string | null
          institution_name?: string | null
          item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_ids?: string[] | null
          created_at?: string | null
          id?: string | null
          institution_id?: string | null
          institution_name?: string | null
          item_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_invite_affiliate_partner: {
        Args: {
          p_business_name?: string
          p_commission_rate?: number
          p_email: string
          p_first_name: string
          p_last_name: string
          p_partner_type?: string
          p_payment_method?: string
          p_payout_duration_months?: number
        }
        Returns: {
          partner_id: string
          referral_code: string
        }[]
      }
      admin_upgrade_subscription: {
        Args: { new_tier: string; target_user_id: string }
        Returns: undefined
      }
      approve_affiliate_application: {
        Args: {
          app_id: string
          custom_commission_rate?: number
          custom_payout_months?: number
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: { Args: never; Returns: string }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_affiliate_commission: {
        Args: {
          p_currency: string
          p_net_amount: number
          p_plan_type: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "affiliate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "affiliate"],
    },
  },
} as const
