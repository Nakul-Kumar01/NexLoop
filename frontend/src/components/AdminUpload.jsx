import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { motion } from 'framer-motion';

export default function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [localDuration, setLocalDuration] = useState(null);
  const videoRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  // create preview URL for selected file
  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl(null);
      setLocalDuration(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setLocalPreviewUrl(null);
    };
  }, [selectedFile]);

  // when local video metadata loads, capture duration
  const onLocalVideoLoaded = () => {
    try {
      const d = Math.floor(videoRef.current?.duration || 0);
      setLocalDuration(d);
    } catch (e) {
      setLocalDuration(null);
    }
  };

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();  // we use FormData when we hv multiple file types
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
      setLocalPreviewUrl(null);
      setLocalDuration(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#061021]">
      {/* floating subtle decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-[#071428] to-[#08122a]"></div>
        <div className="absolute -right-24 bottom-10 w-72 h-72 rounded-full blur-2xl opacity-25 bg-yellow-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-2xl"
      >
        <div className="rounded-2xl border border-[#122033] bg-gradient-to-br from-[#071428]/60 to-[#08122a]/40 backdrop-blur-md p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Upload Video Solution</h1>
              <p className="text-sm text-slate-300 mt-1">Attach a demo or explanation video for this problem. Max 100MB.</p>
            </div>

            
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Custom Dropzone */}
            <label
              htmlFor="videoFile"
              className={`relative flex items-center gap-4 cursor-pointer rounded-xl border-2 transition-all p-4 md:p-6
                ${errors.videoFile ? 'border-red-400 bg-[#2b3640]' : 'border-dashed border-[#1b2a34] bg-[#071428]/30'}
                hover:scale-[1.01]`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-[#061021]/40 ring-1 ring-yellow-500/30">
                {/* upload SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v12" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 7l4-4 4 4" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 21H4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Drag & drop a file here, or click to select</div>
                    <div className="text-xs text-slate-300 mt-1">Accepted: MP4, MOV, WEBM · Max: 100MB</div>
                  </div>

                  <div className="text-xs text-slate-300">{selectedFile ? formatFileSize(selectedFile.size) : ''}</div>
                </div>

                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  {...register('videoFile', {
                    required: 'Please select a video file',
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) return 'Please select a video file';
                        const file = files[0];
                        return file.type.startsWith('video/') || 'Please select a valid video file';
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const file = files[0];
                        const maxSize = 100 * 1024 * 1024;
                        return file.size <= maxSize || 'File size must be less than 100MB';
                      },
                    },
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </div>
            </label>

            {errors.videoFile && (
              <div className="text-sm text-red-400">{errors.videoFile.message}</div>
            )}

            {/* Preview + Info */}
            {selectedFile && localPreviewUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="col-span-1 rounded-lg overflow-hidden border border-[#142834] bg-[#061021] p-1">
                  <video
                    ref={videoRef}
                    src={localPreviewUrl}
                    onLoadedMetadata={onLocalVideoLoaded}
                    className="w-full h-40 object-cover rounded-md"
                    controls
                  />
                </div>

                <div className="col-span-2 bg-[#071428]/40 rounded-lg p-4 border border-[#122033]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-300">{selectedFile.name}</div>
                      <div className="text-xs text-slate-400 mt-1">Size: {formatFileSize(selectedFile.size)}</div>
                      <div className="text-xs text-slate-400 mt-1">Duration: {localDuration ? formatDuration(localDuration) : 'Detecting...'}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-300">Type</div>
                      <div className="text-sm font-medium text-yellow-500">{selectedFile.type || 'video/*'}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">Tip: Use <span className="font-medium text-white">1920x1080</span> or lower for faster uploads.</div>
                </div>
              </motion.div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                  <div>Uploading...</div>
                  <div>{uploadProgress}%</div>
                </div>

                <div className="w-full h-3 rounded-full bg-[#0f1724] overflow-hidden border border-[#122033]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'linear' }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg,#F59E0B,#FACC15)' }}
                  />
                </div>
              </div>
            )}

            {errors.root && (
              <div className="rounded-md border border-red-600 bg-red-900/30 p-3 text-sm text-red-200">{errors.root.message}</div>
            )}

            {uploadedVideo && (
              <div className="rounded-lg border border-green-700 bg-green-900/10 p-3 text-sm text-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Upload Successful!</div>
                    <div className="text-xs text-slate-300 mt-1">Duration: {formatDuration(uploadedVideo.duration)}</div>
                    <div className="text-xs text-slate-300">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</div>
                  </div>
                  
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setLocalPreviewUrl(null);
                  setLocalDuration(null);
                }}
                disabled={uploading}
                className="btn btn-ghost rounded-full px-4 py-2 text-sm text-slate-300 border border-[#1b2a34]"
              >
                Reset
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={uploading}
                className={`rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition-all ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                style={{
                  background: 'linear-gradient(90deg,#F59E0B,#FCD34D)',
                  color: '#071428',
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </motion.button>
            </div>
          </form>

          <div className="mt-5 text-xs text-slate-400">Powered by Cloudinary · Make sure your backend signature endpoint is reachable.</div>
        </div>
      </motion.div>
    </div>
  );
}
