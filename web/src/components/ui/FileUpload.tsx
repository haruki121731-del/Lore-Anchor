'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileImage, FileAudio, FileVideo, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

const ACCEPTED_TYPES = {
  image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/flac'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
};

const ALL_ACCEPTED = [...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.audio, ...ACCEPTED_TYPES.video];

export default function FileUpload({
  onFileSelect,
  accept = ALL_ACCEPTED.join(','),
  maxSize = 500 * 1024 * 1024, // 500MB default
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-12 h-12 text-blue-500" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-12 h-12 text-purple-500" />;
    if (type.startsWith('video/')) return <FileVideo className="w-12 h-12 text-green-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const validateFile = (file: File): string | null => {
    if (!ALL_ACCEPTED.includes(file.type)) {
      return '対応していないファイル形式です。PNG, JPG, GIF, WEBP, MP3, WAV, FLAC, MP4, MOV, WEBM に対応しています。';
    }
    if (file.size > maxSize) {
      return `ファイルサイズが大きすぎます。最大 ${Math.round(maxSize / 1024 / 1024)}MB まで対応しています。`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  }, [maxSize, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            ファイルをドラッグ&ドロップ
          </p>
          <p className="text-sm text-gray-500 mb-4">または</p>
          <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
            ファイルを選択
          </span>
          <p className="text-xs text-gray-400 mt-4">
            対応形式: PNG, JPG, GIF, WEBP, MP3, WAV, FLAC, MP4, MOV, WEBM
            <br />
            最大サイズ: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
                {getFileIcon(selectedFile.type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
