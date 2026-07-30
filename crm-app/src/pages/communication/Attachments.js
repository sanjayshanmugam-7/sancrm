import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Tooltip, TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Divider, LinearProgress, Paper
} from '@mui/material';
import {
  AttachFile, Upload, Download, Delete, Visibility, Search,
  PictureAsPdf, Image, Description, TableChart, Archive,
  VideoFile, AudioFile, CloudUpload, FolderOpen
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const fileTypeConfig = {
  pdf: { icon: <PictureAsPdf />, color: '#d32f2f', label: 'PDF' },
  doc: { icon: <Description />, color: '#1976d2', label: 'Word' },
  docx: { icon: <Description />, color: '#1976d2', label: 'Word' },
  xls: { icon: <TableChart />, color: '#388e3c', label: 'Excel' },
  xlsx: { icon: <TableChart />, color: '#388e3c', label: 'Excel' },
  jpg: { icon: <Image />, color: '#f57c00', label: 'Image' },
  jpeg: { icon: <Image />, color: '#f57c00', label: 'Image' },
  png: { icon: <Image />, color: '#f57c00', label: 'Image' },
  zip: { icon: <Archive />, color: '#616161', label: 'Archive' },
  mp4: { icon: <VideoFile />, color: '#9c27b0', label: 'Video' },
  mp3: { icon: <AudioFile />, color: '#00796b', label: 'Audio' },
};

const getExt = (name) => name.split('.').pop().toLowerCase();

const mockAttachments = [
  { id: 1, name: 'TechCorp_Proposal_Q4_2024.pdf', size: '2.4 MB', relatedTo: 'TechCorp Ltd', relatedType: 'Account', uploadedBy: 'Anjali Sharma', uploadedAt: '2024-11-10', category: 'Proposal' },
  { id: 2, name: 'NDA_GlobalTech_Signed.pdf', size: '0.5 MB', relatedTo: 'GlobalTech Inc', relatedType: 'Account', uploadedBy: 'Ravi Kumar', uploadedAt: '2024-11-08', category: 'Agreement' },
  { id: 3, name: 'ABC_Requirements.docx', size: '0.3 MB', relatedTo: 'ABC Industries', relatedType: 'Account', uploadedBy: 'Priya Mehta', uploadedAt: '2024-11-07', category: 'Document' },
  { id: 4, name: 'Demo_Presentation.pdf', size: '5.8 MB', relatedTo: 'Vijay Desai', relatedType: 'Contact', uploadedBy: 'Anjali Sharma', uploadedAt: '2024-11-05', category: 'Presentation' },
  { id: 5, name: 'Pricing_Sheet_2024.xlsx', size: '0.2 MB', relatedTo: 'All', relatedType: 'Internal', uploadedBy: 'Ravi Kumar', uploadedAt: '2024-10-25', category: 'Price List' },
  { id: 6, name: 'Product_Screenshots.zip', size: '12.1 MB', relatedTo: 'All Leads', relatedType: 'Marketing', uploadedBy: 'Priya Mehta', uploadedAt: '2024-10-20', category: 'Marketing' },
  { id: 7, name: 'Support_Policy.pdf', size: '0.8 MB', relatedTo: 'All Customers', relatedType: 'Internal', uploadedBy: 'System', uploadedAt: '2024-10-01', category: 'Policy' },
  { id: 8, name: 'Mohan_BusinessCard.jpg', size: '0.1 MB', relatedTo: 'Mohan Patel', relatedType: 'Contact', uploadedBy: 'Anjali Sharma', uploadedAt: '2024-11-15', category: 'Contact Info' },
];

const categories = ['All', 'Proposal', 'Agreement', 'Document', 'Presentation', 'Price List', 'Marketing', 'Policy', 'Contact Info'];

export default function Attachments() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dragging, setDragging] = useState(false);

  const filtered = mockAttachments.filter(a => {
    const matchCat = category === 'All' || a.category === category;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.relatedTo.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalSize = mockAttachments.reduce((s, a) => s + parseFloat(a.size), 0).toFixed(1);

  return (
    <Box>
      <PageHeader
        title="Attachments"
        subtitle="All files and documents attached to contacts, accounts and leads"
        action={<Button variant="contained" startIcon={<Upload />}>Upload File</Button>}
      />

      {/* Upload zone */}
      <Card
        sx={{
          mb: 3, border: `2px dashed ${dragging ? '#1976d2' : '#e0e0e0'}`,
          bgcolor: dragging ? '#e3f2fd' : '#fafafa', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CloudUpload sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
          <Typography variant="body1" fontWeight={600}>Drag & drop files here or <Button size="small" variant="text">Browse</Button></Typography>
          <Typography variant="caption" color="text.secondary">Supports PDF, Word, Excel, Images, ZIP (max 50MB per file)</Typography>
        </CardContent>
      </Card>

      {/* Storage stat */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Files', value: mockAttachments.length.toString() },
          { label: 'Total Storage', value: `${totalSize} MB` },
          { label: 'Uploaded This Month', value: '12' },
          { label: 'Shared Files', value: '8' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} color="primary">{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ width: 260 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={e => setCategory(e.target.value)} label="Category">
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Related To</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(file => {
              const ext = getExt(file.name);
              const cfg = fileTypeConfig[ext] || { icon: <AttachFile />, color: '#616161', label: ext.toUpperCase() };
              return (
                <TableRow key={file.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: cfg.color + '18', color: cfg.color, width: 32, height: 32 }}>{cfg.icon}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
                        <Chip label={cfg.label} size="small" sx={{ height: 14, fontSize: '0.6rem', mt: 0.3 }} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={file.category} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">{file.relatedTo}</Typography>
                    <Typography variant="caption" color="text.secondary">{file.relatedType}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{file.uploadedBy}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{file.uploadedAt}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{file.size}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Preview"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Download"><IconButton size="small"><Download fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error"><Delete fontSize="small" /></IconButton></Tooltip>
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
