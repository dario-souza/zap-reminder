"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Smartphone, AlertCircle } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
  getQRCode: () => Promise<{ qr?: string; connected?: boolean; status?: string; error?: string }>;
  checkStatus: () => Promise<void>;
}

export function QRCodeModal({ open, onOpenChange, onConnected, getQRCode, checkStatus }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getQRCode();
      
      if (result.connected) {
        onConnected();
        onOpenChange(false);
        return;
      }

      if (result.qr) {
        setQrCode(result.qr);
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('Aguarde... O QR Code está sendo gerado.');
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar WhatsApp");
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
    if (!open || !qrCode) return;

    const interval = setInterval(async () => {
      try {
        await checkStatus();
        // Se checkStatus atualizou o estado, o componente pai vai fechar o modal
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [open, qrCode, checkStatus]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {error ? (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchQRCode} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Tentar novamente
              </Button>
            </div>
          ) : isLoading && !qrCode ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-3" />
              <p className="text-gray-600">Gerando QR Code...</p>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                <img 
                  src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp" 
                  className="w-64 h-64"
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                Escaneie o QR Code acima com seu WhatsApp
              </p>
              
              <Button 
                onClick={fetchQRCode} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar QR Code
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Aguardando...</p>
              <Button onClick={fetchQRCode} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Obter QR Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
