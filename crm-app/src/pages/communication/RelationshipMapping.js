import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Chip, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider, Paper,
  IconButton, Tooltip, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  AccountTree, Add, Search, Edit, Delete, Business, Person,
  TrendingUp, Link, ArrowForward, Hub, People, OpenInNew
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const mockRelationships = [
  {
    id: 1,
    source: { name: 'TechCorp Ltd', type: 'Account', avatar: 'TC' },
    relation: 'Parent Company of',
    target: { name: 'TechCorp – Mumbai Branch', type: 'Account', avatar: 'TM' },
  },
  {
    id: 2,
    source: { name: 'Mohan Patel', type: 'Contact', avatar: 'MP' },
    relation: 'Decision Maker at',
    target: { name: 'TechCorp Ltd', type: 'Account', avatar: 'TC' },
  },
  {
    id: 3,
    source: { name: 'TechCorp Ltd', type: 'Account', avatar: 'TC' },
    relation: 'Has Opportunity',
    target: { name: 'CRM Implementation – ₹5L', type: 'Opportunity', avatar: 'OP' },
  },
  {
    id: 4,
    source: { name: 'Priya Verma', type: 'Contact', avatar: 'PV' },
    relation: 'Influencer at',
    target: { name: 'ABC Industries', type: 'Account', avatar: 'AI' },
  },
  {
    id: 5,
    source: { name: 'Ravi Kumar (Agent)', type: 'User', avatar: 'RK' },
    relation: 'Account Manager for',
    target: { name: 'GlobalTech Inc', type: 'Account', avatar: 'GT' },
  },
  {
    id: 6,
    source: { name: 'GlobalTech Inc', type: 'Account', avatar: 'GT' },
    relation: 'Partner of',
    target: { name: 'TechCorp Ltd', type: 'Account', avatar: 'TC' },
  },
];

const typeColors = {
  Account: '#1976d2', Contact: '#388e3c', Lead: '#f57c00',
  Opportunity: '#9c27b0', User: '#00796b', Branch: '#e65100',
};

const relationTypes = [
  'Parent Company of', 'Subsidiary of', 'Partner of', 'Vendor of', 'Customer of',
  'Decision Maker at', 'Influencer at', 'End User at', 'Stakeholder at',
  'Account Manager for', 'Reported to', 'Has Opportunity', 'Referred by',
];

const EntityChip = ({ name, type, avatar }) => (
  <Paper variant="outlined" sx={{ px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, borderColor: typeColors[type] + '60' }}>
    <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, bgcolor: typeColors[type] + '20', color: typeColors[type] }}>{avatar}</Avatar>
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{name}</Typography>
      <Typography variant="caption" color="text.secondary">{type}</Typography>
    </Box>
  </Paper>
);

export default function RelationshipMapping() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const entityTypes = ['All', 'Account', 'Contact', 'Opportunity', 'User'];
  const filtered = mockRelationships.filter(r => {
    const matchSearch = !search || r.source.name.toLowerCase().includes(search.toLowerCase()) || r.target.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || r.source.type === filter || r.target.type === filter;
    return matchSearch && matchFilter;
  });

  // Group by source for hierarchy view
  const groupedBySrc = filtered.reduce((acc, r) => {
    const key = r.source.name;
    if (!acc[key]) acc[key] = { source: r.source, relations: [] };
    acc[key].relations.push(r);
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader
        title="Relationship Mapping"
        subtitle="Visualise and manage connections between accounts, contacts and opportunities"
        action={<Button variant="contained" startIcon={<Add />}>Add Relationship</Button>}
      />

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Relationships', value: mockRelationships.length, icon: <Link />, color: '#1976d2' },
          { label: 'Account ↔ Account', value: 3, icon: <Business />, color: '#388e3c' },
          { label: 'Contact ↔ Account', value: 2, icon: <People />, color: '#f57c00' },
          { label: 'Agent ↔ Account', value: 1, icon: <Hub />, color: '#9c27b0' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
              <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search entities…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ width: 260 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={filter} onChange={e => setFilter(e.target.value)} label="Filter by Type">
            {entityTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Relationship List */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" gutterBottom>All Relationships ({filtered.length})</Typography>
            </CardContent>
            <List disablePadding>
              {filtered.map((rel, idx) => (
                <React.Fragment key={rel.id}>
                  <ListItem sx={{ py: 1.5, px: 2 }}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Edit"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <EntityChip {...rel.source} />
                      <Box sx={{ textAlign: 'center' }}>
                        <ArrowForward sx={{ color: 'text.disabled', fontSize: 16 }} />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                          {rel.relation}
                        </Typography>
                      </Box>
                      <EntityChip {...rel.target} />
                    </Box>
                  </ListItem>
                  {idx < filtered.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Hierarchy View */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom><Hub sx={{ mr: 1, verticalAlign: 'middle' }} />Relationship Groups</Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(groupedBySrc).map(([sourceName, group]) => (
                <Box key={sourceName} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: typeColors[group.source.type] + '20', color: typeColors[group.source.type], fontSize: '0.7rem', fontWeight: 700 }}>
                      {group.source.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{group.source.name}</Typography>
                      <Chip label={group.source.type} size="small" sx={{ height: 14, fontSize: '0.6rem', bgcolor: typeColors[group.source.type] + '18', color: typeColors[group.source.type] }} />
                    </Box>
                  </Box>
                  <Box sx={{ pl: 3, borderLeft: `2px solid ${typeColors[group.source.type]}40` }}>
                    {group.relations.map(rel => (
                      <Box key={rel.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, fontStyle: 'italic' }}>{rel.relation}</Typography>
                        <Chip
                          avatar={<Avatar sx={{ width: 18, height: 18, bgcolor: typeColors[rel.target.type], fontSize: '0.55rem' }}>{rel.target.avatar}</Avatar>}
                          label={rel.target.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
