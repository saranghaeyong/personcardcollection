import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { compressImageToDataUrl, validateImageFile, CompressionResult } from '../utils/imageOptimizer';

interface ImageUploaderProps {
  currentPhotoUrl?: string;
  onImageSelected: (dataUrl: string) => void;
  onImageRemoved: () => void;
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentPhotoUrl,
  onImageSelected,
  onImageRemoved,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setLocalError(null);
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setLocalError(validation.error || 'Invalid image file.');
      return;
    }

    setIsProcessing(true);
    try {
      // Compress and convert to base64 Data URL locally in browser
      const result = await compressImageToDataUrl(file);
      setCompressionInfo(result);
      onImageSelected(result.dataUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error processing image';
      setLocalError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setCompressionInfo(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemoved();
  };

  const previewSource = compressionInfo?.dataUrl || currentPhotoUrl;

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-[#1F2421] mb-1.5">
        Photo <span className="text-[#B91C1C]">*</span>
      </label>

      {previewSource ? (
        /* Image Preview Box */
        <div className="relative bg-[#F4EFEB] rounded-2xl p-4 border border-[#E8E2DA] flex flex-col sm:flex-row items-center gap-4 animate-in fade-in duration-200">
          <div className="relative w-32 aspect-[4/5] rounded-xl overflow-hidden bg-[#E2DBD1] shadow-xs shrink-0">
            <img
              src={previewSource}
              alt="Person portrait preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-grow space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs text-[#529E72] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Portrait ready</span>
            </div>

            {compressionInfo && (
              <p className="text-xs text-[#706A62]">
                Optimized size: {(compressionInfo.compressedSize / 1024).toFixed(0)} KB{' '}
                {compressionInfo.compressionRatio > 0 && (
                  <span className="text-[#529E72]">({compressionInfo.compressionRatio}% smaller)</span>
                )}
              </p>
            )}

            <p className="text-xs text-[#8C847B]">
              Stored locally in browser (no external upload)
            </p>

            {/* Replace / Remove buttons */}
            <div className="flex items-center justify-center sm:justify-start space-x-2 pt-2">
              <button
                type="button"
                id="replace-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium bg-white text-[#1F2421] rounded-lg border border-[#D5CDC4] hover:bg-[#FAF8F5] transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#706A62]" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                id="remove-photo-btn"
                onClick={handleRemove}
                className="px-3 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2]/60 rounded-lg transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          id="photo-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#1F2421] bg-[#F2EDE6]'
              : 'border-[#DCD4C8] hover:border-[#8C847B] bg-[#FFFFFF]'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-2 py-4">
              <RefreshCw className="w-8 h-8 text-[#1F2421] animate-spin" />
              <p className="text-xs font-medium text-[#706A62]">Compressing and preparing portrait...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE4DC] flex items-center justify-center mb-3 text-[#706A62]">
                <Upload className="w-6 h-6" />
              </div>

              <p className="text-sm font-semibold text-[#1F2421] mb-1">
                Click to upload or drag & drop photo
              </p>
              <p className="text-xs text-[#8C847B] mb-2">
                Supported: JPG, JPEG, PNG, WEBP (up to 10MB)
              </p>
              <span className="inline-flex items-center text-[11px] font-medium text-[#706A62] bg-[#F4EFEB] px-2.5 py-0.5 rounded-full">
                <ImageIcon className="w-3 h-3 mr-1" />
                Auto-optimized 4:5 portrait format
              </span>
            </>
          )}
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        id="photo-file-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Validation Errors */}
      {(localError || error) && (
        <p className="mt-1.5 text-xs text-[#B91C1C] flex items-center space-x-1">
          <span>{localError || error}</span>
        </p>
      )}
    </div>
  );
};
