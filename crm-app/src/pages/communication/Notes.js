import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Chip, Avatar, IconButton, Menu, MenuItem, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, InputAdornment,
  Paper, Tooltip, FormControl, InputLabel, Select
} from '@mui/material';
import {
  Add, Search, MoreVert, Edit, Delete, StickyNote2,
  PushPin, PushPinOutlined, Person, Business, FilterList
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockNotes = [
  { id: 1, title: 'TechCorp – Budget Discussion', content: 'Client mentioned they have a budget of ₹5–8L for CRM. Decision by end of November. Key stakeholders: Mohan (CTO) and Priya (CFO). They want mobile app support and API integration.', relatedTo: 'TechCorp Ltd', relatedType: 'Account', createdBy: 'Anjali Sharma', createdAt: '2024-11-15 10:45 AM', tags: ['Budget', 'Important'], pinned: true },
  { id: 2, title: 'Follow-up reminder – GlobalTech', content: 'Sarah mentioned she will review the proposal with her team by Nov 18. Need to follow up if no response by Nov 20. They are also evaluating Salesforce.', relatedTo: 'Sarah Johnson', relatedType: 'Contact', createdBy: 'Ravi Kumar', createdAt: '2024-11-14 03:30 PM', tags: ['Follow-up'], pinned: false },
  { id: 3, title: 'Product demo feedback', content: 'Vijay liked the pipeline view and AI lead scoring. Concerned about data migration from their current Excel-based system. Need to prepare migration guide.', relatedTo: 'GlobalTech Inc', relatedType: 'Account', createdBy: 'Anjali Sharma', createdAt: '2024-11-13 05:00 PM', tags: ['Demo', 'Feedback'], pinned: false },
  { id: 4, title: 'Pricing objection handling', content: 'Ramesh from Pharma Corp felt pricing was high compared to competition. Need to emphasize ROI and include case study from similar pharma company. Offer 3-month free support.', relatedTo: 'Ramesh Kumar', relatedType: 'Lead', createdBy: 'Ravi Kumar', createdAt: '2024-11-12 02:00 PM', tags: ['Objection', 'Pricing'], pinned: true },
  { id: 5, title: 'ABC Industries – IT team requirements', content: 'Their IT team wants SSO integration, audit logs, and role-based access control. Standard features covered. Custom reports might need additional scoping.', relatedTo: 'ABC Industries', relatedType: 'Account', createdBy: 'Priya Mehta', createdAt: '2024-11-11 11:15 AM', tags: ['Technical', 'Requirements'], pinned: false },
];

const tagColors = { Budget: 'warning', Important: 'error', 'Follow-up': 'info', Demo: 'secondary', Feedback: 'success', Objection: 'error', Pricing: 'warning', Technical: 'default', Requirements: 'primary' };
const relatedTypeConfig = { Account: { icon: <Business fontSize="small" />, color: '#1976d2' }, Contact: { icon: <Person fontSize="small" />, color: '#388e3c' }, Lead: { icon: <Person fontSize="small" />, color: '#f57c00' } };

export default function Notes() {
  const [notes, setNotes] = useState(mockNotes);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuNote, setMenuNote] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', relatedTo: '', relatedType: 'Account', tags: '' });

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.pinned - a.pinned);

  const handleSave = () => {
    if (editNote) {
      setNotes(prev => prev.map(n => n.id === editNote.id ? { ...n, ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) } : n));
    } else {
      setNotes(prev => [{ id: Date.now(), ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), pinned: false, createdBy: 'You', createdAt: new Date().toLocaleString() }, ...prev]);
    }
    setDialogOpen(false);
    setEditNote(null);
    setForm({ title: '', content: '', relatedTo: '', relatedType: 'Account', tags: '' });
  };

  const openEdit = (note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, relatedTo: note.relatedTo, relatedType: note.relatedType, tags: note.tags.join(', ') });
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const togglePin = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const deleteNote = (id) => { setNotes(prev => prev.filter(n => n.id !== id)); setAnchorEl(null); };

  return (
    <Box>
      <PageHeader
        title="Notes"
        subtitle="Capture important information about contacts, accounts and leads"
        action={<Button variant="contained" startIcon={<Add />} onClick={() => { setEditNote(null); setDialogOpen(true); }}>New Note</Button>}
      />

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField size="small" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ flex: 1, maxWidth: 340 }} />
      </Box>

      <Grid container spacing={2}>
        {filtered.map((note) => {
          const rtCfg = relatedTypeConfig[note.relatedType];
          return (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card variant="outlined" sx={{ height: '100%', position: 'relative', border: note.pinned ? '1.5px solid #1976d2' : '1px solid #e0e0e0', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 } }}>
                {note.pinned && (
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <PushPin sx={{ fontSize: 16, color: '#1976d2' }} />
                  </Box>
                )}
                <CardContent sx={{ pt: note.pinned ? 3 : 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ pr: 1 }}>{note.title}</Typography>
                    <IconButton size="small" onClick={e => { setAnchorEl(e.currentTarget); setMenuNote(note); }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.content}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    {note.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" color={tagColors[tag] || 'default'} variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                    ))}
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ color: rtCfg?.color }}>{rtCfg?.icon}</Box>
                      <Typography variant="caption" color="text.secondary">{note.relatedTo}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled">{note.createdAt.split(' ')[0]}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled">by {note.createdBy}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { togglePin(menuNote?.id); setAnchorEl(null); }}>
          {menuNote?.pinned ? <PushPinOutlined fontSize="small" sx={{ mr: 1 }} /> : <PushPin fontSize="small" sx={{ mr: 1 }} />}
          {menuNote?.pinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={() => openEdit(menuNote)}><Edit fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        <Divider />
        <MenuItem onClick={() => deleteNote(menuNote?.id)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editNote ? 'Edit Note' : 'New Note'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={5} label="Note Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </Grid>
            <Grid item xs={8}>
              <TextField fullWidth label="Related To" value={form.relatedTo} onChange={e => setForm(f => ({ ...f, relatedTo: e.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={form.relatedType} onChange={e => setForm(f => ({ ...f, relatedType: e.target.value }))} label="Type">
                  <MenuItem value="Account">Account</MenuItem>
                  <MenuItem value="Contact">Contact</MenuItem>
                  <MenuItem value="Lead">Lead</MenuItem>
                  <MenuItem value="Opportunity">Opportunity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Budget, Important, Follow-up" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
