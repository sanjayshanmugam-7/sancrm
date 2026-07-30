import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
import { Add, VideoCall } from '@mui/icons-material';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const MeetingsList = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.activities);
  const meetings = items.filter(a => a.type === 'meeting');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ subject: '', contactName: '', accountName: '', location: '', scheduledAt: '', duration: '60', notes: '', priority: 'medium' });

  useEffect(() => { dispatch(fetchActivities()); }, [dispatch]);

  const columns = [
    {
      id: 'subject', label: 'Meeting',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{row.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{row.location || 'No location'}</Typography>
        </Box>
      ),
    },
    { accessor: 'contactName', label: 'Contact' },
    { accessor: 'accountName', label: 'Account' },
    { accessor: 'scheduledAt', label: 'Date/Time', render: (v) => <Typography variant="caption">{v?.slice(0, 16).replace('T', ' ')}</Typography> },
    { accessor: 'duration', label: 'Duration', render: (v) => v ? <Typography variant="body2">{v} min</Typography> : '-' },
    {
      id: 'attendees', label: 'Attendees',
      render: (_, row) => row.attendees ? (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {row.attendees.slice(0, 2).map((a, i) => <Avatar key={i} sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: '#1976d2' }}>{a?.[0]}</Avatar>)}
          {row.attendees.length > 2 && <Chip label={`+${row.attendees.length - 2}`} size="small" sx={{ height: 22, fontSize: '0.68rem' }} />}
        </Box>
      ) : '-',
    },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Meetings"
        subtitle={`${meetings.length} meetings`}
        breadcrumbs={[{ label: 'Activities', path: '/activities' }, { label: 'Meetings' }]}
        actions={[{ label: 'Schedule Meeting', icon: <Add />, onClick: () => setAddModal(true), variant: 'contained' }]}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Total', value: meetings.length, color: '#f57c00' },
          { label: 'Scheduled', value: meetings.filter(m => m.status === 'scheduled').length, color: '#1976d2' },
          { label: 'Completed', value: meetings.filter(m => m.status === 'completed').length, color: '#388e3c' },
          { label: 'This Week', value: meetings.length, color: '#9c27b0' },
        ].map((s, i) => (
          <Card key={i} sx={{ flex: 1 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </CardContent></Card>
        ))}
      </Box>

      <DataTable columns={columns} rows={meetings} emptyMessage="No meetings scheduled." />

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Schedule Meeting" maxWidth="sm"
        actions={[{ label: 'Cancel', onClick: () => setAddModal(false), variant: 'outlined' }, { label: 'Schedule', onClick: () => setAddModal(false), variant: 'contained' }]}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormField name="subject" label="Meeting Title" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required />
          <FormField name="contactName" label="Contact" value={form.contactName} onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))} />
          <FormField name="accountName" label="Account" value={form.accountName} onChange={(e) => setForm(p => ({ ...p, accountName: e.target.value }))} />
          <FormField name="location" label="Location / Meeting Link" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} />
          <FormField type="datetime-local" name="scheduledAt" label="Date & Time" value={form.scheduledAt} onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <FormField name="duration" label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))} />
          <FormField type="select" name="priority" label="Priority" value={form.priority} onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
            options={['low', 'medium', 'high', 'urgent'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))} />
          <FormField type="textarea" name="notes" label="Agenda/Notes" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
        </Box>
      </Modal>
    </Box>
  );
};

export default MeetingsList;
