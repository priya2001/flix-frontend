import React from 'react';

export default function Loader({ text = 'Loading...', size = 40 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex items-center gap-3">
        <div
          style={{ width: size, height: size }}
          className="border-4 border-t-white border-gray-300 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span className="text-white">{text}</span>
      </div>
    </div>
  );
}
