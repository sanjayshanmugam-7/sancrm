import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip, Paper } from '@mui/material';
import { Add, NotificationsActive, AlarmOn } from '@mui/icons-material';
import { fetchActivities, completeActivity } from '../../store/slices/activitiesSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const FollowUpsList = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.activities);
  const followups = items.filter(a => a.type === 'followup');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ subject: '', contactName: '', accountName: '', scheduledAt: '', reminder: '', priority: 'medium', notes: '' });

  useEffect(() => { dispatch(fetchActivities()); }, [dispatch]);

  const columns = [
    {
      id: 'subject', label: 'Follow-up',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{row.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{row.notes}</Typography>
        </Box>
      ),
    },
    { accessor: 'contactName', label: 'Contact' },
    { accessor: 'accountName', label: 'Account' },
    { accessor: 'scheduledAt', label: 'Due Date', render: (v) => <Typography variant="caption" color="primary" fontWeight={600}>{v?.slice(0, 16).replace('T', ' ')}</Typography> },
    { accessor: 'reminder', label: 'Reminder', render: (v) => v ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AlarmOn sx={{ fontSize: 14, color: '#f57c00' }} />
        <Typography variant="caption" color="text.secondary">{v?.slice(0, 16).replace('T', ' ')}</Typography>
      </Box>
    ) : '-' },
    { accessor: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      id: 'action', label: '',
      render: (_, row) => row.status === 'pending' ? (
        <Button size="small" variant="outlined" color="success" sx={{ fontSize: '0.72rem', borderRadius: 1.5 }}
          onClick={(e) => { e.stopPropagation(); dispatch(completeActivity({ id: row.id, outcome: 'completed' })); }}>
          Mark Done
        </Button>
      ) : null,
    },
  ];

  const overdue = followups.filter(f => f.status === 'pending' && new Date(f.scheduledAt) < new Date());
  const dueToday = followups.filter(f => f.status === 'pending');
  const pending = followups.filter(f => f.status === 'pending');

  return (
    <Box>
      <PageHeader
        title="Follow-ups"
        subtitle={`${followups.length} follow-ups · ${overdue.length} overdue`}
        breadcrumbs={[{ label: 'Activities', path: '/activities' }, { label: 'Follow-ups' }]}
        actions={[{ label: 'Add Follow-up', icon: <Add />, onClick: () => setAddModal(true), variant: 'contained' }]}
      />

      {overdue.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: '#fff3e0', borderColor: '#ffb74d', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AlarmOn sx={{ color: '#f57c00' }} />
          <Typography variant="body2" fontWeight={600} color="#e65100">{overdue.length} overdue follow-up{overdue.length > 1 ? 's' : ''} need your attention!</Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Total', value: followups.length, color: '#9c27b0' },
          { label: 'Pending', value: pending.length, color: '#f57c00' },
          { label: 'Overdue', value: overdue.length, color: '#d32f2f' },
          { label: 'Completed', value: followups.filter(f => f.status === 'completed').length, color: '#388e3c' },
        ].map((s, i) => (
          <Card key={i} sx={{ flex: 1 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </CardContent></Card>
        ))}
      </Box>

      <DataTable columns={columns} rows={followups} emptyMessage="No follow-ups scheduled." />

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Follow-up" maxWidth="sm"
        actions={[{ label: 'Cancel', onClick: () => setAddModal(false), variant: 'outlined' }, { label: 'Save', onClick: () => setAddModal(false), variant: 'contained' }]}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormField name="subject" label="Follow-up Subject" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required />
          <FormField name="contactName" label="Contact" value={form.contactName} onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))} />
          <FormField name="accountName" label="Account" value={form.accountName} onChange={(e) => setForm(p => ({ ...p, accountName: e.target.value }))} />
          <FormField type="datetime-local" name="scheduledAt" label="Due Date & Time" value={form.scheduledAt} onChange={(e) => setForm(p => ({ ...p, scheduledAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <FormField type="datetime-local" name="reminder" label="Set Reminder" value={form.reminder} onChange={(e) => setForm(p => ({ ...p, reminder: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <FormField type="select" name="priority" label="Priority" value={form.priority} onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
            options={['low', 'medium', 'high', 'urgent'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))} />
          <FormField type="textarea" name="notes" label="Notes" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
        </Box>
      </Modal>
    </Box>
  );
};

export default FollowUpsList;
