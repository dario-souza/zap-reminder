"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { messagesApi } from "@/lib/api";
import { RefreshCw, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function QRCodeModal({ open, onOpenChange, onConnected }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await messagesApi.getQRCode();
      setQrCode(data.qrCode);
      setStatus(data.status);
      
      // Se já estiver conectado
      if (data.status === "open" || data.status === "connected") {
        onConnected();
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao obter QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQRCode();
    }
  }, [open]);

  // Polling para verificar conexão
  useEffect(() => {
    if (!open || status === "open" || status === "connected") return;

    const interval = setInterval(async () => {
      try {
        const statusData = await messagesApi.checkWhatsAppStatus();
        if (statusData.connected) {
          onConnected();
          onOpenChange(false);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, status, onConnected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code abaixo com seu WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 text-sm">{error}</p>
              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-2" />
              <p className="text-gray-600">Gerando QR Code...</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                {/* QR Code como imagem base64 ou código */}
                {qrCode.startsWith('data:image') ? (
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                    <p className="text-xs text-gray-500 text-center px-4">
                      QR Code disponível. Aguarde ou atualize a página.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Como conectar:</strong>
                </p>
                <ol className="text-sm text-gray-500 text-left space-y-1 list-decimal list-inside">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em &quot;Mais opções&quot; ou &quot;Configurações&quot;</li>
                  <li>Selecione &quot;Aparelhos conectados&quot;</li>
                  <li>Toque em &quot;Conectar um aparelho&quot;</li>
                  <li>Aponte a câmera para o QR Code acima</li>
                </ol>
              </div>

              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-4"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-600">Não foi possível gerar o QR Code</p>
              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
