import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

// Heirloom estate-planning app URL. Update to your custom domain when set up.
const HEIRLOOM_URL = "https://ever-plans-safe.lovable.app";

export default function Estate() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Budget
          </Button>
          <h1 className="text-base font-semibold">Estate & Legacy Planning</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={HEIRLOOM_URL} target="_blank" rel="noopener noreferrer">
            Open in new tab <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </header>
      <iframe
        src={HEIRLOOM_URL}
        title="Heirloom Estate Planning"
        className="flex-1 w-full border-0"
        allow="clipboard-read; clipboard-write; fullscreen"
      />
    </div>
  );
}
