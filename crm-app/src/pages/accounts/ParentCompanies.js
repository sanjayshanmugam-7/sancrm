import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Avatar, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Tooltip, TextField, InputAdornment, Grid, Paper, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Collapse
} from '@mui/material';
import { Add, Search, Edit, Visibility, Business, AccountTree, ExpandMore, ExpandLess, CorporateFare } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const mockParents = [
  {
    id: 1, name: 'TechCorp Group', industry: 'Conglomerate', country: 'India', revenue: '₹50Cr',
    totalCompanies: 3, totalContacts: 23, status: 'Active',
    subsidiaries: [
      { name: 'TechCorp Ltd', type: 'Primary', branches: 3 },
      { name: 'TechCorp Digital', type: 'Subsidiary', branches: 1 },
      { name: 'TechCorp Cloud', type: 'Subsidiary', branches: 1 },
    ],
  },
  {
    id: 2, name: 'MedGroup Ltd', industry: 'Healthcare', country: 'India', revenue: '₹120Cr',
    totalCompanies: 2, totalContacts: 8, status: 'Active',
    subsidiaries: [
      { name: 'Pharma Corp', type: 'Primary', branches: 1 },
      { name: 'MedDevices Ltd', type: 'Subsidiary', branches: 1 },
    ],
  },
  {
    id: 3, name: 'Global Holdings Inc', industry: 'Investment', country: 'USA', revenue: '$500M',
    totalCompanies: 4, totalContacts: 40, status: 'Active',
    subsidiaries: [
      { name: 'GlobalTech Inc', type: 'Primary', branches: 5 },
      { name: 'GlobalFin Corp', type: 'Subsidiary', branches: 2 },
    ],
  },
];

const ParentRow = ({ parent }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}>{parent.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700}>{parent.name}</Typography>
              <Typography variant="caption" color="text.secondary">{parent.country}</Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell><Chip label={parent.industry} size="small" variant="outlined" /></TableCell>
        <TableCell align="center"><Typography fontWeight={600}>{parent.totalCompanies}</Typography></TableCell>
        <TableCell align="center"><Typography fontWeight={600}>{parent.totalContacts}</Typography></TableCell>
        <TableCell><Typography variant="body2" fontWeight={600} color="success.main">{parent.revenue}</Typography></TableCell>
        <TableCell><StatusBadge status={parent.status} /></TableCell>
        <TableCell align="right">
          <Tooltip title={expanded ? 'Hide subsidiaries' : 'Show subsidiaries'}>
            <IconButton size="small" onClick={() => setExpanded(e => !e)}>{expanded ? <ExpandLess /> : <ExpandMore />}</IconButton>
          </Tooltip>
          <Tooltip title="Edit"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={7} sx={{ p: 0, bgcolor: '#f8f9fa' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Subsidiaries & Companies</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {parent.subsidiaries.map((sub, i) => (
                  <Chip key={i} icon={<Business fontSize="small" />} label={`${sub.name} (${sub.branches} branches)`}
                    size="small" color={sub.type === 'Primary' ? 'primary' : 'default'} variant="outlined" />
                ))}
              </Box>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default function ParentCompanies() {
  const [search, setSearch] = useState('');
  const filtered = mockParents.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <PageHeader
        title="Parent Companies"
        subtitle="Manage top-level company groups and their subsidiaries"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Parent Companies' }]}
        action={<Button variant="contained" startIcon={<Add />}>New Parent Company</Button>}
      />
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search parent companies…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
      </Box>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parent Company</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell align="center">Subsidiaries</TableCell>
              <TableCell align="center">Contacts</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(parent => <ParentRow key={parent.id} parent={parent} />)}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
