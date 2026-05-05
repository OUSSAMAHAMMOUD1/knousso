import React from 'react';

export default function LoadingSpinner({ size = 'md' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex justify-center items-center py-12">
      <div className={`${s} border-2 border-dark-500 border-t-gold-500 rounded-full animate-spin`} />
    </div>
  );
}
