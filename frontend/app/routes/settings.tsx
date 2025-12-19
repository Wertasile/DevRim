import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '~/context/userContext';
import Sidebar from '~/components/Sidebar';
import updateUser from '~/apiCalls/user/updateUser';
import FetchOwnDetails from '~/apiCalls/user/fetchOwnDetails';
import { Save, User, Mail, Image as ImageIcon, FileText, Briefcase, Upload, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    given_name: '',
    family_name: '',
    picture: '',
    byline: '',
    about: '',
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await FetchOwnDetails();
        setFormData({
          name: userData.name || '',
          given_name: userData.given_name || '',
          family_name: userData.family_name || '',
          picture: userData.picture || '',
          byline: userData.byline || '',
          about: userData.about || '',
        });
        // Set preview URL if picture exists
        if (userData.picture) {
          setPreviewUrl(userData.picture);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setErrorMessage('Failed to load user data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // Upload profile picture function
  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `profile-pictures/${user?._id || 'user'}-${timestamp}.${fileExtension}`;
      
      // Get presigned URL
      const presignUrl = `${API_URL}/s3/profile-picture-upload?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`;
      
      const res = await fetch(presignUrl, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to get presigned URL:', res.status, errorText);
        throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      const { uploadUrl, fileUrl } = data;
      
      if (!uploadUrl) {
        throw new Error('No upload URL received from server');
      }

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => 'Unknown error');
        console.error('S3 upload failed:', uploadRes.status, errorText);
        throw new Error(`Failed to upload picture to S3: ${uploadRes.status} ${errorText}`);
      }

      return fileUrl;
      
    } catch (error) {
      console.error('Picture upload failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setErrorMessage('');
    setSuccessMessage('');

    // Upload file
    setIsUploading(true);
    try {
      const fileUrl = await uploadProfilePicture(file);
      setFormData(prev => ({ ...prev, picture: fileUrl }));
      setPreviewUrl(fileUrl); // Update preview with uploaded URL
      setSuccessMessage('Profile picture uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      setPreviewUrl(formData.picture); // Revert to previous picture
    } finally {
      setIsUploading(false);
      // Clean up local preview URL
      if (localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    }
  };

  // Handle remove picture
  const handleRemovePicture = () => {
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, picture: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await updateUser(formData);
      
      // Update user context with new data
      if (user) {
        setUser({
          ...user,
          ...formData,
        });
      }

      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#0a1118]">
      <div className="flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]">
        {/* Left Sidebar Skeleton */}
        <Sidebar />

        {/* Main Content Skeleton */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-9 w-48 skeleton rounded-lg"></div>
            <div className="h-5 w-96 skeleton rounded-lg"></div>
          </div>

          {/* Form Sections Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Personal Information Section Skeleton */}
            <div className="bg-[#111a29] border border-[#1f2735] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 skeleton rounded"></div>
                <div className="h-6 w-48 skeleton rounded-lg"></div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Email Field Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-32 skeleton rounded"></div>
                  <div className="h-10 w-full bg-[#0a1118] border border-[#353535] rounded-lg skeleton"></div>
                  <div className="h-3 w-80 skeleton rounded"></div>
                </div>

                {/* Name Fields Skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-4 w-24 skeleton rounded"></div>
                    <div className="h-10 w-full bg-[#111] border border-[#353535] rounded-lg skeleton"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Section Skeleton */}
            <div className="bg-[#111a29] border border-[#1f2735] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 skeleton rounded"></div>
                <div className="h-6 w-32 skeleton rounded-lg"></div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Profile Picture Skeleton */}
                <div className="flex flex-col gap-4">
                  <div className="h-4 w-32 skeleton rounded"></div>
                  <div className="w-32 h-32 rounded-full skeleton"></div>
                  <div className="h-10 w-40 bg-[#111] border border-[#353535] rounded-lg skeleton"></div>
                  <div className="h-3 w-64 skeleton rounded"></div>
                </div>

                {/* Byline Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-20 skeleton rounded"></div>
                  <div className="h-10 w-full bg-[#111] border border-[#353535] rounded-lg skeleton"></div>
                  <div className="h-3 w-24 skeleton rounded"></div>
                </div>

                {/* About Skeleton */}
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-16 skeleton rounded"></div>
                  <div className="h-32 w-full bg-[#111] border border-[#353535] rounded-lg skeleton"></div>
                  <div className="h-3 w-24 skeleton rounded"></div>
                </div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex justify-end gap-4">
              <div className="h-10 w-40 skeleton rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1118] flex items-center justify-center">
        <div className="text-white text-lg">Please log in to access settings.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1118]">
      <div className="flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-[#979797]">Manage your personal information and preferences</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Personal Information Section */}
            <div className="bg-[#111a29] border border-[#1f2735] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User size={20} className="text-[#5D64F4]" />
                <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              </div>

              <div className="flex flex-col gap-5">
                {/* Email (Read-only) */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-white text-sm font-medium flex items-center gap-2">
                    <Mail size={16} className="text-[#979797]" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-[#0a1118] text-[#979797] border border-[#353535] rounded-lg px-4 py-2 cursor-not-allowed"
                  />
                  <p className="text-[#979797] text-xs">Email cannot be changed as you're signed in with Google OAuth</p>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-white text-sm font-medium flex items-center gap-2">
                    <User size={16} className="text-[#979797]" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="bg-[#111] text-white border border-[#353535] rounded-lg px-4 py-2 focus:outline-none focus:border-[#5D64F4] transition-colors"
                  />
                </div>

                {/* Given Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="given_name" className="text-white text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="given_name"
                    name="given_name"
                    type="text"
                    value={formData.given_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="bg-[#111] text-white border border-[#353535] rounded-lg px-4 py-2 focus:outline-none focus:border-[#5D64F4] transition-colors"
                  />
                </div>

                {/* Family Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="family_name" className="text-white text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="family_name"
                    name="family_name"
                    type="text"
                    value={formData.family_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="bg-[#111] text-white border border-[#353535] rounded-lg px-4 py-2 focus:outline-none focus:border-[#5D64F4] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-[#111a29] border border-[#1f2735] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon size={20} className="text-[#5D64F4]" />
                <h2 className="text-xl font-semibold text-white">Profile</h2>
              </div>

              <div className="flex flex-col gap-5">
                {/* Profile Picture Upload */}
                <div className="flex flex-col gap-4">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#979797]" />
                    Profile Picture
                  </label>
                  
                  {/* Preview */}
                  {previewUrl && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full border-2 border-[#353535] object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemovePicture}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-colors"
                        title="Remove picture"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="picture-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 border border-[#353535] rounded-lg cursor-pointer transition-colors ${
                        isUploading
                          ? 'bg-[#353535] text-[#979797] cursor-not-allowed w-fit'
                          : 'bg-[#111] text-white hover:bg-[#1a1a1a] hover:border-[#5D64F4] w-fit'
                      }`}
                    >
                      <Upload size={16} />
                      <span>{isUploading ? 'Uploading...' : previewUrl ? 'Change Picture' : 'Upload Picture'}</span>
                    </label>
                    <p className="text-[#979797] text-xs">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>

                {/* Byline */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="byline" className="text-white text-sm font-medium flex items-center gap-2">
                    <Briefcase size={16} className="text-[#979797]" />
                    Byline
                  </label>
                  <input
                    id="byline"
                    name="byline"
                    type="text"
                    value={formData.byline}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer at Company"
                    maxLength={100}
                    className="bg-[#111] text-white border border-[#353535] rounded-lg px-4 py-2 focus:outline-none focus:border-[#5D64F4] transition-colors"
                  />
                  <p className="text-[#979797] text-xs">{formData.byline.length}/100 characters</p>
                </div>

                {/* About */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="about" className="text-white text-sm font-medium flex items-center gap-2">
                    <FileText size={16} className="text-[#979797]" />
                    About
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={6}
                    maxLength={500}
                    className="bg-[#111] text-white border border-[#353535] rounded-lg px-4 py-2 focus:outline-none focus:border-[#5D64F4] transition-colors resize-none"
                  />
                  <p className="text-[#979797] text-xs">{formData.about.length}/500 characters</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`primary-btn flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={16} />
                <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
