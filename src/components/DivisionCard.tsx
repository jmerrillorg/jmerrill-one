import Link from 'next/link';

type Props = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  color: 'publishing' | 'financial' | 'foundation' | 'productions';
};

export default function DivisionCard({
  title,
  subtitle,
  description,
  href,
  color,
}: Props) {
  return (
    <Link
      href={href}
      className={[
        'group rounded-xl border p-6 transition',
        'bg-transparent backdrop-blur-sm',
        'hover:shadow-lg',
        'flex flex-col gap-3',
        `border-${color}/30 hover:border-${color}`,
      ].join(' ')}
    >
      {/* Header (centered) */}
      <div className="text-center">
        <h3 className={`text-lg font-semibold text-${color}`}>
          {title}
        </h3>

        <p className="mt-1 text-xs text-secondary">
          {subtitle}
        </p>
      </div>

      {/* Description (left-aligned for readability) */}
      <p className="mt-2 text-sm text-secondary text-left">
        {description}
      </p>

      {/* CTA (centered) */}
      <span
        className={[
          'mt-4 inline-block text-sm font-medium text-center',
          `text-${color} group-hover:underline`,
        ].join(' ')}
      >
        Visit site →
      </span>
    </Link>
  );
}