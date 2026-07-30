import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Button, Chip, Avatar, Typography,
  MenuItem, TextField, InputAdornment, Select, FormControl, InputLabel,
  IconButton, Tooltip, Menu, Divider,
} from '@mui/material';
import {
  Add, ImportExport, MergeType, Assignment, FilterList, Search,
  Phone, Email, WhatsApp, MoreVert, Edit, Delete, Loop, AutoAwesome,
} from '@mui/icons-material';
import { fetchLeads, deleteLead, setFilters } from '../../store/slices/leadsSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

const LeadsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: leads, loading, filters, total } = useSelector((s) => s.leads);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => { dispatch(fetchLeads()); }, [dispatch]);

  const handleFilter = (key, val) => dispatch(setFilters({ [key]: val }));

  const filteredLeads = leads.filter(l => {
    const s = filters.search?.toLowerCase() || '';
    const matchSearch = !s || `${l.firstName} ${l.lastName} ${l.company} ${l.email}`.toLowerCase().includes(s);
    const matchStatus = !filters.status || l.status === filters.status;
    const matchSource = !filters.source || l.source === filters.source;
    return matchSearch && matchStatus && matchSource;
  });

  const stats = [
    { label: 'Total', value: leads.length, color: '#1976d2' },
    { label: 'New', value: leads.filter(l => l.status === 'new').length, color: '#0288d1' },
    { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: '#388e3c' },
    { label: 'Hot Leads', value: leads.filter(l => l.aiScore >= 75).length, color: '#d32f2f' },
  ];

  const columns = [
    {
      id: 'name', label: 'Lead Name',
      render: (_, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d220', color: '#1976d2', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.firstName?.[0]}{row.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { accessor: 'company', label: 'Company', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    { accessor: 'phone', label: 'Phone', render: (v) => <Typography variant="body2" fontSize="0.85rem">{v || '-'}</Typography> },
    { accessor: 'source', label: 'Source', render: (v) => <Chip label={v} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} /> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { accessor: 'aiScore', label: 'AI Score', render: (v) => <AIScoreBadge score={v} showBar /> },
    { accessor: 'assignedTo', label: 'Assigned To', render: (v) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: '#388e3c' }}>{v?.[0]}</Avatar>
        <Typography variant="caption" fontSize="0.78rem">{v || 'Unassigned'}</Typography>
      </Box>
    )},
    { accessor: 'createdAt', label: 'Created', render: (v) => <Typography variant="caption" color="text.secondary">{v}</Typography> },
  ];

  return (
    <Box>
      <PageHeader
        title="Leads"
        subtitle={`${total} total leads in your pipeline`}
        breadcrumbs={[{ label: 'Leads' }]}
        actions={[
          { label: 'Bulk Import', icon: <ImportExport />, onClick: () => navigate('/leads/import'), variant: 'outlined' },
          { label: 'Detect Duplicates', icon: <MergeType />, onClick: () => navigate('/leads/duplicates'), variant: 'outlined' },
          { label: 'Assign Leads', icon: <Assignment />, onClick: () => navigate('/leads/assignment'), variant: 'outlined' },
          { label: 'Add Lead', icon: <Add />, onClick: () => navigate('/leads/new'), variant: 'contained' },
        ]}
      />

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }} onClick={() => s.label !== 'Total' && handleFilter('status', s.label.toLowerCase())}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search leads..."
          value={filters.search || ''}
          onChange={(e) => handleFilter('search', e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f4f6f8', '& fieldset': { border: 'none' } } }}
          sx={{ width: 260 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filters.status || ''} label="Status" onChange={(e) => handleFilter('status', e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Status</MenuItem>
            {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(s => (
              <MenuItem key={s} value={s}><StatusBadge status={s} /></MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Source</InputLabel>
          <Select value={filters.source || ''} label="Source" onChange={(e) => handleFilter('source', e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Sources</MenuItem>
            {['Website', 'Facebook', 'Google Ads', 'WhatsApp', 'Instagram', 'Email', 'Referral'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {(filters.status || filters.source || filters.search) && (
          <Button size="small" variant="text" onClick={() => dispatch(setFilters({ status: '', source: '', search: '' }))} sx={{ fontSize: '0.8rem' }}>
            Clear Filters
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">{filteredLeads.length} results</Typography>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        totalCount={filteredLeads.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        onRowClick={(row) => navigate(`/leads/${row.id}`)}
        onSelectionChange={setSelected}
        bulkActions={[
          { label: 'Assign', icon: <Assignment />, onClick: (ids) => navigate('/leads/assignment', { state: { leadIds: ids } }) },
          { label: 'Export', icon: <ImportExport />, onClick: (ids) => alert(`Export ${ids.length} leads`) },
          { label: 'Delete', icon: <Delete />, color: 'error', onClick: (ids) => ids.forEach(id => dispatch(deleteLead(id))) },
        ]}
      />
    </Box>
  );
};

export default LeadsList;
