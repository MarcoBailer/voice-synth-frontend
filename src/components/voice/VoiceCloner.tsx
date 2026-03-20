'use client';

import { useState, useRef, useCallback } from 'react';
import { useVoice } from '@/contexts/VoiceContext';
import { voiceService } from '@/services/voiceService';
import { 
  Upload, 
  X, 
  FileAudio, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { formatFileSize, isValidAudioFile } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface VoiceClonerProps {
  onSuccess?: () => void;
}

export function VoiceCloner({ onSuccess }: VoiceClonerProps) {
  const { addCustomVoice } = useVoice();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      if (!isValidAudioFile(file)) {
        errors.push(`${file.name}: Invalid format. Use WAV, MP3, or OGG.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Max 10MB.`);
        return;
      }
      if (files.length + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed.`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }, [files.length]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a voice name');
      return;
    }

    if (files.length === 0) {
      toast.error('Please add at least one audio sample');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const newVoice = await voiceService.cloneVoice(name, language, files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      addCustomVoice(newVoice);
      toast.success('Voice cloned successfully!');
      
      // Reset form
      setName('');
      setLanguage('en');
      setFiles([]);
      setUploadProgress(0);
      
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Clone error:', error);
      
      let message = 'Failed to clone voice. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        message = axiosError.response?.data?.detail || message;
      }
      
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Clone a Voice</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Upload audio samples to create a custom voice clone. For best results, use clear recordings 
        with minimal background noise.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Voice Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Voice Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Custom Voice"
            className="input"
            disabled={isUploading}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input"
            disabled={isUploading}
          >
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Audio Samples ({files.length}/{MAX_FILES})
          </label>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
            
            <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium">
              Drag & drop audio files here
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              or click to browse • WAV, MP3, OGG • Max 10MB each
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]"
                >
                  <FileAudio className="w-5 h-5 text-[var(--primary)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {files.length < MAX_FILES && !isUploading && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 w-full p-3 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add more samples</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cloning voice...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || files.length === 0 || !name.trim()}
          className="btn btn-primary w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Clone Voice
            </>
          )}
        </button>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--warning)] shrink-0" />
            <div className="text-sm text-[var(--muted-foreground)]">
              <p className="font-medium text-[var(--foreground)] mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use 3-5 audio samples of 10-30 seconds each</li>
                <li>Record in a quiet environment</li>
                <li>Speak clearly with consistent volume</li>
                <li>Avoid music or background sounds</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default VoiceCloner;
