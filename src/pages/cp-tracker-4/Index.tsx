import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, Search, Eye, Building2, FileText, Banknote } from "lucide-react";

const CPS = [
  { id: "CP-01", name: "Structural Works – Block A", contractor: "Renova NV", value: "€4.2M", drawdown: "2024-08-15", milestones: 6, done: 6, docs: 4, docsDone: 4, finance: 3, financeDone: 3, status: "On Track" },
  { id: "CP-02", name: "MEP Installation – Block A", contractor: "TechnoInstall BV", value: "€2.1M", drawdown: "2024-09-01", milestones: 5, done: 4, docs: 5, docsDone: 3, finance: 3, financeDone: 2, status: "At Risk" },
  { id: "CP-03", name: "Facade & Glazing – Block B", contractor: "VitroGlass SA", value: "€3.7M", drawdown: "2024-09-20", milestones: 7, done: 3, docs: 6, docsDone: 2, finance: 4, financeDone: 1, status: "Blocked" },
  { id: "CP-04", name: "Interior Fit-Out – Level 1", contractor: "Meridian Interiors", value: "€1.8M", drawdown: "2024-10-05", milestones: 4, done: 4, docs: 3, docsDone: 3, finance: 2, financeDone: 2, status: "On Track" },
  { id: "CP-05", name: "Roofing & Waterproofing", contractor: "DakPro BVBA", value: "€0.9M", drawdown: "2024-10-18", milestones: 3, done: 2, docs: 4, docsDone: 4, finance: 2, financeDone: 1, status: "At Risk" },
  { id: "CP-06", name: "Landscaping & External Works", contractor: "GreenScape NV", value: "€0.6M", drawdown: "2024-11-01", milestones: 3, done: 0, docs: 2, docsDone: 0, finance: 2, financeDone: 0, status: "Blocked" },
];

const DETAILS: Record<string, { milestones: {label: string; done: boolean; date: string}[]; docs: {label: string; done: boolean; owner: string}[]; finance: {label: string; done: boolean; note: string}[] }> = {
  "CP-02": {
    milestones: [
      { label: "Site handover", done: true, date: "2024-06-01" },
      { label: "Rough-in complete", done: true, date: "2024-06-28" },
      { label: "1st fix inspection", done: true, date: "2024-07-10" },
      { label: "2nd fix complete", done: true, date: "2024-07-25" },
      { label: "Commissioning sign-off", done: false, date: "2024-08-20" },
    ],
    docs: [
      { label: "Signed Contract", done: true, owner: "Legal" },
      { label: "Performance Bond", done: true, owner: "Finance" },
      { label: "Insurance Certificate", done: true, owner: "Legal" },
      { label: "Progress Report #3", done: false, owner: "PM" },
      { label: "Inspection Protocol", done: false, owner: "Technical" },
    ],
    finance: [
      { label: "Drawdown Request Submitted", done: true, note: "Submitted 2024-07-05" },
      { label: "Belfius Condition 4a – Insurance", done: true, note: "Cleared" },
      { label: "Belfius Condition 7b – Progress %", done: false, note: "Awaiting 80% milestone" },
    ],
  },
  "CP-03": {
    milestones: [
      { label: "Shop drawings approved", done: true, date: "2024-05-15" },
      { label: "Material delivery", done: true, date: "2024-06-10" },
      { label: "Ground floor facade", done: true, date: "2024-07-01" },
      { label: "Level 2–4 facade", done: false, date: "2024-08-10" },
      { label: "Level 5–7 facade", done: false, date: "2024-08-28" },
      { label: "Glazing complete", done: false, date: "2024-09-05" },
      { label: "Snagging", done: false, date: "2024-09-15" },
    ],
    docs: [
      { label: "Signed Contract", done: true, owner: "Legal" },
      { label: "Performance Bond", done: false, owner: "Finance" },
      { label: "Insurance Certificate", done: false, owner: "Legal" },
      { label: "CE Certification", done: false, owner: "Technical" },
      { label: "Progress Report #2", done: false, owner: "PM" },
      { label: "Bank Approval Letter", done: true, owner: "Finance" },
    ],
    finance: [
      { label: "Drawdown Request Submitted", done: false, note: "Not yet submitted" },
      { label: "Belfius Condition 2 – Bond", done: false, note: "Bond missing" },
      { label: "Belfius Condition 5 – Insurances", done: false, note: "Certificate expired" },
      { label: "Belfius Condition 9 – Progress %", done: true, note: "Cleared at 40%" },
    ],
  },
};

const statusColor: Record<string, string> = {
  "On Track": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "At Risk": "bg-amber-100 text-amber-700 border-amber-300",
  "Blocked": "bg-red-100 text-red-700 border-red-300",
};

const statusIcon = (s: string) =>
  s === "On Track" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
  s === "At Risk" ? <Clock className="w-4 h-4 text-amber-600" /> :
  <AlertTriangle className="w-4 h-4 text-red-600" />;

