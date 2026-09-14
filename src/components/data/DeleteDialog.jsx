import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  schema,
  record,
  loading = false,
}) => {
  if (!isOpen || !record) return null;

  const recordName =
    record.Title ||
    record.Name ||
    record.Playlist_Name ||
    record.Podcast_Title ||
    record.Episode_Title ||
    `${record.First_Name || ''} ${record.Last_Name || ''}`.trim() ||
    record[schema.pk] ||
    'this record';

  const pkValue = schema.isCompositePk
    ? schema.pkFields.map((f) => record[f]).join(' / ')
    : record[schema.pk];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${schema.singularLabel || schema.label}?`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            Permanently Delete
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-full bg-[#e2665f]/10 text-[#e2665f] shrink-0 border border-[#e2665f]/20">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-xs">
          <p className="text-[#f1eee6] font-medium leading-relaxed">
            Are you sure you want to delete <strong className="text-[#e8a33d] font-semibold">"{recordName}"</strong>?
          </p>
          <p className="text-[#9aa0ae] text-[11px] leading-relaxed">
            This action will execute a <code className="font-mono text-[#e2665f]">DELETE FROM {schema.sqlTable}</code> statement. Any dependent foreign key rows in other tables may be restricted or cascaded.
          </p>
          {pkValue && (
            <div className="p-2 bg-black/40 border border-white/10 rounded font-mono text-[11px] text-[#9aa0ae]">
              Identifier: <span className="text-[#f1eee6]">{pkValue}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
