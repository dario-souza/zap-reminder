"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, RefreshCw, Bell } from "lucide-react";
import { useState, useMemo } from "react";
import { messagesApi } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface ReminderFormProps {
  contacts: Contact[];
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export function ReminderForm({ contacts, onSuccess, onError }: ReminderFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    contactId: "",
    content: "",
    scheduledAt: "",
    sendReminder: false,
    reminderDays: 1 as 1 | 2,
  });
  const [isSaving, setIsSaving] = useState(false);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [contacts, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactId) {
      onError("Selecione um contato");
      return;
    }

    if (!formData.content.trim()) {
      onError("Digite o conteúdo da mensagem");
      return;
    }

    if (!formData.scheduledAt) {
      onError("Defina a data da consulta");
      return;
    }

    setIsSaving(true);

    try {
      await messagesApi.createWithReminder({
        content: formData.content,
        contactId: formData.contactId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        reminderDays: formData.reminderDays,
      });

      onSuccess("Lembrete agendado com sucesso!");
      
      setFormData({
        contactId: "",
        content: "",
        scheduledAt: "",
        sendReminder: false,
        reminderDays: 1,
      });
      setSearchTerm("");
    } catch (err: any) {
      onError(err.message || "Erro ao criar lembrete");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Contato *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar contato por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mb-2"
          />
        </div>
        <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
          {(searchTerm ? filteredContacts : contacts).slice(0, 50).map((contact) => (
            <label
              key={contact.id}
              className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer ${
                formData.contactId === contact.id ? 'bg-green-50 border border-green-200' : ''
              }`}
            >
              <input
                type="radio"
                name="contact"
                checked={formData.contactId === contact.id}
                onChange={() => setFormData({ ...formData, contactId: contact.id })}
                className="accent-green-500"
              />
              <span className="text-sm">
                {contact.name} - {contact.phone}
              </span>
            </label>
          ))}
          {(searchTerm ? filteredContacts : contacts).length === 0 && (
            <div className="p-2 text-sm text-gray-500 text-center">
              Nenhum contato encontrado
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Mensagem da Consulta *</Label>
        <Textarea
          id="content"
          placeholder="Digite a mensagem que será enviada no dia da consulta..."
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Data e Hora da Consulta *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) =>
              setFormData({ ...formData, scheduledAt: e.target.value })
            }
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="sendReminder"
          checked={formData.sendReminder}
          onChange={(e) =>
            setFormData({ ...formData, sendReminder: e.target.checked })
          }
          className="rounded border-gray-300"
        />
        <Label htmlFor="sendReminder" className="text-sm cursor-pointer">
          Enviar lembrete de confirmação
        </Label>
      </div>

      {formData.sendReminder && (
        <div className="flex items-center gap-2 ml-6">
          <span className="text-sm text-gray-600">Enviar lembrete</span>
          <Select
            value={formData.reminderDays.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, reminderDays: parseInt(value) as 1 | 2 })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 dia antes</SelectItem>
              <SelectItem value="2">2 dias antes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600"
        disabled={isSaving || !formData.sendReminder}
      >
        {isSaving ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            Agendar Lembrete
          </>
        )}
      </Button>

      {!formData.sendReminder && (
        <p className="text-xs text-gray-500 text-center">
          Ative o lembrete para agendar
        </p>
      )}
    </form>
  );
}
