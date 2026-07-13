"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export default function ActionMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      if (!triggerRef.current || !menuRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      let top = rect.bottom + window.scrollY + 4;
      let left = rect.right + window.scrollX - menuRect.width;

      // Flip upwards if not enough space below
      if (top + menuRect.height > window.scrollY + window.innerHeight) {
        top = rect.top + window.scrollY - menuRect.height - 4;
      }
      
      // Ensure it doesn't go off the left edge
      if (left < window.scrollX + 8) {
        left = window.scrollX + 8;
      }

      setPosition({ top, left });
    }

    // Small delay to ensure the menu is rendered before calculating dimensions
    setTimeout(updatePosition, 0);
    
    // Add scroll listener with capture phase to detect scrolls in any scrollable container
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) && 
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button 
        ref={triggerRef} 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }} 
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          ref={menuRef} 
          className="absolute z-[9999] min-w-[140px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-1 overflow-hidden"
          style={{ 
            top: position.top, 
            left: position.left, 
            opacity: position.top ? 1 : 0, 
            pointerEvents: position.top ? 'auto' : 'none' 
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
