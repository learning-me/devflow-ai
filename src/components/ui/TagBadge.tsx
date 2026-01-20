import React from 'react';
import { Tag } from '@/types';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md';
}

const tagConfig: Record<Tag, { label: string; className: string }> = {
  frontend: { label: 'Frontend', className: 'tag-frontend' },
  backend: { label: 'Backend', className: 'tag-backend' },
  dsa: { label: 'DSA', className: 'tag-dsa' },
  devops: { label: 'DevOps', className: 'tag-default' },
  'system-design': { label: 'System Design', className: 'tag-default' },
  other: { label: 'Other', className: 'tag-default' },
};

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'sm' }) => {
  const config = tagConfig[tag];

  return (
    <span
      className={cn(
        'tag',
        config.className,
        size === 'md' && 'px-3 py-1.5 text-sm'
      )}
    >
      {config.label}
    </span>
  );
};
