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
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}