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
import { Plus, RefreshCw, Send, Calendar, Users, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { messagesApi } from "@/lib/api";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface MessageFormProps {
  contacts: Contact[];
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

type SendType = "single" | "bulk";
type RecurrenceType = "NONE" | "MONTHLY";

export function MessageForm({ contacts, onSuccess, onError }: MessageFormProps) {
  const [sendType, setSendType] = useState<SendType>("single");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermBulk, setSearchTermBulk] = useState("");
  const [newMessage, setNewMessage] = useState({
    content: "",
    contactId: "",
    scheduledAt: "",
    sendNow: false,
    recurrenceType: "NONE" as RecurrenceType,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filtrar contatos por termo de busca
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

  const filteredContactsBulk = useMemo(() => {
    if (!searchTermBulk) return contacts;
    const term = searchTermBulk.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [contacts, searchTermBulk]);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sendType === "single") {
      if (!newMessage.contactId) {
        onError("Selecione um contato");
        return;
      }
    } else {
      if (selectedContacts.length === 0) {
        onError("Selecione pelo menos um contato");
        return;
      }
      if (selectedContacts.length > 50) {
        onError("Máximo de 50 contatos por envio em massa");
        return;
      }
    }

    if (!newMessage.content.trim()) {
      onError("Digite o conteúdo da mensagem");
      return;
    }

    setIsSaving(true);

    try {
      if (sendType === "single") {
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
      } else {
        const bulkData = {
          content: newMessage.content,
          contactIds: selectedContacts,
          scheduledAt: newMessage.scheduledAt && !newMessage.sendNow
            ? new Date(newMessage.scheduledAt).toISOString()
            : undefined,
          sendNow: newMessage.sendNow,
          recurrenceType: newMessage.recurrenceType,
        };

        const result = await messagesApi.createBulk(bulkData);

        if (newMessage.sendNow) {
          onSuccess(
            `${result.successCount || result.total} mensagens enviadas com sucesso!`
          );
        } else if (newMessage.scheduledAt) {
          if (newMessage.recurrenceType === "MONTHLY") {
            onSuccess(
              `${result.total} mensagens agendadas com recorrência mensal!`
            );
          } else {
            onSuccess(`${result.total} mensagens agendadas com sucesso!`);
          }
        } else {
          onSuccess(`${result.total} mensagens criadas!`);
        }
      }

      setNewMessage({
        content: "",
        contactId: "",
        scheduledAt: "",
        sendNow: false,
        recurrenceType: "NONE",
      });
      setSelectedContacts([]);
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
          {sendType === "bulk" ? "Enviando..." : "Salvando..."}
        </>
      );
    }

    if (newMessage.sendNow) {
      return (
        <>
          <Send className="w-4 h-4 mr-2" />
          {sendType === "bulk" ? "Enviar para Todos" : "Enviar Agora"}
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

  const getSubmitDisabled = () => {
    if (isSaving) return true;
    if (sendType === "single") return !newMessage.contactId || !newMessage.content;
    return selectedContacts.length === 0 || !newMessage.content;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Tipo de Envio</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendType"
              checked={sendType === "single"}
              onChange={() => {
                setSendType("single");
                setSelectedContacts([]);
              }}
              className="accent-green-500"
            />
            <span className="text-sm">Um contato</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sendType"
              checked={sendType === "bulk"}
              onChange={() => {
                setSendType("bulk");
                setNewMessage({ ...newMessage, contactId: "" });
              }}
              className="accent-green-500"
            />
            <span className="text-sm flex items-center gap-1">
              <Users className="w-4 h-4" />
              Múltiplos contatos
            </span>
          </label>
        </div>
      </div>

      {sendType === "single" ? (
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
                  newMessage.contactId === contact.id ? 'bg-green-50 border border-green-200' : ''
                }`}
              >
                <input
                  type="radio"
                  name="contact"
                  checked={newMessage.contactId === contact.id}
                  onChange={() => setNewMessage({ ...newMessage, contactId: contact.id })}
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
      ) : (
        <div className="space-y-2">
          <Label>Contatos ({selectedContacts.length} selecionados) *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar contatos por nome, telefone ou email..."
              value={searchTermBulk}
              onChange={(e) => setSearchTermBulk(e.target.value)}
              className="pl-10 mb-2"
            />
          </div>
          <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
            {(searchTermBulk ? filteredContactsBulk : contacts).map((contact) => (
              <label
                key={contact.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleContactToggle(contact.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  {contact.name} - {contact.phone}
                </span>
              </label>
            ))}
          </div>
          {contacts.length > 10 && (
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedContacts(contacts.map((c) => c.id))
                }
              >
                Selecionar Todos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedContacts([])}
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content">Mensagem *</Label>
        <Textarea
          id="content"
          placeholder="Digite sua mensagem aqui..."
          value={newMessage.content}
          onChange={(e) =>
            setNewMessage({ ...newMessage, content: e.target.value })
          }
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

      {newMessage.scheduledAt && !newMessage.sendNow && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurrence"
            checked={newMessage.recurrenceType === "MONTHLY"}
            onChange={(e) =>
              setNewMessage({
                ...newMessage,
                recurrenceType: e.target.checked ? "MONTHLY" : "NONE",
              })
            }
            className="rounded border-gray-300"
          />
          <Label htmlFor="recurrence" className="text-sm cursor-pointer">
            Repetir mensalmente
          </Label>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600"
        disabled={getSubmitDisabled()}
      >
        {getButtonContent()}
      </Button>
    </form>
  );
}
