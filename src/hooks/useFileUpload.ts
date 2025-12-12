'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE_MB = 5;

interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  uploading: boolean;
  uploadFile: (file: File, uploadFn: (base64: string) => Promise<{ success: boolean; url?: string; error?: string }>) => Promise<string | null>;
  uploadMultipleFiles: (files: FileList, uploadFn: (base64Array: string[]) => Promise<{ success: boolean; urls?: string[]; error?: string }>) => Promise<string[]>;
}

function validateFileSize(file: File): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    toast.error(`Imagem muito grande (${fileSizeMB.toFixed(1)}MB). Máximo: ${MAX_FILE_SIZE_MB}MB`);
    return false;
  }
  return true;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
  });
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const { onSuccess, onError } = options;

  const uploadFile = useCallback(async (
    file: File,
    uploadFn: (base64: string) => Promise<{ success: boolean; url?: string; error?: string }>
  ): Promise<string | null> => {
    if (!validateFileSize(file)) {
      return null;
    }

    setUploading(true);

    try {
      const base64Data = await fileToBase64(file);

      const base64SizeBytes = (base64Data.length * 3) / 4;
      const base64SizeMB = base64SizeBytes / (1024 * 1024);

      if (base64SizeMB > MAX_FILE_SIZE_MB) {
        toast.error(`Base64 muito grande (${base64SizeMB.toFixed(1)}MB). Máximo: ${MAX_FILE_SIZE_MB}MB`);
        return null;
      }

      const result = await uploadFn(base64Data);

      if (result.success && result.url) {
        toast.success('Imagem enviada com sucesso!');
        onSuccess?.(result.url);
        return result.url;
      }

      const errorMsg = result.error || 'Erro desconhecido';
      toast.error(`Erro ao fazer upload: ${errorMsg}`);
      onError?.(errorMsg);
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      const isPayloadTooLarge = errorMessage.includes('413') || errorMessage.includes('1 MB limit');

      if (isPayloadTooLarge) {
        toast.error('Imagem muito grande! Reduza o tamanho e tente novamente.');
      } else {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  }, [onSuccess, onError]);

  const uploadMultipleFiles = useCallback(async (
    files: FileList,
    uploadFn: (base64Array: string[]) => Promise<{ success: boolean; urls?: string[]; error?: string }>
  ): Promise<string[]> => {
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      const base64Promises = fileArray.map(fileToBase64);
      const base64Array = await Promise.all(base64Promises);

      const result = await uploadFn(base64Array);

      if (result.success && result.urls) {
        toast.success(`${result.urls.length} imagens enviadas com sucesso!`);
        return result.urls;
      }

      const errorMsg = result.error || 'Erro desconhecido';
      toast.error(`Erro ao fazer upload: ${errorMsg}`);
      onError?.(errorMsg);
      return [];
    } catch {
      toast.error('Erro ao fazer upload das imagens');
      return [];
    } finally {
      setUploading(false);
    }
  }, [onError]);

  return {
    uploading,
    uploadFile,
    uploadMultipleFiles,
  };
}
