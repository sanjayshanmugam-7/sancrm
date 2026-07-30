import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Button, Avatar, Typography, Chip, Grid, Card, CardContent, TextField, InputAdornment } from '@mui/material';
import { Add, Search, People, Business, Group, Delete, Edit } from '@mui/icons-material';
import { fetchContacts, setActiveTab, setFilters } from '../../store/slices/contactsSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const ContactsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, activeTab, filters } = useSelector(s => s.contacts);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { dispatch(fetchContacts()); }, [dispatch]);

  const tabContacts = {
    0: items,
    1: items.filter(c => c.type === 'individual'),
    2: items.filter(c => c.type === 'business'),
  };

  const filteredContacts = (tabContacts[activeTab] || []).filter(c => {
    const s = filters.search?.toLowerCase() || '';
    return !s || `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(s);
  });

  const columns = [
    {
      id: 'name', label: 'Contact',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: row.type === 'business' ? '#388e3c20' : '#1976d220', color: row.type === 'business' ? '#388e3c' : '#1976d2', fontSize: '0.8rem', fontWeight: 700 }}>
            {row.firstName?.[0]}{row.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{row.firstName} {row.lastName}</Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { accessor: 'company', label: 'Company', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    { accessor: 'jobTitle', label: 'Title', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    { accessor: 'phone', label: 'Phone', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    { accessor: 'group', label: 'Group', render: (v) => v ? <Chip label={v} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} /> : '-' },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'type', label: 'Type', render: (v) => (
      <Chip icon={v === 'business' ? <Business sx={{ fontSize: '14px !important' }} /> : <People sx={{ fontSize: '14px !important' }} />}
        label={v === 'business' ? 'Business' : 'Individual'} size="small"
        sx={{ bgcolor: v === 'business' ? '#e8f5e9' : '#e3f2fd', color: v === 'business' ? '#388e3c' : '#1976d2', fontSize: '0.72rem', height: 22 }} />
    )},
  ];

  const stats = [
    { label: 'Total', value: items.length, color: '#1976d2' },
    { label: 'Individual', value: items.filter(c => c.type === 'individual').length, color: '#0288d1' },
    { label: 'Business', value: items.filter(c => c.type === 'business').length, color: '#388e3c' },
    { label: 'Active', value: items.filter(c => c.status === 'active').length, color: '#2e7d32' },
  ];

  return (
    <Box>
      <PageHeader
        title="Contacts"
        subtitle="Manage all your individual and business contacts"
        breadcrumbs={[{ label: 'Contacts' }]}
        actions={[
          { label: 'Customer Groups', icon: <Group />, onClick: () => navigate('/contacts/groups'), variant: 'outlined' },
          { label: 'Add Contact', icon: <Add />, onClick: () => navigate('/contacts/new'), variant: 'contained' },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs value={activeTab} onChange={(e, v) => dispatch(setActiveTab(v))}>
            <Tab label={`All (${items.length})`} />
            <Tab icon={<People sx={{ fontSize: 16 }} />} iconPosition="start" label={`Individual (${items.filter(c => c.type === 'individual').length})`} />
            <Tab icon={<Business sx={{ fontSize: 16 }} />} iconPosition="start" label={`Business (${items.filter(c => c.type === 'business').length})`} />
          </Tabs>
        </Box>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small" placeholder="Search contacts..."
            value={filters.search || ''}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f4f6f8', '& fieldset': { border: 'none' } } }}
            sx={{ width: 280 }}
          />
        </Box>
        <Box sx={{ p: 2 }}>
          <DataTable
            columns={columns}
            rows={filteredContacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            loading={loading}
            totalCount={filteredContacts.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            onRowClick={(row) => navigate(`/contacts/${row.id}`)}
            bulkActions={[
              { label: 'Export', onClick: () => {} },
              { label: 'Delete', color: 'error', icon: <Delete />, onClick: () => {} },
            ]}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ContactsList;
