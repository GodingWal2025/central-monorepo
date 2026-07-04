import type { ReactNode } from "react";
import type { JobRole } from "../types";
import { ratingMeta, getRoleColor } from "../types";
import { initials } from "../lib/utils";

// ============ AVATAR ============
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const Avatar = ({
  firstName,
  lastName,
  jobRole,
  size = 'md',
}: {
  firstName: string;
  lastName: string;
  jobRole: JobRole;
  size?: AvatarSize;
}) => {
  const sizes: Record<AvatarSize, string> = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 md:w-24 md:h-24 text-xl md:text-2xl',
  };
  return (
    <div className={`${sizes[size]} ${getRoleColor(jobRole).bg} rounded-full flex items-center justify-center text-white font-medium tracking-wide flex-shrink-0`}>
      {initials(firstName, lastName)}
    </div>
  );
};

// ============ RATING DOTS ============
export const RatingDots = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) => {
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const meta = ratingMeta[value];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map(n => (
        <div key={n} className={`${dotSize} rounded-full transition-all`}
          style={{ backgroundColor: n <= value ? meta?.color : '#E7E5E4' }} />
      ))}
    </div>
  );
};

// ============ RATING BADGE ============
export const RatingBadge = ({ value }: { value: number }) => {
  const meta = ratingMeta[value];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium tracking-wide whitespace-nowrap"
      style={{ color: meta.color, backgroundColor: meta.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
};

// ============ PILLS (segmented control) ============
export const Pills = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex items-center bg-stone-100 rounded-full p-1 gap-0.5 overflow-x-auto scrollbar-hide flex-nowrap min-w-0">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-2 text-xs font-medium rounded-full transition whitespace-nowrap flex-shrink-0 ${value === opt ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900 active:text-stone-900'}`}>
        {opt}
      </button>
    ))}
  </div>
);

// ============ SECTION HEAD ============
export const SectionHead = ({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8 gap-4">
    <div>
      {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2 font-medium">{eyebrow}</p>}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-900 tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-stone-600 mt-2 text-sm max-w-xl">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ============ FIELD WRAPPER ============
export const Field = ({
  label,
  required,
  optional,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string | null;
  children: ReactNode;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
      <label className="text-xs uppercase tracking-wider font-medium text-stone-700">
        {label} {required && <span className="text-rose-600">*</span>}
        {optional && <span className="text-stone-400 normal-case tracking-normal"> · optional</span>}
      </label>
      {hint && <span className="text-xs text-stone-500 italic">{hint}</span>}
    </div>
    {children}
  </div>
);

// ============ STAT (used in employee cards) ============
export const Stat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'emerald' | null;
}) => {
  const colors = { emerald: 'text-emerald-700' };
  return (
    <div>
      <div className="text-[10px] md:text-xs text-stone-500 mb-0.5">{label}</div>
      <div className={`text-base md:text-lg font-medium ${accent ? colors[accent] : 'text-stone-900'}`}>{value}</div>
    </div>
  );
};
