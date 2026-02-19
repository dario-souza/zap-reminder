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
import { Plus, RefreshCw, Send, Calendar } from "lucide-react";
import { useState } from "react";
import { messagesApi } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface MessageFormProps {
  contacts: Contact[];
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export function MessageForm({ contacts, onSuccess, onError }: MessageFormProps) {
  const [newMessage, setNewMessage] = useState({
    content: "",
    contactId: "",
    scheduledAt: "",
    sendNow: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.contactId) {
      onError("Selecione um contato");
      return;
    }

    setIsSaving(true);

    try {
      const messageData: any = {
        content: newMessage.content,
        contactId: newMessage.contactId,
      };

      if (newMessage.scheduledAt && !newMessage.sendNow) {
        messageData.scheduledAt = new Date(newMessage.scheduledAt).toISOString();
      }

      const createdMessage = await messagesApi.create(messageData);

      if (newMessage.sendNow) {
        await messagesApi.sendNow(createdMessage.id);
        onSuccess("Mensagem enviada com sucesso!");
      } else if (newMessage.scheduledAt) {
        onSuccess("Mensagem agendada com sucesso!");
      } else {
        onSuccess("Mensagem criada! Use o botão 'Enviar Agora' quando quiser.");
      }

      setNewMessage({ content: "", contactId: "", scheduledAt: "", sendNow: false });
    } catch (err: any) {
      onError(err.message || "Erro ao criar mensagem");
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonContent = () => {
    if (isSaving) {
      return (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Salvando...
        </>
      );
    }

    if (newMessage.sendNow) {
      return (
        <>
          <Send className="w-4 h-4 mr-2" />
          Enviar Agora
        </>
      );
    }

    if (newMessage.scheduledAt) {
      return (
        <>
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Mensagem
        </>
      );
    }

    return (
      <>
        <Plus className="w-4 h-4 mr-2" />
        Salvar Mensagem
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="contact">Contato *</Label>
        <Select
          value={newMessage.contactId}
          onValueChange={(value) => setNewMessage({ ...newMessage, contactId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um contato" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name} - {contact.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Mensagem *</Label>
        <Textarea
          id="content"
          placeholder="Digite sua mensagem aqui..."
          value={newMessage.content}
          onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
          required
          rows={4}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="scheduledAt">Agendar para (opcional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={newMessage.scheduledAt}
            onChange={(e) =>
              setNewMessage({
                ...newMessage,
                scheduledAt: e.target.value,
                sendNow: false,
              })
            }
            disabled={newMessage.sendNow}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="sendNow"
          checked={newMessage.sendNow}
          onChange={(e) =>
            setNewMessage({
              ...newMessage,
              sendNow: e.target.checked,
              scheduledAt: "",
            })
          }
          className="rounded border-gray-300"
        />
        <Label htmlFor="sendNow" className="text-sm cursor-pointer">
          Enviar imediatamente
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600"
        disabled={isSaving}
      >
        {getButtonContent()}
      </Button>
    </form>
  );
}
