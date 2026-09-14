import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'No records found',
  description = 'There are no items matching your criteria in the database.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-white/10 rounded-md bg-[#111319]/40 my-4">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e8a33d] mb-4">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-[#f1eee6] mb-1.5">{title}</h4>
      <p className="text-xs text-[#9aa0ae] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" icon={Plus}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
