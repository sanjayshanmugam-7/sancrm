import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button,
  Tabs, Tab, Divider, List, ListItem, ListItemText, ListItemAvatar,
  TextField, IconButton, Tooltip, Paper, LinearProgress,
} from '@mui/material';
import {
  Edit, Delete, Loop, Phone, Email, WhatsApp, Add, AttachFile,
  Note, History, AccountTree, Event, Send, AutoAwesome, ArrowBack,
} from '@mui/icons-material';
import { fetchLeadById } from '../../store/slices/leadsSlice';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';
import PageHeader from '../../components/common/PageHeader';

const mockHistory = [
  { id: 1, type: 'call', message: 'Outbound call - Discussed requirements. Duration: 45 mins', user: 'Ravi Kumar', time: 'Jan 20, 2024 10:45 AM', outcome: 'positive' },
  { id: 2, type: 'email', message: 'Sent product brochure and pricing document', user: 'Ravi Kumar', time: 'Jan 19, 2024 2:00 PM', outcome: null },
  { id: 3, type: 'note', message: 'Client mentioned they are evaluating 3 vendors. Decision expected by Feb end.', user: 'Ravi Kumar', time: 'Jan 18, 2024 4:30 PM', outcome: null },
  { id: 4, type: 'whatsapp', message: 'Sent introductory message on WhatsApp', user: 'Ravi Kumar', time: 'Jan 16, 2024 11:00 AM', outcome: 'read' },
];

const mockNotes = [
  { id: 1, content: 'Very interested in the enterprise plan. Budget approved for Q1. Key decision maker is the CTO.', user: 'Ravi Kumar', time: 'Jan 20, 2024', pinned: true },
  { id: 2, content: 'Mentioned competitor pricing is 15% lower. Need to offer custom discount.', user: 'Sneha Rao', time: 'Jan 18, 2024', pinned: false },
];

const mockAttachments = [
  { id: 1, name: 'Product_Brochure.pdf', size: '2.4 MB', type: 'pdf', uploadedBy: 'Ravi Kumar', time: 'Jan 19, 2024' },
  { id: 2, name: 'Pricing_Sheet_Q1.xlsx', size: '0.8 MB', type: 'excel', uploadedBy: 'Ravi Kumar', time: 'Jan 19, 2024' },
  { id: 3, name: 'Meeting_Notes.docx', size: '0.3 MB', type: 'word', uploadedBy: 'Ravi Kumar', time: 'Jan 20, 2024' },
];

