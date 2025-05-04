import { useState } from 'react';

interface UserAvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export default function UserAvatar({ src, alt, className = 'w-8 h-8 rounded-full' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Default fallback avatar (using a simple text-based avatar with user's initials)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Function to ensure avatar URL is properly formatted
  const getAvatarUrl = (avatarSrc: string) => {
    // If it's already a full URL (starts with http:// or https://), use it as is
    if (avatarSrc.startsWith('http://') || avatarSrc.startsWith('https://')) {
      return avatarSrc;
    }
    
    // If it's a relative path, prefix it with the API base URL
    const baseUrl = import.meta.env.VITE_API_PATH || '';
    
    // Ensure we don't have double slashes when joining paths
    if (avatarSrc.startsWith('/') && baseUrl.endsWith('/')) {
      return `${baseUrl}${avatarSrc.substring(1)}`;
    } else if (!avatarSrc.startsWith('/') && !baseUrl.endsWith('/')) {
      return `${baseUrl}/${avatarSrc}`;
    } else {
      return `${baseUrl}${avatarSrc}`;
    }
  };

  if (!src || imageError) {
    // Render a fallback avatar with user's initials
    return (
      <div 
        className={`flex items-center justify-center bg-gray-300 text-gray-700 ${className}`}
        title={alt}
      >
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <img
      src={getAvatarUrl(src)}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}