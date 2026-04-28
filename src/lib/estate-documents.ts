import { supabase } from "@/integrations/supabase/client";

/**
 * Get a short-lived signed URL for a private estate document.
 * - Bucket is private; URL expires in `expiresInSeconds` (default 60s).
 * - Logs the access event to document_access_log for audit purposes.
 * - RLS on estate_documents already enforces ownership, so we trust filePath
 *   came from a row the current user can read.
 */
export async function getEstateDocumentSignedUrl(
  filePath: string,
  documentId?: string,
  expiresInSeconds = 60,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from("estate-documents")
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return { url: null, error: error?.message ?? "Unable to generate document link" };
  }

  // Best-effort access log; do not block download if logging fails.
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      await supabase.from("document_access_log").insert({
        user_id: userId,
        document_id: documentId ?? null,
        file_path: filePath,
        action: "download",
      });
    }
  } catch {
    /* swallow */
  }

  return { url: data.signedUrl, error: null };
}
