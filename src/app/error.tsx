"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-3xl font-semibold mb-4 text-destructive">Algo deu errado!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
      </p>
      <Button
        onClick={() => reset()}
        size="lg"
      >
        Tentar Novamente
      </Button>
    </div>
  );
}
