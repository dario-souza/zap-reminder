"use client";

import { Button } from "@/components/ui/button";
import { FileText, Trash2, Pencil, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesListProps {
  templates: Template[];
  onDelete: (id: string) => void;
  onEdit: (template: Template) => void;
}

export function TemplatesList({ templates, onDelete, onEdit }: TemplatesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum template cadastrado</p>
        <p className="text-sm">Clique no botão acima para criar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{template.name}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {template.content}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(template)}
              className={`${copiedId === template.id ? "text-green-600 bg-green-50" : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"}`}
              title="Copiar mensagem"
            >
              {copiedId === template.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              title="Editar template"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(template.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Excluir template"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
