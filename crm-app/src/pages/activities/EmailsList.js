import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Avatar, Chip } from '@mui/material';
import { Add, Email, Send } from '@mui/icons-material';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const EmailsList = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.activities);
  const emails = items.filter(a => a.type === 'email');
  const [composeModal, setComposeModal] = useState(false);
  const [form, setForm] = useState({ subject: '', to: '', body: '', contactName: '', accountName: '' });

  useEffect(() => { dispatch(fetchActivities()); }, [dispatch]);

  const outcomeColors = { sent: '#0288d1', opened: '#9c27b0', awaiting_reply: '#f57c00', replied: '#388e3c' };

  const columns = [
    {
      id: 'subject', label: 'Subject',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{row.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{row.description}</Typography>
        </Box>
      ),
    },
    { accessor: 'contactName', label: 'To' },
    { accessor: 'accountName', label: 'Account' },
    { accessor: 'scheduledAt', label: 'Sent At', render: (v) => <Typography variant="caption">{v?.slice(0, 16).replace('T', ' ')}</Typography> },
    { accessor: 'outcome', label: 'Outcome', render: (v) => v ? (
      <Chip label={v?.replace('_', ' ')} size="small"
        sx={{ bgcolor: `${outcomeColors[v]}18`, color: outcomeColors[v], fontWeight: 700, fontSize: '0.72rem', height: 22, textTransform: 'capitalize' }} />
    ) : '-' },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'assignedTo', label: 'By', render: (v) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: '#388e3c' }}>{v?.[0]}</Avatar>
        <Typography variant="caption">{v?.split(' ')[0]}</Typography>
      </Box>
    )},
  ];

  return (
    <Box>
      <PageHeader
        title="Emails"
        subtitle={`${emails.length} email records`}
        breadcrumbs={[{ label: 'Activities', path: '/activities' }, { label: 'Emails' }]}
        actions={[{ label: 'Compose Email', icon: <Send />, onClick: () => setComposeModal(true), variant: 'contained' }]}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[
          { label: 'Total Sent', value: emails.length, color: '#388e3c' },
          { label: 'Opened', value: emails.filter(e => e.outcome === 'opened').length, color: '#9c27b0' },
          { label: 'Awaiting Reply', value: emails.filter(e => e.outcome === 'awaiting_reply').length, color: '#f57c00' },
          { label: 'Open Rate', value: `${Math.round((emails.filter(e => e.outcome === 'opened').length / (emails.length || 1)) * 100)}%`, color: '#1976d2' },
        ].map((s, i) => (
          <Card key={i} sx={{ flex: 1 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </CardContent></Card>
        ))}
      </Box>
      <DataTable columns={columns} rows={emails} emptyMessage="No emails logged yet." />

      <Modal open={composeModal} onClose={() => setComposeModal(false)} title="Compose Email" maxWidth="sm"
        actions={[{ label: 'Cancel', onClick: () => setComposeModal(false), variant: 'outlined' }, { label: 'Send', icon: <Send />, onClick: () => setComposeModal(false), variant: 'contained' }]}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <FormField name="to" label="To (Email)" type="email" value={form.to} onChange={(e) => setForm(p => ({ ...p, to: e.target.value }))} required />
          <FormField name="contactName" label="Contact Name" value={form.contactName} onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))} />
          <FormField name="subject" label="Subject" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required />
          <FormField type="textarea" name="body" label="Email Body" value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} rows={6} />
        </Box>
      </Modal>
    </Box>
  );
};

export default EmailsList;
