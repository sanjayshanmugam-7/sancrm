import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Avatar, Chip, IconButton, Tooltip,
  TextField, InputAdornment, Grid, Paper
} from '@mui/material';
import { Add, Search, Edit, Visibility, Business, AccountTree, People, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const mockCompanies = [
  { id: 1, name: 'TechCorp Ltd', industry: 'Technology', type: 'Customer', parent: 'TechCorp Group', branches: 3, contacts: 12, opportunities: 4, revenue: '₹48L', status: 'Active', gstin: '27AABCC1234D1Z5', website: 'techcorp.com' },
  { id: 2, name: 'ABC Industries', industry: 'Manufacturing', type: 'Prospect', parent: null, branches: 2, contacts: 8, opportunities: 2, revenue: '₹22L', status: 'Active', gstin: '29AABCC5678E2Z6', website: 'abcind.com' },
  { id: 3, name: 'GlobalTech Inc', industry: 'IT Services', type: 'Customer', parent: null, branches: 5, contacts: 20, opportunities: 6, revenue: '₹1.2Cr', status: 'Active', gstin: '07AABCC9012F3Z7', website: 'globaltech.com' },
  { id: 4, name: 'Pharma Corp', industry: 'Pharmaceuticals', type: 'Lead', parent: 'MedGroup Ltd', branches: 1, contacts: 4, opportunities: 1, revenue: '₹8L', status: 'Inactive', gstin: '19AABCC3456G4Z8', website: 'pharmacorp.in' },
  { id: 5, name: 'StartupXYZ', industry: 'SaaS', type: 'Prospect', parent: null, branches: 1, contacts: 3, opportunities: 1, revenue: '₹4L', status: 'Active', gstin: null, website: 'startupxyz.io' },
];

const industryColors = { Technology: '#1976d2', Manufacturing: '#f57c00', 'IT Services': '#388e3c', Pharmaceuticals: '#9c27b0', SaaS: '#00796b' };

export default function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = mockCompanies.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <PageHeader
        title="Companies"
        subtitle="All companies and business accounts"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Companies' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={() => navigate('/accounts/new')}>New Company</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Companies', value: mockCompanies.length, color: '#1976d2' },
          { label: 'Customers', value: mockCompanies.filter(c => c.type === 'Customer').length, color: '#388e3c' },
          { label: 'Prospects', value: mockCompanies.filter(c => c.type === 'Prospect').length, color: '#f57c00' },
          { label: 'Active', value: mockCompanies.filter(c => c.status === 'Active').length, color: '#00796b' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search companies…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ width: 300 }} />
      </Box>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell align="center">Branches</TableCell>
              <TableCell align="center">Contacts</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(co => (
              <TableRow key={co.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/accounts/${co.id}`)}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: (industryColors[co.industry] || '#616161') + '20', color: industryColors[co.industry] || '#616161', width: 36, height: 36, fontWeight: 700 }}>
                      {co.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{co.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{co.website}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={co.industry} size="small" sx={{ bgcolor: (industryColors[co.industry] || '#616161') + '18', color: industryColors[co.industry] || '#616161', fontWeight: 600 }} />
                </TableCell>
                <TableCell><Chip label={co.type} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" color={co.parent ? 'primary' : 'text.disabled'}>{co.parent || '—'}</Typography></TableCell>
                <TableCell align="center"><Typography variant="body2" fontWeight={600}>{co.branches}</Typography></TableCell>
                <TableCell align="center"><Typography variant="body2" fontWeight={600}>{co.contacts}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600} color="success.main">{co.revenue}</Typography></TableCell>
                <TableCell><StatusBadge status={co.status} /></TableCell>
                <TableCell align="right" onClick={e => e.stopPropagation()}>
                  <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/accounts/${co.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/accounts/${co.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
