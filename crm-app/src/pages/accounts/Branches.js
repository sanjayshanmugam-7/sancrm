import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Avatar, Chip, IconButton, Tooltip,
  TextField, InputAdornment, Grid, Paper, Divider
} from '@mui/material';
import { Add, Search, Edit, Visibility, LocationOn, Phone, Email, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const mockBranches = [
  { id: 1, name: 'TechCorp – Mumbai HQ', company: 'TechCorp Ltd', type: 'Headquarters', city: 'Mumbai', state: 'Maharashtra', phone: '+91-22-12345678', email: 'mumbai@techcorp.com', contacts: 8, gst: '27AABCC1234D1Z5', status: 'Active' },
  { id: 2, name: 'TechCorp – Pune Branch', company: 'TechCorp Ltd', type: 'Branch', city: 'Pune', state: 'Maharashtra', phone: '+91-20-98765432', email: 'pune@techcorp.com', contacts: 3, gst: '27AABCC1234D1Z6', status: 'Active' },
  { id: 3, name: 'TechCorp – Bengaluru', company: 'TechCorp Ltd', type: 'Branch', city: 'Bengaluru', state: 'Karnataka', phone: '+91-80-11223344', email: 'blr@techcorp.com', contacts: 2, gst: '29AABCC1234D1Z7', status: 'Active' },
  { id: 4, name: 'GlobalTech – Delhi NCR', company: 'GlobalTech Inc', type: 'Regional Office', city: 'Gurugram', state: 'Haryana', phone: '+91-124-5566778', email: 'delhi@globaltech.com', contacts: 5, gst: '06AABCC9012F3Z1', status: 'Active' },
  { id: 5, name: 'ABC – Ahmedabad', company: 'ABC Industries', type: 'Branch', city: 'Ahmedabad', state: 'Gujarat', phone: '+91-79-22334455', email: 'ahm@abcind.com', contacts: 3, gst: '24AABCC5678E2Z1', status: 'Inactive' },
];

export default function Branches() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = mockBranches.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.company.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Branches"
        subtitle="Manage all company branches and office locations"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Branches' }]}
        action={<Button variant="contained" startIcon={<Add />}>New Branch</Button>}
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Branches', value: mockBranches.length },
          { label: 'Headquarters', value: mockBranches.filter(b => b.type === 'Headquarters').length },
          { label: 'Active', value: mockBranches.filter(b => b.status === 'Active').length },
          { label: 'States Covered', value: new Set(mockBranches.map(b => b.state)).size },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search branches…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
      </Box>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Branch Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>GSTIN</TableCell>
              <TableCell align="center">Staff</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(branch => (
              <TableRow key={branch.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ color: '#1976d2', fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600}>{branch.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" color="primary">{branch.company}</Typography></TableCell>
                <TableCell><Chip label={branch.type} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography variant="body2">{branch.city}</Typography>
                  <Typography variant="caption" color="text.secondary">{branch.state}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone sx={{ fontSize: 12 }} /><Typography variant="caption">{branch.phone}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email sx={{ fontSize: 12 }} /><Typography variant="caption">{branch.email}</Typography></Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{branch.gst}</Typography></TableCell>
                <TableCell align="center"><Typography variant="body2" fontWeight={600}>{branch.contacts}</Typography></TableCell>
                <TableCell><StatusBadge status={branch.status} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="View"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
