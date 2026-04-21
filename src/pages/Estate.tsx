import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const HEIRLOOM_URL = "https://heirloom.faithnancial.com";

export default function Estate() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Budget
        </Button>
        <h1 className="text-base font-semibold">Estate & Legacy Planning</h1>
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
