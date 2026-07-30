import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, TextField, InputAdornment, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { Add, ViewKanban, ViewList, Search, TrendingUp, AutoAwesome } from '@mui/icons-material';
import { fetchOpportunities, setFilters } from '../../store/slices/opportunitiesSlice';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';
import PageHeader from '../../components/common/PageHeader';

const stageColors = { lead: '#42a5f5', qualified: '#66bb6a', proposal: '#ba68c8', negotiation: '#ffa726', closed_won: '#26a69a', closed_lost: '#ef5350' };

const OpportunitiesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, filters } = useSelector(s => s.opportunities);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => { dispatch(fetchOpportunities()); }, [dispatch]);

  const filtered = items.filter(o => {
    const s = filters.search?.toLowerCase() || '';
    const matchSearch = !s || `${o.title} ${o.accountName} ${o.contactName}`.toLowerCase().includes(s);
    const matchStage = !filters.stage || o.stage === filters.stage;
    return matchSearch && matchStage;
  });

  const totalValue = filtered.reduce((sum, o) => sum + (o.value || 0), 0);
  const weightedValue = filtered.reduce((sum, o) => sum + (o.value * (o.probability / 100) || 0), 0);

  const formatCurrency = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v?.toLocaleString('en-IN')}`;

  const columns = [
    {
      id: 'title', label: 'Opportunity',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{row.title}</Typography>
          <Typography variant="caption" color="text.secondary">{row.accountName} · {row.contactName}</Typography>
        </Box>
      ),
    },
    { accessor: 'value', label: 'Value', render: (v) => <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{formatCurrency(v)}</Typography> },
    { accessor: 'stage', label: 'Stage', render: (v) => (
      <Chip label={v?.replace('_', ' ')} size="small" sx={{ bgcolor: `${stageColors[v]}22`, color: stageColors[v], fontWeight: 700, fontSize: '0.72rem', height: 22, textTransform: 'capitalize' }} />
    )},
    { accessor: 'probability', label: 'Probability', render: (v) => <Typography variant="body2" fontWeight={700} sx={{ color: v >= 70 ? '#388e3c' : v >= 40 ? '#f57c00' : '#d32f2f' }}>{v}%</Typography> },
    { accessor: 'aiPrediction', label: 'AI Win', render: (v) => v ? <AIScoreBadge score={v.winProbability} size="small" /> : '-' },
    { accessor: 'assignedTo', label: 'Owner', render: (v) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: '#1976d2' }}>{v?.[0]}</Avatar>
        <Typography variant="caption">{v}</Typography>
      </Box>
    )},
    { accessor: 'expectedClose', label: 'Close Date', render: (v) => <Typography variant="caption" color="text.secondary">{v}</Typography> },
  ];

  return (
    <Box>
      <PageHeader
        title="Opportunities"
        subtitle={`${filtered.length} opportunities · Pipeline: ${formatCurrency(totalValue)} · Weighted: ${formatCurrency(weightedValue)}`}
        breadcrumbs={[{ label: 'Opportunities' }]}
        actions={[
          { label: 'Pipeline View', icon: <ViewKanban />, onClick: () => navigate('/opportunities/pipeline'), variant: 'outlined' },
          { label: 'Add Opportunity', icon: <Add />, onClick: () => navigate('/opportunities/new'), variant: 'contained' },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Pipeline', value: formatCurrency(totalValue), color: '#1976d2' },
          { label: 'Weighted Pipeline', value: formatCurrency(weightedValue), color: '#388e3c' },
          { label: 'Total Deals', value: filtered.length, color: '#f57c00' },
          { label: 'Avg Deal Size', value: formatCurrency(totalValue / (filtered.length || 1)), color: '#9c27b0' },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search opportunities..." value={filters.search || ''}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>, sx: { borderRadius: 2, bgcolor: '#f4f6f8', '& fieldset': { border: 'none' } } }}
          sx={{ width: 260 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Stage</InputLabel>
          <Select value={filters.stage || ''} label="Stage" onChange={(e) => dispatch(setFilters({ stage: e.target.value }))} sx={{ borderRadius: 2 }}>
            <MenuItem value="">All Stages</MenuItem>
            {['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(s => <MenuItem key={s} value={s}><Chip label={s.replace('_', ' ')} size="small" sx={{ bgcolor: `${stageColors[s]}22`, color: stageColors[s], fontSize: '0.72rem', height: 22, textTransform: 'capitalize' }} /></MenuItem>)}
          </Select>
        </FormControl>
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
        onRowClick={(row) => navigate(`/opportunities/${row.id}`)}
      />
    </Box>
  );
};

export default OpportunitiesList;
