"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { contactsApi } from "@/lib/api";

interface ContactFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function ContactForm({ onSuccess, onError }: ContactFormProps) {
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await contactsApi.create({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || undefined,
      });

      setNewContact({ name: "", phone: "", email: "" });
      onSuccess();
    } catch (err: any) {
      onError(err.message || "Erro ao adicionar contato");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          placeholder="Nome do contato"
          value={newContact.name}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          value={newContact.phone}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemplo.com"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Salvar Contato
          </>
        )}
      </Button>
    </form>
  );
}
