import React from 'react';
import { Camera } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (files: FileList) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onImageUpload(files);
    }
  };

  return (
    <div className="mt-4">
      <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
        Upload Images
      </label>
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Camera className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        <input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
      </label>
    </div>
  );
};

export default ImageUpload;