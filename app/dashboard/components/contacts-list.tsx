"use client";

import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Trash2, Pencil } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface ContactsListProps {
  contacts: Contact[];
  onDelete: (id: string) => void;
  onEdit: (contact: Contact) => void;
}

export function ContactsList({ contacts, onDelete, onEdit }: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum contato cadastrado</p>
        <p className="text-sm">Clique no botão acima para adicionar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{contact.name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {contact.phone}
                </span>
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {contact.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
