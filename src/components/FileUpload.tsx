import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { filesAPI } from '../services/api';
import {
    DocumentIcon,
    PhotoIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    EyeIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    extractedData?: any;
    error?: string;
}

interface FileUploadProps {
    onFilesUploaded: (files: UploadedFile[]) => void;
    onExtractedData: (data: any) => void;
    acceptedFileTypes?: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif'];
        'application/pdf': ['.pdf'];
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'];
    };
    maxFiles?: number;
    maxSize?: number; // in bytes
    enableOCR?: boolean;
    enableAISuggestions?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesUploaded,
    onExtractedData,
    acceptedFileTypes = {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    enableOCR = true,
    enableAISuggestions = true,
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const uploadMutation = useMutation({
        mutationFn: (file: File) => filesAPI.uploadFile(file),
        onSuccess: (response, file) => {
            const uploadedFile: UploadedFile = {
                id: response.id,
                name: file.name,
                size: file.size,
                type: file.type,
                url: response.url,
                status: 'completed',
            };

            setUploadedFiles(prev => {
                const updated = prev.map(f =>
                    f.name === file.name ? uploadedFile : f
                );
                onFilesUploaded(updated);
                return updated;
            });
        },
        onError: (error, file) => {
            setUploadedFiles(prev =>
                prev.map(f =>
                    f.name === file.name
                        ? { ...f, status: 'error', error: (error as Error).message }
                        : f
                )
            );
        },
    });

    const ocrMutation = useMutation({
        mutationFn: (fileId: string) => filesAPI.processOCR(fileId),
        onSuccess: (data, fileId) => {
            setUploadedFiles(prev =>
                prev.map(f => {
                    if (f.id === fileId) {
                        const updated = { ...f, extractedData: data, status: 'completed' as const };
                        if (enableAISuggestions && data) {
                            onExtractedData(data);
                        }
                        return updated;
                    }
                    return f;
                })
            );
        },
        onError: (error, fileId) => {
            setUploadedFiles(prev =>
                prev.map(f =>
                    f.id === fileId
                        ? { ...f, status: 'error', error: (error as Error).message }
                        : f
                )
            );
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
            id: `temp-${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: '',
            status: 'uploading',
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);

        acceptedFiles.forEach(file => {
            uploadMutation.mutate(file);
        });
    }, [uploadMutation]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles,
        maxSize,
        multiple: true,
    });

    const processOCR = (fileId: string) => {
        setUploadedFiles(prev =>
            prev.map(f =>
                f.id === fileId ? { ...f, status: 'processing' } : f
            )
        );
        ocrMutation.mutate(fileId);
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            onFilesUploaded(updated);
            return updated;
        });
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <PhotoIcon className="w-6 h-6 text-blue-500" />;
        }
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    };

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
            case 'processing':
                return (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                );
            case 'completed':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
            >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Supports images, PDF, and DOCX files up to {formatFileSize(maxSize)}
                    </p>
                </div>
            </div>

            {/* File Rejections */}
            {fileRejections.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                        Some files were rejected:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        {fileRejections.map(({ file, errors }) => (
                            <li key={file.name}>
                                {file.name}: {errors.map(e => e.message).join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
                    <div className="space-y-2">
                        {uploadedFiles.map(file => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(file.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                            {file.status === 'processing' && ' • Processing...'}
                                            {file.status === 'uploading' && ' • Uploading...'}
                                            {file.error && ` • Error: ${file.error}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(file.status)}

                                    {/* OCR Button */}
                                    {enableOCR &&
                                        file.status === 'completed' &&
                                        (file.type.startsWith('image/') || file.type === 'application/pdf') && (
                                            <button
                                                onClick={() => processOCR(file.id)}
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                title="Extract text with OCR"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                        title="Remove file"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