const TabPanel = ({ value, index, children }) => value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedLead: lead, items } = useSelector((s) => s.leads);
  const [tab, setTab] = useState(0);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    dispatch(fetchLeadById(id));
  }, [id, dispatch]);

  const currentLead = lead || items.find(l => l.id === id);
  if (!currentLead) return <Box sx={{ p: 3 }}><Typography>Lead not found</Typography></Box>;

  const getHistoryIcon = (type) => {
    if (type === 'call') return <Phone sx={{ fontSize: 16, color: '#1976d2' }} />;
    if (type === 'email') return <Email sx={{ fontSize: 16, color: '#388e3c' }} />;
    if (type === 'whatsapp') return <WhatsApp sx={{ fontSize: 16, color: '#2e7d32' }} />;
    return <Note sx={{ fontSize: 16, color: '#f57c00' }} />;
  };

  return (
    <Box>
      <PageHeader
        title={`${currentLead.firstName} ${currentLead.lastName}`}
        subtitle={`${currentLead.company} · ${currentLead.industry}`}
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: `${currentLead.firstName} ${currentLead.lastName}` }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' },
          { label: 'Convert', icon: <Loop />, onClick: () => navigate(`/leads/conversion?id=${id}`), variant: 'outlined', color: 'success' },
          { label: 'Edit', icon: <Edit />, onClick: () => navigate(`/leads/${id}/edit`), variant: 'outlined' },
          { label: 'Delete', icon: <Delete />, onClick: () => {}, variant: 'outlined', color: 'error' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Left Panel */}
        <Grid item xs={12} md={4}>
          {/* Lead Summary Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: '#1976d220', color: '#1976d2', fontSize: '1.5rem', fontWeight: 700, mb: 1.5 }}>
                  {currentLead.firstName?.[0]}{currentLead.lastName?.[0]}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{currentLead.firstName} {currentLead.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">{currentLead.company}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatusBadge status={currentLead.status} />
                  <AIScoreBadge score={currentLead.aiScore} tooltip={`AI Score: ${currentLead.aiScore}/100`} />
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1.5 }}>
                <Tooltip title="Call"><IconButton size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}><Phone fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Email"><IconButton size="small" sx={{ bgcolor: '#e8f5e9', color: '#388e3c' }}><Email fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="WhatsApp"><IconButton size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}><WhatsApp fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Schedule Meeting"><IconButton size="small" sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}><Event fontSize="small" /></IconButton></Tooltip>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              {/* Details */}
              {[
                { label: 'Email', value: currentLead.email },
                { label: 'Phone', value: currentLead.phone },
                { label: 'Source', value: currentLead.source },
                { label: 'Assigned To', value: currentLead.assignedTo },
                { label: 'Industry', value: currentLead.industry },
                { label: 'Budget', value: currentLead.budget },
                { label: 'Created', value: currentLead.createdAt },
                { label: 'Last Activity', value: currentLead.lastActivity },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.72rem' }}>{label}</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500, textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '-'}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* AI Prediction Card */}
          <Card sx={{ bgcolor: '#f3e5f518', border: '1px solid #e1bee7' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesome sx={{ color: '#9c27b0', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#7b1fa2">AI Prediction</Typography>
              </Box>
              <Typography variant="body2" fontSize="0.8rem" sx={{ mb: 1 }}>Win Probability</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <LinearProgress variant="determinate" value={currentLead.aiScore} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#e1bee7', '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0' } }} />
                <Typography variant="body2" fontWeight={700} color="#7b1fa2">{currentLead.aiScore}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                💡 {currentLead.notes || 'Schedule a follow-up call to advance this lead.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Overview" />
                <Tab label="Communication History" />
                <Tab label="Notes" />
                <Tab label="Attachments" />
                <Tab label="Activities" />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              {/* Overview */}
              <TabPanel value={tab} index={0}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Status', value: <StatusBadge status={currentLead.status} /> },
                    { label: 'AI Score', value: <AIScoreBadge score={currentLead.aiScore} showBar /> },
                    { label: 'Source', value: currentLead.source },
                    { label: 'Industry', value: currentLead.industry },
                    { label: 'Budget', value: currentLead.budget },
                    { label: 'Assigned To', value: currentLead.assignedTo },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em' }}>{label}</Typography>
                      <Box sx={{ mt: 0.25 }}>{typeof value === 'string' ? <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography> : value}</Box>
                    </Grid>
                  ))}
                </Grid>
                {currentLead.tags?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em', mb: 0.75, display: 'block' }}>Tags</Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {currentLead.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />)}
                    </Box>
                  </Box>
                )}
                {currentLead.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.05em', mb: 0.75, display: 'block' }}>Notes</Typography>
                    <Typography variant="body2" color="text.secondary">{currentLead.notes}</Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Communication History */}
              <TabPanel value={tab} index={1}>
                <List disablePadding>
                  {mockHistory.map((h) => (
                    <ListItem key={h.id} alignItems="flex-start" sx={{ px: 0, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#f4f6f8' }}>
                          {getHistoryIcon(h.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500} fontSize="0.875rem">{h.message}</Typography>}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">{h.user}</Typography>
                            <Typography variant="caption" color="text.secondary">·</Typography>
                            <Typography variant="caption" color="text.secondary">{h.time}</Typography>
                            {h.outcome && <Chip label={h.outcome} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.65rem', ml: 0.5, '& .MuiChip-label': { px: 0.75 } }} />}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              {/* Notes */}
              <TabPanel value={tab} index={2}>
                <Box sx={{ mb: 2 }}>
                  <TextField fullWidth multiline rows={3} placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} size="small"
                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <Button variant="contained" size="small" startIcon={<Send />} disabled={!newNote.trim()} onClick={() => setNewNote('')} sx={{ borderRadius: 2 }}>
                    Add Note
                  </Button>
                </Box>
                {mockNotes.map((note) => (
                  <Paper key={note.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: note.pinned ? '#fff9c4' : '#fff', borderColor: note.pinned ? '#f9a825' : 'divider' }}>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.875rem' }}>{note.content}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Avatar sx={{ width: 18, height: 18, fontSize: '0.6rem', bgcolor: '#1976d2' }}>{note.user[0]}</Avatar>
                      <Typography variant="caption" color="text.secondary">{note.user} · {note.time}</Typography>
                      {note.pinned && <Chip label="Pinned" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#f9a825', color: '#fff', ml: 'auto' }} />}
                    </Box>
                  </Paper>
                ))}
              </TabPanel>

              {/* Attachments */}
              <TabPanel value={tab} index={3}>
                <Button variant="outlined" startIcon={<AttachFile />} sx={{ mb: 2, borderRadius: 2 }} size="small">Upload File</Button>
                {mockAttachments.map((file) => (
                  <Paper key={file.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#e3f2fd', color: '#1976d2', borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 700 }}>
                      {file.type.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{file.size} · {file.uploadedBy} · {file.time}</Typography>
                    </Box>
                    <Button size="small" variant="text" sx={{ fontSize: '0.75rem' }}>Download</Button>
                  </Paper>
                ))}
              </TabPanel>

              {/* Activities */}
              <TabPanel value={tab} index={4}>
                <Button variant="outlined" startIcon={<Add />} sx={{ mb: 2, borderRadius: 2 }} size="small">Add Activity</Button>
                <Typography variant="body2" color="text.secondary">No activities recorded yet.</Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadDetail;