export default function CPTrackerApp() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("milestones");

  const filtered = CPS.filter(cp =>
    (statusFilter === "All" || cp.status === statusFilter) &&
    (cp.name.toLowerCase().includes(search.toLowerCase()) || cp.contractor.toLowerCase().includes(search.toLowerCase()) || cp.id.toLowerCase().includes(search.toLowerCase()))
  );

  const total = CPS.length;
  const onTrack = CPS.filter(c => c.status === "On Track").length;
  const atRisk = CPS.filter(c => c.status === "At Risk").length;
  const blocked = CPS.filter(c => c.status === "Blocked").length;
  const totalValue = "€13.3M";

  const cp = selected ? CPS.find(c => c.id === selected) : null;
  const detail = selected ? DETAILS[selected] : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> CP Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Unified view of Construction Package milestones, Belfius financing conditions, and contractor deliverables.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:"Total CPs",value:total,icon:<Building2 className="w-5 h-5 text-primary"/>,sub:totalValue+" total value"},{label:"On Track",value:onTrack,icon:<CheckCircle2 className="w-5 h-5 text-emerald-600"/>,sub:"Ready for drawdown"},{label:"At Risk",value:atRisk,icon:<Clock className="w-5 h-5 text-amber-600"/>,sub:"Needs attention"},{label:"Blocked",value:blocked,icon:<AlertTriangle className="w-5 h-5 text-red-600"/>,sub:"Action required"}].map(k=>(
          <Card key={k.label} className="bg-card border-border">
            <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{k.label}</CardTitle>
              {k.icon}
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-3xl font-bold text-foreground">{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Construction Packages</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search CP, contractor…" className="pl-8 h-9 w-52 text-sm" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              {["All","On Track","At Risk","Blocked"].map(s=>(
                <Button key={s} size="sm" variant={statusFilter===s?"default":"outline"} className="h-9 text-xs" onClick={()=>setStatusFilter(s)}>{s}</Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs">CP</TableHead>
                <TableHead className="text-xs">Contractor</TableHead>
                <TableHead className="text-xs">Value</TableHead>
                <TableHead className="text-xs">Drawdown</TableHead>
                <TableHead className="text-xs">Milestones</TableHead>
                <TableHead className="text-xs">Documents</TableHead>
                <TableHead className="text-xs">Finance</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(cp=>(
                <TableRow key={cp.id} className="border-border hover:bg-muted/40">
                  <TableCell><div className="font-mono text-xs font-semibold text-primary">{cp.id}</div><div className="text-xs text-foreground max-w-[160px] truncate">{cp.name}</div></TableCell>
                  <TableCell className="text-xs text-foreground">{cp.contractor}</TableCell>
                  <TableCell className="text-xs font-medium text-foreground">{cp.value}</TableCell>
                  <TableCell className="text-xs text-foreground">{cp.drawdown}</TableCell>
                  <TableCell><div className="text-xs">{cp.done}/{cp.milestones}</div><div className="w-20 h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className="h-full bg-primary rounded" style={{width:`${(cp.done/cp.milestones)*100}%`}}/></div></TableCell>
                  <TableCell><div className="text-xs">{cp.docsDone}/{cp.docs}</div><div className="w-20 h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className={`h-full rounded ${cp.docsDone<cp.docs?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${(cp.docsDone/cp.docs)*100}%`}}/></div></TableCell>
                  <TableCell><div className="text-xs">{cp.financeDone}/{cp.finance}</div><div className="w-20 h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className={`h-full rounded ${cp.financeDone<cp.finance?'bg-red-500':'bg-emerald-500'}`} style={{width:`${(cp.financeDone/cp.finance)*100}%`}}/></div></TableCell>
                  <TableCell><Badge className={`text-xs border ${statusColor[cp.status]} flex items-center gap-1 w-fit`}>{statusIcon(cp.status)}{cp.status}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-8 px-2" onClick={()=>{setSelected(cp.id);setDetailTab("milestones");}} disabled={!DETAILS[cp.id]}><Eye className="w-4 h-4"/></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length===0&&<TableRow><TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-8">No construction packages match your filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={o=>{if(!o)setSelected(null);}}>
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="w-5 h-5 text-primary"/>
              {cp?.id} — {cp?.name}
              {cp && <Badge className={`ml-2 text-xs border ${statusColor[cp.status]}`}>{cp.status}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="milestones" className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/>Milestones</TabsTrigger>
                <TabsTrigger value="docs" className="flex items-center gap-1"><FileText className="w-3.5 h-3.5"/>Documents</TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5"/>Belfius Finance</TabsTrigger>
              </TabsList>
              <TabsContent value="milestones">
                <div className="space-y-2">
                  {detail.milestones.map((m,i)=>(
                    <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${m.done?'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30':'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-2">{m.done?<CheckCircle2 className="w-4 h-4 text-emerald-600"/>:<Clock className="w-4 h-4 text-muted-foreground"/>}<span className="text-sm text-foreground">{m.label}</span></div>
                      <span className="text-xs text-muted-foreground">{m.date}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="docs">
                <div className="space-y-2">
                  {detail.docs.map((d,i)=>(
                    <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${d.done?'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30':'border-amber-200 bg-amber-50 dark:bg-amber-950/20'}`}>
                      <div className="flex items-center gap-2">{d.done?<CheckCircle2 className="w-4 h-4 text-emerald-600"/>:<AlertTriangle className="w-4 h-4 text-amber-600"/>}<span className="text-sm text-foreground">{d.label}</span></div>
                      <Badge variant="outline" className="text-xs">{d.owner}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="finance">
                <div className="space-y-2">
                  {detail.finance.map((f,i)=>(
                    <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${f.done?'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30':'border-red-200 bg-red-50 dark:bg-red-950/20'}`}>
                      <div className="flex items-center gap-2">{f.done?<CheckCircle2 className="w-4 h-4 text-emerald-600"/>:<AlertTriangle className="w-4 h-4 text-red-600"/>}<span className="text-sm text-foreground">{f.label}</span></div>
                      <span className="text-xs text-muted-foreground">{f.note}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter><Button variant="outline" onClick={()=>setSelected(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
