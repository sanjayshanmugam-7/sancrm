import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
import { Add, Phone } from '@mui/icons-material';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const CallsList = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.activities);
  const calls = items.filter(a => a.type === 'call');
  const [logModal, setLogModal] = useState(false);
  const [form, setForm] = useState({ subject: '', contactName: '', accountName: '', duration: '', outcome: '', notes: '', scheduledAt: '' });

  useEffect(() => { dispatch(fetchActivities()); }, [dispatch]);

  const columns = [
    {
      id: 'subject', label: 'Call Subject',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{row.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{row.contactName}</Typography>
        </Box>
      ),
    },
    { accessor: 'accountName', label: 'Account' },
    { accessor: 'scheduledAt', label: 'Date/Time', render: (v) => <Typography variant="caption">{v?.slice(0, 16).replace('T', ' ')}</Typography> },
    { accessor: 'duration', label: 'Duration', render: (v) => v ? <Typography variant="body2">{v} min</Typography> : '-' },
    { accessor: 'outcome', label: 'Outcome', render: (v) => v ? <StatusBadge status={v} /> : '-' },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'assignedTo', label: 'By', render: (v) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: '#1976d2' }}>{v?.[0]}</Avatar>
        <Typography variant="caption">{v?.split(' ')[0]}</Typography>
      </Box>
    )},
  ];

  return (
    <Box>
      <PageHeader
        title="Calls"
        subtitle={`${calls.length} call records`}
        breadcrumbs={[{ label: 'Activities', path: '/activities' }, { label: 'Calls' }]}
        actions={[{ label: 'Log Call', icon: <Add />, onClick: () => setLogModal(true), variant: 'contained' }]}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Total Calls', value: calls.length, color: '#1976d2' },
          { label: 'Completed', value: calls.filter(c => c.status === 'completed').length, color: '#388e3c' },
          { label: 'Scheduled', value: calls.filter(c => c.status === 'scheduled').length, color: '#f57c00' },
          { label: 'Avg Duration', value: `${Math.round(calls.filter(c => c.duration).reduce((s, c) => s + c.duration, 0) / (calls.filter(c => c.duration).length || 1))} min`, color: '#9c27b0' },
        ].map((s, i) => (
          <Card key={i} sx={{ flex: 1 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <DataTable
        columns={columns}
        rows={calls}
        emptyMessage="No calls logged yet."
      />

      <Modal open={logModal} onClose={() => setLogModal(false)} title="Log a Call" maxWidth="sm"
        actions={[{ label: 'Cancel', onClick: () => setLogModal(false), variant: 'outlined' }, { label: 'Log Call', onClick: () => setLogModal(false), variant: 'contained' }]}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormField name="subject" label="Call Subject" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required />
          <FormField name="contactName" label="Contact Name" value={form.contactName} onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))} />
          <FormField name="accountName" label="Account" value={form.accountName} onChange={(e) => setForm(p => ({ ...p, accountName: e.target.value }))} />
          <FormField type="date" name="scheduledAt" label="Call Date" value={form.scheduledAt} onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <FormField name="duration" label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))} />
          <FormField type="select" name="outcome" label="Outcome" value={form.outcome} onChange={(e) => setForm(p => ({ ...p, outcome: e.target.value }))}
            options={['positive', 'neutral', 'negative', 'no_answer'].map(o => ({ label: o.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: o }))} />
          <FormField type="textarea" name="notes" label="Notes" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CallsList;
