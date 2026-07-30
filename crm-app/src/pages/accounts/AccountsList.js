import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, TextField, InputAdornment, LinearProgress } from '@mui/material';
import { Add, Search, AccountTree, Business, Delete } from '@mui/icons-material';
import { fetchAccounts, setFilters } from '../../store/slices/accountsSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const AccountsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, filters } = useSelector(s => s.accounts);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { dispatch(fetchAccounts()); }, [dispatch]);

  const filtered = items.filter(a => {
    const s = filters.search?.toLowerCase() || '';
    return !s || `${a.name} ${a.industry} ${a.email}`.toLowerCase().includes(s);
  });

  const columns = [
    {
      id: 'name', label: 'Account',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#388e3c20', color: '#388e3c', borderRadius: 1.5, fontSize: '0.8rem', fontWeight: 700 }}>
            {row.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{row.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { accessor: 'type', label: 'Type', render: (v) => <Chip label={v} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22, textTransform: 'capitalize' }} /> },
    { accessor: 'industry', label: 'Industry', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v}</Typography> },
    { accessor: 'primaryContact', label: 'Primary Contact', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    {
      id: 'credit', label: 'Credit',
      render: (_, row) => (
        <Box sx={{ minWidth: 100 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography variant="caption" fontSize="0.68rem" color="text.secondary">Used</Typography>
            <Typography variant="caption" fontSize="0.68rem" fontWeight={700}>{Math.round((row.creditUsed / row.creditLimit) * 100)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(row.creditUsed / row.creditLimit) * 100}
            sx={{ height: 4, borderRadius: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: row.creditUsed / row.creditLimit > 0.8 ? '#d32f2f' : '#1976d2' } }} />
        </Box>
      ),
    },
    { accessor: 'category', label: 'Category', render: (v) => <Chip label={v} size="small" sx={{ fontSize: '0.72rem', height: 22, textTransform: 'capitalize', bgcolor: '#e3f2fd', color: '#1976d2' }} /> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Accounts"
        subtitle="Manage companies, branches, and business relationships"
        breadcrumbs={[{ label: 'Accounts' }]}
        actions={[
          { label: 'Company Hierarchy', icon: <AccountTree />, onClick: () => navigate('/accounts/hierarchy'), variant: 'outlined' },
          { label: 'Add Account', icon: <Add />, onClick: () => navigate('/accounts/new'), variant: 'contained' },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Accounts', value: items.length, color: '#1976d2' },
          { label: 'Companies', value: items.filter(a => a.type === 'company').length, color: '#388e3c' },
          { label: 'Branches', value: items.filter(a => a.type === 'branch').length, color: '#f57c00' },
          { label: 'Active', value: items.filter(a => a.status === 'active').length, color: '#0288d1' },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search accounts..." value={filters.search || ''}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f4f6f8', '& fieldset': { border: 'none' } } }}
          sx={{ width: 280 }} />
      </Box>

      <DataTable
        columns={columns}
        rows={filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        totalCount={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        onRowClick={(row) => navigate(`/accounts/${row.id}`)}
        bulkActions={[{ label: 'Delete', color: 'error', icon: <Delete />, onClick: () => {} }]}
      />
    </Box>
  );
};

export default AccountsList;
