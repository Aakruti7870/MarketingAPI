import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge, Modal, Input, Select } from "../components/ui";
import { Plus, Trash2, UserRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ROLE_TONE = { owner: "gold", admin: "purple", agent: "blue" };

export default function Team() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [saving, setSaving] = useState(false);
  const canManage = user?.role === "owner" || user?.role === "admin";

  const load = () => api.get("/team").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/team", form);
      toast.success("Team member added");
      setOpen(false); load();
      setForm({ name: "", email: "", password: "", role: "agent" });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const del = async (id) => { try { await api.delete(`/team/${id}`); load(); toast.success("Removed"); } catch (err) { toast.error(apiError(err.response?.data?.detail)); } };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Team & Roles</h1>
          <p className="text-slate-500 text-sm mt-1">Owner, Admin & Agent roles with RBAC. Tenant-isolated.</p>
        </div>
        {canManage && <Button onClick={() => setOpen(true)} data-testid="add-member-btn"><Plus className="w-4 h-4" /> Add Member</Button>}
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <Card key={m.id} className="p-5 flex items-center gap-4" data-testid={`member-${m.id}`}>
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center font-heading font-bold text-gold-700 text-lg">{m.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
                <div className="mt-1.5"><Badge tone={ROLE_TONE[m.role]}>{m.role === "owner" && <ShieldCheck className="w-3 h-3" />}{m.role}</Badge></div>
              </div>
              {canManage && m.role !== "owner" && m.id !== user.id && (
                <button onClick={() => del(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Team Member">
        <form onSubmit={save} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} required data-testid="member-name" />
          <Input label="Email *" type="email" value={form.email} onChange={set("email")} required data-testid="member-email" />
          <Input label="Temporary password *" value={form.password} onChange={set("password")} required data-testid="member-password" />
          <Select label="Role" value={form.role} onChange={set("role")}>
            <option value="agent">Agent — handle leads & inbox</option>
            <option value="admin">Admin — manage everything except billing</option>
          </Select>
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-member-btn">{saving ? "Adding…" : "Add Member"}</Button>
        </form>
      </Modal>
    </div>
  );
}
