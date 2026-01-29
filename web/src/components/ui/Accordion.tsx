'use client';

import { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: string[];
  allowMultiple?: boolean;
}

export function Accordion({
  children,
  className = '',
  defaultOpen = [],
  allowMultiple = true,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`divide-y divide-gray-200 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ id, children, className = '' }: AccordionItemProps) {
  return (
    <div className={className} data-accordion-item={id}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ id, children, className = '' }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const { openItems, toggleItem } = context;
  const isOpen = openItems.has(id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(id)}
      className={`flex w-full items-center justify-between py-4 text-left transition-colors hover:bg-gray-50 ${className}`}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
}

interface AccordionContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ id, children, className = '' }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const { openItems } = context;
  const isOpen = openItems.has(id);

  if (!isOpen) return null;

  return (
    <div className={`pb-4 ${className}`}>
      {children}
    </div>
  );
}
