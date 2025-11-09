import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-300">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          <span>made with</span>
          <span aria-hidden="true" className="text-red-600">❤</span>
          <span>by Group 30, MCA 5th Semester</span>
        </p>
        <p className="mt-1">2025</p>
      </div>
    </footer>
  );
}
