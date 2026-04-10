type IconProps = {
  className?: string;
};

export function DashboardIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 13h7V4H4zm9 7h7v-9h-7zM4 20h7v-5H4zm9-11h7V4h-7z" fill="currentColor" />
    </svg>
  );
}

export function VehicleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6.5 7.5 8 4h8l1.5 3.5M4 16V11l1.4-2.7A2 2 0 0 1 7.2 7h9.6a2 2 0 0 1 1.8 1.3L20 11v5M6 16h.01M18 16h.01M6 19v-1.5M18 19v-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CostIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v18M16.5 7.5c0-1.66-2.02-3-4.5-3s-4.5 1.34-4.5 3 2.02 3 4.5 3 4.5 1.34 4.5 3-2.02 3-4.5 3-4.5-1.34-4.5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReminderIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 17H9m7-10V5a3 3 0 0 0-6 0v2m8 0H6l-1 11h14L18 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExportIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9.6 4.2.4 1.9a6.9 6.9 0 0 1 2 0l.4-1.9 2.4.9-.8 1.8c.58.43 1.1.95 1.54 1.54l1.76-.76.95 2.38-1.9.4a6.9 6.9 0 0 1 0 2l1.9.4-.95 2.38-1.76-.76a6.9 6.9 0 0 1-1.54 1.54l.8 1.8-2.4.9-.4-1.9a6.9 6.9 0 0 1-2 0l-.4 1.9-2.4-.9.8-1.8a6.9 6.9 0 0 1-1.54-1.54l-1.76.76-.95-2.38 1.9-.4a6.9 6.9 0 0 1 0-2l-1.9-.4.95-2.38 1.76.76c.43-.58.95-1.1 1.54-1.54l-.8-1.8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExpandIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HelpIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.87.8c0 1.67-2.5 2.3-2.5 3.7M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhotoIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2l1.1-1.2c.38-.4.91-.63 1.46-.63h1.86c.55 0 1.08.23 1.46.63L15.5 5h2A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}