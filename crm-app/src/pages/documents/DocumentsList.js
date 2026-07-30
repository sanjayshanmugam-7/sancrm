import React, { useState } from 'react';
import {
  Box, Card, Grid, Typography, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Avatar, Menu, MenuItem, Divider, Tabs, Tab,
  InputAdornment, TextField
} from '@mui/material';
import {
  Add, MoreVert, Download, Share, Delete, Visibility,
  Description, Assignment, RequestQuote, DocumentScanner,
  Draw, Search, FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';

const mockDocuments = [
  { id: 1, name: 'Q4 Sales Proposal – TechCorp', type: 'Proposal', status: 'Sent', size: '2.4 MB', owner: 'Anjali S.', createdAt: '2024-11-10', relatedTo: 'TechCorp Ltd', signedBy: null },
  { id: 2, name: 'Annual Service Agreement – ABC Ltd', type: 'Agreement', status: 'Signed', size: '1.1 MB', owner: 'Ravi K.', createdAt: '2024-10-22', relatedTo: 'ABC Ltd', signedBy: 'Mohan Patel' },
  { id: 3, name: 'Quotation #QT-2024-108', type: 'Quotation', status: 'Draft', size: '0.8 MB', owner: 'Priya M.', createdAt: '2024-11-15', relatedTo: 'XYZ Pvt Ltd', signedBy: null },
  { id: 4, name: 'Invoice OCR – Nov 2024', type: 'OCR', status: 'Processed', size: '3.2 MB', owner: 'System', createdAt: '2024-11-12', relatedTo: null, signedBy: null },
  { id: 5, name: 'NDA – GlobalTech', type: 'Agreement', status: 'Pending Signature', size: '0.5 MB', owner: 'Anjali S.', createdAt: '2024-11-08', relatedTo: 'GlobalTech Inc', signedBy: null },
  { id: 6, name: 'Product Demo Proposal', type: 'Proposal', status: 'Viewed', size: '4.1 MB', owner: 'Ravi K.', createdAt: '2024-11-05', relatedTo: 'StartupXYZ', signedBy: null },
  { id: 7, name: 'Q3 Quotation – Pharma Corp', type: 'Quotation', status: 'Accepted', size: '1.3 MB', owner: 'Suresh N.', createdAt: '2024-10-01', relatedTo: 'Pharma Corp', signedBy: null },
];

const typeConfig = {
  Proposal: { icon: <Description />, color: '#1976d2' },
  Agreement: { icon: <Assignment />, color: '#388e3c' },
  Quotation: { icon: <RequestQuote />, color: '#f57c00' },
  OCR: { icon: <DocumentScanner />, color: '#9c27b0' },
  Signature: { icon: <Draw />, color: '#00796b' },
};

const stats = [
  { title: 'Total Documents', value: '48', subtitle: '7 this month', icon: <Description />, color: '#1976d2' },
  { title: 'Proposals', value: '12', subtitle: '4 pending', icon: <Assignment />, color: '#f57c00' },
  { title: 'Agreements', value: '18', subtitle: '3 awaiting signature', icon: <Draw />, color: '#388e3c' },
  { title: 'Quotations', value: '22', subtitle: '₹48L total value', icon: <RequestQuote />, color: '#9c27b0' },
];

export default function DocumentsList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [newAnchor, setNewAnchor] = useState(null);

  const types = ['All', 'Proposal', 'Agreement', 'Quotation', 'OCR'];
  const filtered = mockDocuments.filter(d => {
    const matchType = tab === 0 || d.type === types[tab];
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <Box>
      <PageHeader
        title="Documents"
        subtitle="Proposals, agreements, quotations and signed documents"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={(e) => setNewAnchor(e.currentTarget)}>
            New Document
          </Button>
        }
      />
      <Menu anchorEl={newAnchor} open={Boolean(newAnchor)} onClose={() => setNewAnchor(null)}>
        <MenuItem onClick={() => { navigate('/documents/proposal/new'); setNewAnchor(null); }}><Description sx={{ mr: 1 }} fontSize="small" /> New Proposal</MenuItem>
        <MenuItem onClick={() => { navigate('/documents/quotation/new'); setNewAnchor(null); }}><RequestQuote sx={{ mr: 1 }} fontSize="small" /> New Quotation</MenuItem>
        <MenuItem onClick={() => { navigate('/documents/agreement/new'); setNewAnchor(null); }}><Assignment sx={{ mr: 1 }} fontSize="small" /> New Agreement</MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/documents/ocr'); setNewAnchor(null); }}><DocumentScanner sx={{ mr: 1 }} fontSize="small" /> OCR Document</MenuItem>
        <MenuItem onClick={() => { navigate('/documents/signature'); setNewAnchor(null); }}><Draw sx={{ mr: 1 }} fontSize="small" /> Digital Signature</MenuItem>
      </Menu>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <Box sx={{ px: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
            {types.map((t) => <Tab key={t} label={t} />)}
          </Tabs>
          <TextField size="small" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ width: 240 }} />
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Related To</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((doc) => {
                const cfg = typeConfig[doc.type];
                return (
                  <TableRow key={doc.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/documents/${doc.id}`)}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: cfg?.color + '18', color: cfg?.color, width: 32, height: 32 }}>
                          {cfg?.icon}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{doc.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.type} size="small" sx={{ bgcolor: cfg?.color + '18', color: cfg?.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell><StatusBadge status={doc.status} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary">{doc.relatedTo || '—'}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{doc.owner}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{doc.createdAt}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{doc.size}</Typography></TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Download"><IconButton size="small"><Download fontSize="small" /></IconButton></Tooltip>
                      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVert fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem><Share fontSize="small" sx={{ mr: 1 }} /> Share</MenuItem>
        <MenuItem><Draw fontSize="small" sx={{ mr: 1 }} /> Send for Signature</MenuItem>
        <Divider />
        <MenuItem sx={{ color: 'error.main' }}><Delete fontSize="small" sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>
    </Box>
  );
}
