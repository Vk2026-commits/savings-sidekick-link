import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Megaphone, Mail, MessageSquare, Instagram } from "lucide-react";

interface Template {
  id: string;
  title: string;
  channel: "email" | "text" | "social";
  subject?: string;
  body: string;
}

const TEMPLATES: Template[] = [
  {
    id: "email-organize",
    title: "Organize your financial life",
    channel: "email",
    subject: "A better way to organize your financial life",
    body: `Hi [Name],

I wanted to share Faithnancial with you.

It helps you organize your budget, net worth, important documents, insurance information, and estate planning details in one secure place.

It is especially helpful for families who want everything organized before it is needed.

You can start here:

[Referral Link]

Disclosure: I may receive compensation if you subscribe through my link.`,
  },
  {
    id: "email-scattered",
    title: "Scattered finances → one place",
    channel: "email",
    subject: "Get your financial life organized",
    body: `Most families have financial accounts, insurance documents, and estate information scattered everywhere.

Faithnancial helps you organize your finances, documents, and estate planning information in one secure place.

Start your free trial here:

[Referral Link]

Disclosure: I may receive compensation if you subscribe through my link.`,
  },
  {
    id: "text-short",
    title: "Quick share (text/DM)",
    channel: "text",
    body: `I thought you might find Faithnancial useful. It helps organize your finances, documents, and estate planning info in one secure place: [Referral Link]

Disclosure: I may receive compensation if you subscribe.`,
  },
];

const channelMeta = {
  email: { icon: Mail, label: "Email" },
  text: { icon: MessageSquare, label: "Text / DM" },
  social: { icon: Instagram, label: "Social" },
};

export default function MarketingTemplates({ referralUrl }: { referralUrl: string }) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fillTemplate = (text: string) => text.split("[Referral Link]").join(referralUrl);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard", description: "Your referral link is included." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderTemplates = (channel: Template["channel"]) => {
    const items = TEMPLATES.filter((t) => t.channel === channel);
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          More templates coming soon.
        </p>
      );
    }
    return (
      <div className="space-y-4">
        {items.map((t) => {
          const filledBody = fillTemplate(t.body);
          const fullCopy = t.subject
            ? `Subject: ${t.subject}\n\n${filledBody}`
            : filledBody;
          return (
            <div key={t.id} className="border rounded-lg p-3 sm:p-4 space-y-3 bg-card/50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm">{t.title}</h4>
                  {t.subject && (
                    <p className="text-xs text-muted-foreground mt-1 break-words">
                      <span className="font-medium">Subject:</span> {t.subject}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={copiedId === t.id ? "default" : "secondary"}
                  onClick={() => copy(t.id, fullCopy)}
                  className="sm:w-auto w-full sm:shrink-0"
                >
                  {copiedId === t.id ? (
                    <><Check className="h-4 w-4 mr-1" /> Copied</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-1" /> Copy</>
                  )}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-muted-foreground font-sans bg-muted/40 rounded p-3 border break-words">
                {filledBody}
              </pre>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Marketing Templates
          <Badge variant="outline" className="ml-2 text-xs">More coming soon</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-1">
          Ready-to-use copy for promoting Faithnancial. Your referral link is automatically inserted.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            {(["email", "text", "social"] as const).map((c) => {
              const Icon = channelMeta[c].icon;
              return (
                <TabsTrigger key={c} value={c} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{channelMeta[c].label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value="email" className="mt-4">{renderTemplates("email")}</TabsContent>
          <TabsContent value="text" className="mt-4">{renderTemplates("text")}</TabsContent>
          <TabsContent value="social" className="mt-4">{renderTemplates("social")}</TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          FTC disclosure language is included in each template — please keep it when sharing.
        </p>
      </CardContent>
    </Card>
  );
}
