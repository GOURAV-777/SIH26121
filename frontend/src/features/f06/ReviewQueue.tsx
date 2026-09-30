import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ReviewQueueItem } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { Check, X, Edit3, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDepth, setEditDepth] = useState<number>(2445);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getReviewQueue().then(items => setQueue(items));
  }, []);

  const handleApprove = async (id: string) => {
    await api.approveReviewItem(id);
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'approved' } : q));
    setSuccessMsg(`Item ${id} approved and added to Knowledge Repository.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleReject = async (id: string) => {
    await api.rejectReviewItem(id);
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected' } : q));
  };

  const pendingItems = queue.filter(q => q.status === 'pending');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="f06-review-queue">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-accent-amber" /> Human-in-the-Loop Review Queue
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Review and validate low-confidence NLP extractions (confidence &lt; 80%) before permanent commit to the offset repository.
          </p>
        </div>
        <Badge variant="amber" size="md">
          {pendingItems.length} Pending Review
        </Badge>
      </div>

      {successMsg && (
        <div className="p-3 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Queue Items */}
      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <Card className="text-center py-12 text-text-muted space-y-2">
            <CheckCircle2 className="w-10 h-10 text-accent-green mx-auto" />
            <div className="font-bold text-text-primary text-sm">Review Queue Clean</div>
            <div className="text-xs">All extracted entities have been reviewed and committed.</div>
          </Card>
        ) : (
          pendingItems.map((item) => {
            const data = JSON.parse(item.event_candidate);
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                data-testid="f06-queue-item"
                className="bg-bg-surface border border-border rounded-lg p-4 space-y-3 hover:border-accent-teal/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-xs text-accent-teal">{item.id}</span>
                    <Badge variant="orange" size="sm">
                      {item.well_id}
                    </Badge>
                    <span className="text-xs font-mono text-text-secondary">Source: {item.doc_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.confidence < 0.7 ? 'red' : 'amber'} size="sm">
                      Confidence {(item.confidence * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-[10px] text-text-muted font-mono">{item.created_at}</span>
                  </div>
                </div>

                {/* Candidate Event Payload */}
                <div className="bg-bg-base p-3 rounded border border-border grid grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-text-secondary text-[10px] block">Event Type:</span>
                    <span className="font-bold text-text-primary capitalize">{data.type?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-[10px] block">Extracted Depth:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editDepth}
                        onChange={(e) => setEditDepth(parseFloat(e.target.value))}
                        className="w-24 bg-bg-surface border border-accent-teal rounded px-1.5 py-0.5 text-xs text-text-primary"
                      />
                    ) : (
                      <span className="font-bold text-accent-teal">{data.depth_tvd} m TVD</span>
                    )}
                  </div>
                  <div>
                    <span className="text-text-secondary text-[10px] block">Formation:</span>
                    <span className="text-text-primary">{data.formation}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-[10px] block">Reported NPT:</span>
                    <span className="text-accent-red font-bold">{data.npt} hrs</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-border text-xs">
                  <div className="text-[11px] text-text-secondary">
                    <b>Action Taken:</b> {data.action}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(null);
                          data.depth_tvd = editDepth;
                          item.event_candidate = JSON.stringify(data);
                        }}
                      >
                        Save Edit
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditDepth(data.depth_tvd);
                        }}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(item.id)}
                      className="gap-1 text-xs"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(item.id)}
                      className="gap-1 text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve & Commit
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
