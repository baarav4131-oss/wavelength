import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { getSchema } from '../data/schema';
import { apiList, apiCreate, apiUpdate, apiDelete } from '../services/api';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable } from '../components/data/DataTable';
import { SearchBar } from '../components/data/SearchBar';
import { FilterBar } from '../components/data/FilterBar';
import { Pagination } from '../components/data/Pagination';
import { RecordDrawer } from '../components/data/RecordDrawer';
import { DeleteDialog } from '../components/data/DeleteDialog';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/useToast';


export const EntityPage = ({ entityKey, onRecordCountChange }) => {
  const schema = getSchema(entityKey);
  const { toast } = useToast();

  const [data, setData] = useState([]);
  const [foreignCache, setForeignCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / Dialog state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data & related foreign table lists
  const loadData = useCallback(async () => {
    if (!schema) return;
    setLoading(true);
    setError(null);
    try {
      const records = await apiList(schema);
      setData(records);
      if (onRecordCountChange) onRecordCountChange(entityKey, records.length);

      // Fetch all referenced FK tables
      const fkCols = schema.columns.filter((c) => c.type === 'fk');
      const cache = {};
      await Promise.all(
        fkCols.map(async (c) => {
          const refSchema = getSchema(c.ref);
          if (refSchema) {
            try {
              cache[c.ref] = await apiList(refSchema);
            } catch {
              cache[c.ref] = [];
            }
          }
        })
      );
      setForeignCache(cache);
    } catch (err) {
      setError(err.message || 'Unable to load records from database');
    } finally {
      setLoading(false);
    }
  }, [schema, entityKey, onRecordCountChange]);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
    setSearchQuery('');
    setFilters({});
  }, [entityKey, loadData]);

  // Handle Filter Change
  const handleFilterChange = (colName, val) => {
    setFilters((prev) => ({ ...prev, [colName]: val }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = schema.columns.some((col) => {
          const val = item[col.name];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // 2. Select Filters
      for (const [key, filterVal] of Object.entries(filters)) {
        if (filterVal) {
          if (String(item[key] || '') !== String(filterVal)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchQuery, filters, schema]);

  // Pagination slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // CRUD Actions
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setIsDrawerOpen(true);
  };

  const handleOpenDelete = (record) => {
    setDeletingRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRecord = async (payload, isEditing, oldRecord) => {
    if (isEditing) {
      const keyRow = schema.isCompositePk
        ? Object.fromEntries(schema.pkFields.map((f) => [f, oldRecord[f]]))
        : { [schema.pk]: oldRecord[schema.pk] };

      await apiUpdate(schema, keyRow, payload);
      toast(`${schema.singularLabel || 'Record'} updated successfully`);
    } else {
      await apiCreate(schema, payload);
      toast(`New ${schema.singularLabel || 'Record'} created successfully`);
    }
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      const keyRow = schema.isCompositePk
        ? Object.fromEntries(schema.pkFields.map((f) => [f, deletingRecord[f]]))
        : { [schema.pk]: deletingRecord[schema.pk] };

      await apiDelete(schema, keyRow);
      toast(`${schema.singularLabel || 'Record'} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDeletingRecord(null);
      await loadData();
    } catch (err) {
      toast(err.message || 'Failed to delete record', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = schema.columns.map((c) => c.name);
    const rows = filteredData.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${schema.sqlTable}_export.csv`);
    link.click();
    toast(`Exported ${filteredData.length} records to CSV`);
  };

  if (!schema) {
    return (
      <div className="p-8 text-center text-xs text-[#9aa0ae]">
        Unknown entity schema: {entityKey}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title={schema.label}
        subtitle={schema.description}
        badge={
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#e8a33d]">
            {data.length} total rows
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              title="Export filtered records to CSV"
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={loadData}
              loading={loading}
              title="Refresh table data"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Add {schema.singularLabel || 'Record'}
            </Button>
          </div>
        }
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-[#111319] border border-white/[0.07]">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${schema.label.toLowerCase()} by attributes…`}
          className="w-full sm:w-72"
        />

        <FilterBar
          schema={schema}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          foreignCache={foreignCache}
        />
      </div>

      {/* Main Table Content / States */}
      {loading ? (
        <TableSkeleton rows={6} cols={schema.columns.length} />
      ) : error ? (
        <div className="p-8 text-center rounded-md border border-[#e2665f]/30 bg-[#e2665f]/5 my-6">
          <AlertCircle className="w-8 h-8 text-[#e2665f] mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-[#f1eee6]">Unable to load {schema.label}</h4>
          <p className="text-xs text-[#9aa0ae] max-w-md mx-auto mt-1 mb-4">{error}</p>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Retry Request
          </Button>
        </div>
      ) : filteredData.length === 0 ? (
        <EmptyState
          title={`No ${schema.label.toLowerCase()} found`}
          description={
            searchQuery || Object.values(filters).some(Boolean)
              ? 'No records match your active search and filter constraints. Try clearing filters.'
              : `The ${schema.sqlTable} table is currently empty. Insert your first record.`
          }
          actionLabel={`+ Add ${schema.singularLabel || 'Record'}`}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-2">
          <DataTable
            schema={schema}
            data={paginatedData}
            foreignCache={foreignCache}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Add / Edit Slide-out Drawer */}
      <RecordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        schema={schema}
        record={editingRecord}
        onSave={handleSaveRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        schema={schema}
        record={deletingRecord}
        loading={deleteLoading}
      />
    </div>
  );
};
