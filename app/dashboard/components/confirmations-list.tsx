"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

interface Confirmation {
  id: string;
  status: "PENDING" | "CONFIRMED" | "DENIED";
  contactName: string;
  contactPhone: string;
  eventDate: string;
  messageContent?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface ConfirmationsListProps {
  confirmations: Confirmation[];
  onDelete: (id: string) => void;
}

export function ConfirmationsList({ confirmations, onDelete }: ConfirmationsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Confirmation["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        );
      case "DENIED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
    }
  };

  if (confirmations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma confirmação encontrada</p>
        <p className="text-sm mt-1">
          As confirmações aparecem aqui quando você cria lembretes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {confirmations.map((confirmation) => (
        <Card key={confirmation.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{confirmation.contactName}</CardTitle>
                {getStatusBadge(confirmation.status)}
              </div>
              {(confirmation.status === "CONFIRMED" || confirmation.status === "DENIED") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(confirmation.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Data do evento: {formatDate(confirmation.eventDate)}</span>
              </div>
              {confirmation.messageContent && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Mensagem:</p>
                  <p className="bg-gray-50 p-2 rounded mt-1">{confirmation.messageContent}</p>
                </div>
              )}
              {confirmation.response && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Resposta:</p>
                  <p className="bg-gray-50 p-2 rounded mt-1">"{confirmation.response}"</p>
                  {confirmation.respondedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Respondido em {formatDate(confirmation.respondedAt)} às {formatTime(confirmation.respondedAt)}
                    </p>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-400">
                Telefone: {confirmation.contactPhone}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
