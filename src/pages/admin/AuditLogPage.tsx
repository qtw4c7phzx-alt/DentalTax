import { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Input, Chip, Pagination } from '../../components/ui';
import { Search, Download, Activity, User, FileText, Package, Settings, Filter } from 'lucide-react';
import { format } from 'date-fns';

export function AuditLogPage() {
  const { auditLog, users, tenants } = useStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const sorted = [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filtered = sorted.filter(entry => {
    if (!search) return true;
    const user = users.find(u => u.id === entry.userId);
    return entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.details.toLowerCase().includes(search.toLowerCase()) ||
      user?.name.toLowerCase().includes(search.toLowerCase());
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getActionIcon = (action: string) => {
    if (action.includes('document')) return <FileText className="w-3.5 h-3.5" />;
    if (action.includes('envelope')) return <Package className="w-3.5 h-3.5" />;
    if (action.includes('user') || action.includes('login')) return <User className="w-3.5 h-3.5" />;
    if (action.includes('config') || action.includes('setting')) return <Settings className="w-3.5 h-3.5" />;
    return <Activity className="w-3.5 h-3.5" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('force')) return 'error';
    if (action.includes('create') || action.includes('publish')) return 'success';
    if (action.includes('update') || action.includes('override')) return 'warning';
    return 'info';
  };

  const handleExport = () => {
    const csv = [
      'Timestamp,User,Action,Entity Type,Entity ID,Details',
      ...sorted.map(e => {
        const user = users.find(u => u.id === e.userId);
        return `${e.timestamp},${user?.name || e.userId},${e.action},${e.entityType},${e.entityId},"${e.details}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Complete history of all platform actions.</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search actions, users, details..." icon={<Search className="w-4 h-4" />}
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="max-w-md" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(entry => {
                const user = users.find(u => u.id === entry.userId);
                return (
                  <tr key={entry.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{format(new Date(entry.timestamp), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-400">{format(new Date(entry.timestamp), 'HH:mm:ss')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'System'}</p>
                      <p className="text-xs text-gray-500">{user?.role.replace(/_/g, ' ') || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Chip variant={getActionColor(entry.action) as any} size="sm">
                        <span className="inline-flex items-center gap-1">
                          {getActionIcon(entry.action)}
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                      </Chip>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{entry.entityType}</p>
                      <p className="text-xs text-gray-400 font-mono">{(entry.entityId || '').slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{entry.details}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
