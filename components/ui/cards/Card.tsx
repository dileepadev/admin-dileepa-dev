import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-card border border-border relative overflow-hidden group',
  elevated: 'bg-card shadow-lg border border-border relative overflow-hidden group',
  outlined: 'border-2 border-border bg-transparent relative overflow-hidden group',
  ghost: 'bg-transparent',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-500',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:border-accent-blue/30 hover:scale-[1.01] hover:shadow-xl',
        className,
      )}
    >
      {/* Glow Effect */}
      {hover && (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top_right,var(--accent-blue)_0%,transparent_50%)] opacity-[0.05] transition-opacity duration-500 group-hover:opacity-10" />
      )}
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ children, className, as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={cn('text-foreground text-xl font-bold', className)}>{children}</Component>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn('text-muted-foreground', className)}>{children}</p>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
