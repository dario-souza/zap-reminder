"use client";

import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Phone,
  Calendar,
  CheckCheck,
  Trash2,
  Send,
  Clock,
  AlertTriangle,
  Repeat,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "SCHEDULED";
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  recurrenceType?: "NONE" | "MONTHLY";
  contact: {
    name: string;
    phone: string;
  };
}

interface MessagesListProps {
  messages: Message[];
  onDelete: (id: string) => void;
  onSendNow: (id: string) => void;
}

const statusConfig = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pendente" },
  SENT: { bg: "bg-green-100", text: "text-green-700", icon: CheckCheck, label: "Enviada" },
  DELIVERED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCheck, label: "Entregue" },
  READ: { bg: "bg-purple-100", text: "text-purple-700", icon: CheckCheck, label: "Lida" },
  FAILED: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle, label: "Falhou" },
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700", icon: Calendar, label: "Agendada" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export function MessagesList({ messages, onDelete, onSendNow }: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhuma mensagem criada</p>
        <p className="text-sm">Clique no botão acima para criar sua primeira mensagem</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-medium">{message.contact.name}</span>
                <StatusBadge status={message.status} />
                {message.status === "SCHEDULED" && message.recurrenceType === "MONTHLY" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    <Repeat className="w-3 h-3" />
                    Mensal
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-2">{message.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {message.contact.phone}
                </span>
                {message.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Agendado: {new Date(message.scheduledAt).toLocaleString("pt-BR")}
                  </span>
                )}
                {message.sentAt && (
                  <span className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    Enviado: {new Date(message.sentAt).toLocaleString("pt-BR")}
                  </span>
                )}
                {message.deliveredAt && (
                  <span className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    Entregue: {new Date(message.deliveredAt).toLocaleString("pt-BR")}
                  </span>
                )}
                {message.readAt && (
                  <span className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    Lida: {new Date(message.readAt).toLocaleString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {message.status === "PENDING" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendNow(message.id)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(message.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
