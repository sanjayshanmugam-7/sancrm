import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Tooltip, TextField, InputAdornment, LinearProgress, Avatar, Paper, Alert
} from '@mui/material';
import { CreditCard, Search, Edit, Warning, CheckCircle, Block, TrendingUp, Add } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockCreditData = [
  { id: 1, account: 'TechCorp Ltd', category: 'Enterprise', limit: 5000000, used: 2400000, overdue: 0, status: 'Good', lastReview: '2024-09-01', nextReview: '2025-03-01' },
  { id: 2, account: 'GlobalTech Inc', category: 'Enterprise', limit: 10000000, used: 9800000, overdue: 500000, status: 'Warning', lastReview: '2024-08-15', nextReview: '2025-02-15' },
  { id: 3, account: 'ABC Industries', category: 'SMB', limit: 1000000, used: 320000, overdue: 0, status: 'Good', lastReview: '2024-10-01', nextReview: '2025-04-01' },
  { id: 4, account: 'Pharma Corp', category: 'SMB', limit: 500000, used: 520000, overdue: 150000, status: 'Exceeded', lastReview: '2024-07-01', nextReview: '2024-10-01' },
  { id: 5, account: 'StartupXYZ', category: 'Startup', limit: 200000, used: 50000, overdue: 0, status: 'Good', lastReview: '2024-11-01', nextReview: '2025-05-01' },
  { id: 6, account: 'MedDevices Ltd', category: 'SMB', limit: 800000, used: 0, overdue: 0, status: 'Blocked', lastReview: '2024-06-01', nextReview: '—' },
];

const statusConfig = {
  Good: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  Warning: { color: 'warning', icon: <Warning fontSize="small" /> },
  Exceeded: { color: 'error', icon: <Warning fontSize="small" /> },
  Blocked: { color: 'error', icon: <Block fontSize="small" /> },
};

const fmtINR = (v) => `₹${(v / 100000).toFixed(1)}L`;
const usagePct = (used, limit) => Math.min(Math.round((used / limit) * 100), 100);

export default function CreditLimits() {
  const [search, setSearch] = useState('');
  const filtered = mockCreditData.filter(c => !search || c.account.toLowerCase().includes(search.toLowerCase()));

  const totalLimit = mockCreditData.reduce((s, c) => s + c.limit, 0);
  const totalUsed = mockCreditData.reduce((s, c) => s + c.used, 0);
  const totalOverdue = mockCreditData.reduce((s, c) => s + c.overdue, 0);

  return (
    <Box>
      <PageHeader
        title="Credit Limits"
        subtitle="Monitor and manage credit limits across all accounts"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Credit Limits' }]}
        action={<Button variant="contained" startIcon={<Add />}>Set Credit Limit</Button>}
      />

      {mockCreditData.some(c => c.status === 'Exceeded') && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Credit Limit Exceeded!</strong> Pharma Corp has exceeded their credit limit by ₹20K. Review immediately.
        </Alert>
      )}
      {mockCreditData.some(c => c.status === 'Warning') && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Credit Warning!</strong> GlobalTech Inc has used 98% of their credit limit.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Credit Allocated', value: fmtINR(totalLimit), color: '#1976d2' },
          { label: 'Total Used', value: fmtINR(totalUsed), color: '#f57c00' },
          { label: 'Total Overdue', value: fmtINR(totalOverdue), color: '#d32f2f' },
          { label: 'Avg. Utilization', value: `${Math.round((totalUsed / totalLimit) * 100)}%`, color: '#388e3c' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} color={s.color}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search accounts…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Credit Limit</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Utilization</TableCell>
              <TableCell>Used</TableCell>
              <TableCell>Overdue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Next Review</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(c => {
              const pct = usagePct(c.used, c.limit);
              const sc = statusConfig[c.status];
              return (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd', color: '#1976d2', fontSize: '0.75rem', fontWeight: 700 }}>{c.account.charAt(0)}</Avatar>
                      <Typography variant="body2" fontWeight={600}>{c.account}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={c.category} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600}>{fmtINR(c.limit)}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        color={pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'primary'} />
                      <Typography variant="caption" fontWeight={600} sx={{ minWidth: 32 }}>{pct}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2">{fmtINR(c.used)}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" color={c.overdue > 0 ? 'error.main' : 'text.secondary'} fontWeight={c.overdue > 0 ? 700 : 400}>
                      {c.overdue > 0 ? fmtINR(c.overdue) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip icon={sc.icon} label={c.status} size="small" color={sc.color} />
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{c.nextReview}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Limit"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
