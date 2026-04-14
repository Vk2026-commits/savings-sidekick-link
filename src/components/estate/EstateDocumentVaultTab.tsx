import { useState, useRef } from "react";
import { useEstateDocuments } from "@/hooks/useEstate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, Upload, FileText, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["will", "trust", "insurance", "financial", "property", "medical", "identification", "other"];

export default function EstateDocumentVaultTab() {
  const { data, loading, add, remove, refetch } = useEstateDocuments();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 20 * 1024 * 1024) { toast({ title: "File too large (max 20MB)", variant: "destructive" }); return; }
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("estate-documents").upload(filePath, file);
    if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); setUploading(false); return; }
    await add({ file_name: file.name, file_path: filePath, category, description, file_size: file.size, mime_type: file.type });
    setDescription("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (doc: any) => {
    const { data: signedUrl, error } = await supabase.storage.from("estate-documents").createSignedUrl(doc.file_path, 60);
    if (error || !signedUrl) { toast({ title: "Download failed", variant: "destructive" }); return; }
    window.open(signedUrl.signedUrl, "_blank");
  };

  const handleDelete = async (doc: any) => {
    await supabase.storage.from("estate-documents").remove([doc.file_path]);
    await remove(doc.id);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> A centralized, secure document vault ensures your executor and loved ones can quickly find all important documents when they're needed most.
        </p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Document</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="flex-1" />
          <div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleUpload} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Plus className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      </div>

      {loading ? <div className="text-center text-muted-foreground py-8">Loading...</div> : data.length === 0 ? <div className="text-center text-muted-foreground py-8">No documents uploaded yet.</div> : (
        <div className="space-y-3">
          {data.map((doc: any) => (
            <Card key={doc.id} className="glass-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  {doc.mime_type?.includes("pdf") ? <FileText className="h-8 w-8 text-destructive" /> : <File className="h-8 w-8 text-primary" />}
                  <div>
                    <CardTitle className="text-sm">{doc.file_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(doc)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardHeader>
              {doc.description && <CardContent className="pt-0"><p className="text-xs text-muted-foreground">{doc.description}</p></CardContent>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
