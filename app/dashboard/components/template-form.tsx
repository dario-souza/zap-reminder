"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, RefreshCw, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { templatesApi } from "@/lib/api";

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateFormProps {
  template?: Template | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export function TemplateForm({ template, onSuccess, onError, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState({ name: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({ name: template.name, content: template.content });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (template) {
        await templatesApi.update(template.id, {
          name: formData.name,
          content: formData.content,
        });
        onSuccess("Template atualizado com sucesso!");
      } else {
        await templatesApi.create({
          name: formData.name,
          content: formData.content,
        });
        onSuccess("Template criado com sucesso!");
        setFormData({ name: "", content: "" });
      }
    } catch (err: any) {
      onError(err.message || "Erro ao salvar template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Template *</Label>
        <Input
          id="name"
          placeholder="Ex: Mensagem de boas-vindas"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Mensagem *</Label>
        <Textarea
          id="content"
          placeholder="Digite sua mensagem..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
          required
        />
        <p className="text-xs text-gray-500">
          Dica: Você pode usar variáveis como {"{{nome}}"} ao criar mensagens para contatos.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {template ? "Atualizar" : "Criar Template"}
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
