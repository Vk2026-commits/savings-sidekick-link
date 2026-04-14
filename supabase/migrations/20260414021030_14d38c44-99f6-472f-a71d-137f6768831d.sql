
-- Estate People (Next of Kin, Professional Team, Fiduciary Roles)
CREATE TABLE public.estate_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'next_of_kin',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_people" ON public.estate_people FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_people_updated_at BEFORE UPDATE ON public.estate_people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Beneficiaries
CREATE TABLE public.estate_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT '',
  beneficiary_type TEXT NOT NULL DEFAULT 'primary',
  percentage NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_beneficiaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_beneficiaries" ON public.estate_beneficiaries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_beneficiaries_updated_at BEFORE UPDATE ON public.estate_beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Beneficiary Links (link beneficiaries to accounts or insurance)
CREATE TABLE public.estate_beneficiary_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL REFERENCES public.estate_beneficiaries(id) ON DELETE CASCADE,
  linked_type TEXT NOT NULL,
  linked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_beneficiary_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_beneficiary_links" ON public.estate_beneficiary_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Estate Accounts
CREATE TABLE public.estate_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  account_type TEXT NOT NULL DEFAULT 'bank',
  account_number_last4 TEXT DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  estimated_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_accounts" ON public.estate_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_accounts_updated_at BEFORE UPDATE ON public.estate_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Insurance Policies
CREATE TABLE public.estate_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT '',
  policy_number TEXT DEFAULT '',
  policy_type TEXT NOT NULL DEFAULT 'life',
  coverage_amount NUMERIC DEFAULT 0,
  premium NUMERIC DEFAULT 0,
  premium_frequency TEXT DEFAULT 'monthly',
  agent_name TEXT DEFAULT '',
  agent_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_insurance" ON public.estate_insurance FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_insurance_updated_at BEFORE UPDATE ON public.estate_insurance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Property & Assets
CREATE TABLE public.estate_property (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'real_estate',
  description TEXT NOT NULL DEFAULT '',
  estimated_value NUMERIC DEFAULT 0,
  location TEXT DEFAULT '',
  title_holder TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_property ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_property" ON public.estate_property FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_property_updated_at BEFORE UPDATE ON public.estate_property FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Digital Access (with encrypted vault)
CREATE TABLE public.estate_digital_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL DEFAULT '',
  username TEXT DEFAULT '',
  email TEXT DEFAULT '',
  url TEXT DEFAULT '',
  encrypted_secret TEXT DEFAULT NULL,
  encryption_iv TEXT DEFAULT NULL,
  encryption_salt TEXT DEFAULT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_digital_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_digital_access" ON public.estate_digital_access FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_digital_access_updated_at BEFORE UPDATE ON public.estate_digital_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Legal Documents
CREATE TABLE public.estate_legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'will',
  title TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  attorney TEXT DEFAULT '',
  date_signed TEXT DEFAULT '',
  expiration_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_legal_documents" ON public.estate_legal_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_legal_documents_updated_at BEFORE UPDATE ON public.estate_legal_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Document Vault (uploaded files metadata)
CREATE TABLE public.estate_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT DEFAULT '',
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_documents" ON public.estate_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_documents_updated_at BEFORE UPDATE ON public.estate_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Estate Wishes (funeral, organ donation, etc.)
CREATE TABLE public.estate_wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wish_type TEXT NOT NULL DEFAULT 'funeral',
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own estate_wishes" ON public.estate_wishes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_wishes_updated_at BEFORE UPDATE ON public.estate_wishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trusted Contacts for Emergency Access
CREATE TABLE public.estate_trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  waiting_period_days INTEGER NOT NULL DEFAULT 7,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_trusted_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage own trusted contacts" ON public.estate_trusted_contacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_trusted_contacts_updated_at BEFORE UPDATE ON public.estate_trusted_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Emergency Access Requests
CREATE TABLE public.estate_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trusted_contact_id UUID NOT NULL REFERENCES public.estate_trusted_contacts(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage access requests" ON public.estate_access_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners update access requests" ON public.estate_access_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners delete access requests" ON public.estate_access_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert access requests" ON public.estate_access_requests FOR INSERT WITH CHECK (true);

-- Audit Log
CREATE TABLE public.estate_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT DEFAULT '',
  resource_id UUID,
  actor_id UUID,
  actor_email TEXT DEFAULT '',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own audit log" ON public.estate_audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert audit entries" ON public.estate_audit_log FOR INSERT WITH CHECK (true);

-- Tab Status (completion tracking)
CREATE TABLE public.estate_tab_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tab_name TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tab_name)
);
ALTER TABLE public.estate_tab_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tab status" ON public.estate_tab_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_estate_tab_status_updated_at BEFORE UPDATE ON public.estate_tab_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Private storage bucket for estate documents
INSERT INTO storage.buckets (id, name, public) VALUES ('estate-documents', 'estate-documents', false);

CREATE POLICY "Users upload own estate docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'estate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own estate docs" ON storage.objects FOR SELECT USING (bucket_id = 'estate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own estate docs" ON storage.objects FOR DELETE USING (bucket_id = 'estate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own estate docs" ON storage.objects FOR UPDATE USING (bucket_id = 'estate-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
