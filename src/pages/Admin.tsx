import { useEffect, useState } from "react";
import { useAdmin, type AdminUser, type UserStats } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Search, KeyRound, Ban, ShieldCheck, Trash2, BarChart3, ArrowLeft, Eye, EyeOff, Crown, LogIn,
} from "lucide-react";
import UserMenu from "@/components/UserMenu";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const admin = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [resetDialog, setResetDialog] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<AdminUser | null>(null);
  const [statsDialog, setStatsDialog] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [upgradeDialog, setUpgradeDialog] = useState<AdminUser | null>(null);
  const [selectedTier, setSelectedTier] = useState("pro");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (admin.isAdmin && !admin.loading) admin.loadUsers();
  }, [admin.isAdmin, admin.loading]);

  if (authLoading || admin.loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }
  if (!user || !admin.isAdmin) return <Navigate to="/" replace />;

  const filtered = admin.users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const proCount = admin.users.filter(u => u.tier === "pro").length;
  const freeCount = admin.users.filter(u => u.tier !== "pro").length;

  const handleResetPassword = async () => {
    if (!resetDialog || !newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await admin.resetPassword(resetDialog.id, newPassword);
      toast({ title: "Success", description: `Password reset for ${resetDialog.email}` });
      setResetDialog(null);
      setNewPassword("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async (u: AdminUser) => {
    setActionLoading(true);
    try {
      await admin.toggleBan(u.id, !u.banned);
      toast({ title: "Success", description: `${u.email} has been ${u.banned ? "enabled" : "disabled"}` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!upgradeDialog) return;
    setActionLoading(true);
    try {
      await admin.upgradePlan(upgradeDialog.id, selectedTier);
      toast({ title: "Success", description: `${upgradeDialog.email} upgraded to ${selectedTier}` });
      setUpgradeDialog(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!deleteDialog) return;
    setActionLoading(true);
    try {
      await admin.deleteUserData(deleteDialog.id);
      toast({ title: "Success", description: `All data deleted for ${deleteDialog.email}` });
      setDeleteDialog(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewStats = async (u: AdminUser) => {
    setStatsDialog(u);
    setStats(null);
    try {
      const s = await admin.getUserStats(u.id);
      setStats(s);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Never";
    const date = new Date(d);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-10 bg-background/80">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admin.users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admin.users.filter(u => !u.banned).length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proCount}</p>
                <p className="text-sm text-muted-foreground">Pro Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{freeCount}</p>
                <p className="text-sm text-muted-foreground">Free Users</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>User Management</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {admin.usersLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <span className="flex items-center gap-1"><LogIn className="h-3.5 w-3.5" /> Last Login</span>
                      </th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2">
                          <p className="font-medium">{u.display_name || u.email}</p>
                          {u.display_name && <p className="text-xs text-muted-foreground">{u.email}</p>}
                        </td>
                        <td className="py-3 px-2">
                          {u.tier === "pro" ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                              <Crown className="h-3 w-3 mr-1" /> Pro
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {u.banned ? <Badge variant="destructive">Disabled</Badge> : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Active</Badge>}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">{formatDate(u.last_sign_in_at)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleViewStats(u)} title="View stats">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setUpgradeDialog(u); setSelectedTier(u.tier === "pro" ? "free" : "pro"); }} title="Change plan">
                              <Crown className="h-4 w-4 text-amber-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setResetDialog(u); setNewPassword(""); }} title="Reset password">
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleToggleBan(u)} title={u.banned ? "Enable" : "Disable"} disabled={u.id === user?.id}>
                              {u.banned ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <Ban className="h-4 w-4 text-destructive" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteDialog(u)} title="Delete data" disabled={u.id === user?.id}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Upgrade Plan Dialog */}
      <Dialog open={!!upgradeDialog} onOpenChange={(o) => !o && setUpgradeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Update subscription for {upgradeDialog?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Current plan: <Badge variant="outline" className="ml-1">{upgradeDialog?.tier || "free"}</Badge></p>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro ($9.99/mo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialog(null)}>Cancel</Button>
            <Button onClick={handleUpgradePlan} disabled={actionLoading}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetDialog} onOpenChange={(o) => !o && setResetDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {resetDialog?.email}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialog(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={actionLoading}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Data Confirm */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All User Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all bills, transactions, income, savings goals, and other financial data for {deleteDialog?.email}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Stats Dialog */}
      <Dialog open={!!statsDialog} onOpenChange={(o) => !o && setStatsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Stats: {statsDialog?.display_name || statsDialog?.email}</DialogTitle>
            <DialogDescription>{statsDialog?.email}</DialogDescription>
          </DialogHeader>
          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{stats.bills}</p>
                <p className="text-sm text-muted-foreground">Bills</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{stats.transactions}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{stats.income_sources}</p>
                <p className="text-sm text-muted-foreground">Income Sources</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{stats.savings_goals}</p>
                <p className="text-sm text-muted-foreground">Savings Goals</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Loading stats...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
