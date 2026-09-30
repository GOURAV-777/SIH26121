import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DrillingEvent } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { Search, Download, Filter, BookOpen, AlertTriangle, ExternalLink, X } from 'lucide-react';

export const KnowledgeRepo: React.FC = () => {
  const [events, setEvents] = useState<DrillingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<DrillingEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedFormation, setSelectedFormation] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<DrillingEvent | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    api.getEvents().then(data => {
      setEvents(data);
      setFilteredEvents(data);
    });
  }, []);

  useEffect(() => {
    let list = [...events];
    if (selectedType !== 'ALL') list = list.filter(e => e.type === selectedType);
    if (selectedFormation !== 'ALL') list = list.filter(e => e.formation_name.includes(selectedFormation));
    if (selectedSeverity !== 'ALL') list = list.filter(e => e.severity === parseInt(selectedSeverity));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.well_id.toLowerCase().includes(q) ||
        e.formation_name.toLowerCase().includes(q) ||
        e.cause.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q)
      );
    }
    setFilteredEvents(list);
    setPage(1);
  }, [search, selectedType, selectedFormation, selectedSeverity, events]);

  const handleExportCSV = () => {
    const headers = ['ID,Well,Date,MD_m,TVD_m,Formation,Type,Severity,NPT_Hours,Cause,Action,Outcome,Source_Doc,Source_Page'];
    const rows = filteredEvents.map(e =>
      `"${e.id}","${e.well_id}","${e.date}",${e.md},${e.tvd},"${e.formation_name}","${e.type}",${e.severity},${e.npt_hours},"${e.cause.replace(/"/g, '""')}","${e.action.replace(/"/g, '""')}","${e.outcome.replace(/"/g, '""')}","${e.source_doc}",${e.source_page}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nwis_events_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="f07-knowledge-repo">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-teal" /> Indexed Drilling Knowledge Repository
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Master database of {events.length} historical drilling incidents, lost circulation events, kicks, and documented mitigations across 13 offset wells.
          </p>
        </div>

        {/* CSV Export Button (F07) */}
        <Button
          data-testid="f07-export-csv"
          variant="primary"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2 font-bold"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV ({filteredEvents.length})</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-3 bg-bg-surface flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 bg-bg-base border border-border px-3 py-1.5 rounded-md">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search keywords (e.g. 'Formation X', 'LCM pill', 'kick', 'stuck pipe')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-text-primary focus:outline-none font-mono text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Event Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-bg-base border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
        >
          <option value="ALL">All Event Types</option>
          <option value="mud_loss">Mud Loss</option>
          <option value="kick">Kick / Influx</option>
          <option value="stuck_pipe">Stuck Pipe</option>
          <option value="torque_spike">Torque Spike</option>
          <option value="tight_hole">Tight Hole</option>
          <option value="cementing_issue">Cementing Issue</option>
          <option value="wellbore_instability">Wellbore Instability</option>
        </select>

        {/* Formation Filter */}
        <select
          value={selectedFormation}
          onChange={(e) => setSelectedFormation(e.target.value)}
          className="bg-bg-base border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
        >
          <option value="ALL">All Formations</option>
          <option value="Formation X">Formation X (Barail Coal)</option>
          <option value="Surma Group">Surma Group</option>
          <option value="Kopili Shale">Kopili Shale</option>
          <option value="Tipam Sandstone">Tipam Sandstone</option>
          <option value="Girujan Clay">Girujan Clay</option>
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-bg-base border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="5">Severity 5 (Catastrophic)</option>
          <option value="4">Severity 4 (Major)</option>
          <option value="3">Severity 3 (Moderate)</option>
          <option value="2">Severity 2 (Minor)</option>
          <option value="1">Severity 1 (Advisory)</option>
        </select>
      </Card>

      {/* Events Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-base text-[10px] uppercase font-mono text-text-secondary border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Well</th>
                <th className="py-2.5 px-3">Formation</th>
                <th className="py-2.5 px-3">Depth (TVD)</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">NPT (hrs)</th>
                <th className="py-2.5 px-3">Documented Mitigation</th>
                <th className="py-2.5 px-3">Source Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {paginatedEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-bg-raised/60 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-accent-teal">{evt.id}</td>
                  <td className="py-2 px-3 font-bold text-text-primary">{evt.well_id}</td>
                  <td className="py-2 px-3 text-text-secondary">
                    {evt.formation_name.replace(' (demo)', '')}
                  </td>
                  <td className="py-2 px-3 font-bold text-text-primary">{evt.tvd} m</td>
                  <td className="py-2 px-3 capitalize text-accent-orange">
                    {evt.type.replace('_', ' ')}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={evt.severity >= 4 ? 'red' : (evt.severity >= 3 ? 'orange' : 'teal')} size="sm">
                      Sev {evt.severity}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 font-bold text-accent-red">{evt.npt_hours}</td>
                  <td className="py-2 px-3 font-sans text-text-secondary truncate max-w-xs">
                    {evt.action}
                  </td>
                  <td className="py-2 px-3 text-text-muted text-[11px]">
                    p.{evt.source_page}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border bg-bg-base flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2 py-1 rounded bg-bg-raised border border-border disabled:opacity-40 text-text-primary"
            >
              Previous
            </button>
            <span className="text-accent-teal font-bold px-2">Page {page} of {totalPages || 1}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded bg-bg-raised border border-border disabled:opacity-40 text-text-primary"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-accent-teal">{selectedEvent.id}</span>
                <span className="text-xs font-bold text-text-primary px-2 py-0.5 rounded bg-bg-base border border-border">
                  {selectedEvent.well_id}
                </span>
                <Badge variant={selectedEvent.severity >= 4 ? 'red' : 'orange'}>
                  Severity {selectedEvent.severity}
                </Badge>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-bg-base p-3 rounded-lg border border-border">
              <div>
                <span className="text-[10px] text-text-muted block">DEPTH</span>
                <span className="font-bold text-accent-teal">{selectedEvent.tvd} m TVD ({selectedEvent.md} m MD)</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">FORMATION</span>
                <span className="text-text-primary font-bold">{selectedEvent.formation_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">NPT IMPACT</span>
                <span className="font-bold text-accent-red">{selectedEvent.npt_hours} hours</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="text-text-secondary font-bold font-mono text-[11px]">REPORTED CAUSE:</div>
              <p className="p-2.5 bg-bg-base rounded border border-border text-text-primary font-mono text-xs">
                {selectedEvent.cause}
              </p>

              <div className="text-text-secondary font-bold font-mono text-[11px] mt-2">DOCUMENTED MITIGATION & ACTION:</div>
              <p className="p-2.5 bg-accent-teal/10 rounded border border-accent-teal/30 text-text-primary font-mono text-xs">
                {selectedEvent.action}
              </p>

              <div className="text-text-secondary font-bold font-mono text-[11px] mt-2">ORIGINAL REPORT EXCERPT:</div>
              <blockquote className="p-2.5 bg-bg-base rounded border-l-2 border-accent-orange italic text-text-secondary text-xs">
                "{selectedEvent.excerpt}"
              </blockquote>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-mono text-[11px]">Source: {selectedEvent.source_doc} (Page {selectedEvent.source_page})</span>
              <Button size="sm" variant="primary" onClick={() => setSelectedEvent(null)}>
                Close Detail
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
