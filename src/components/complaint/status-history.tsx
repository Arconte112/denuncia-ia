import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintHistory } from "@/lib/supabase";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Loader2 } from "lucide-react";

// Mapeo de estados para visualización
const statusDisplay = {
  'new': { label: 'New', className: 'bg-green-500/20 text-green-500' },
  'in_progress': { label: 'In progress', className: 'bg-yellow-500/20 text-yellow-500' },
  'resolved': { label: 'Resolved', className: 'bg-blue-500/20 text-blue-500' },
  'closed': { label: 'Closed', className: 'bg-gray-500/20 text-gray-500' }
};

interface StatusHistoryProps {
  complaintId: string;
  refreshTrigger?: number;
}

export function StatusHistory({ complaintId, refreshTrigger = 0 }: StatusHistoryProps) {
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        // Si ya tenemos datos, solo actualizamos el estado de "refreshing"
        if (history.length > 0 && !loading) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        
        const response = await fetch(`/api/denuncias/${complaintId}/history`);
        
        if (!response.ok) {
          throw new Error('Error loading history');
        }
        
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Could not load history');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    fetchHistory();
  }, [complaintId, refreshTrigger]);

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading history...</span>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Change History</CardTitle>
        {refreshing && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Updating...
          </div>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No status changes recorded
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay[entry.new_status].className}`}>
                      {statusDisplay[entry.new_status].label}
                    </span>
                    {entry.old_status && (
                      <>
                        <span className="text-muted-foreground text-xs">from</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay[entry.old_status].className}`}>
                          {statusDisplay[entry.old_status].label}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm', { locale: enUS })}
                  </span>
                </div>
                {entry.user && (
                  <p className="text-sm mb-1">
                    By: <span className="font-medium">{entry.user.full_name}</span>
                  </p>
                )}
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 