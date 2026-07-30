import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Chip, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider, IconButton,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Tab, Tabs, Tooltip, Paper
} from '@mui/material';
import {
  Phone, Email, WhatsApp, Message, Chat, Search, Add,
  FilterList, PlayCircle, OpenInNew, Schedule, Person,
  Facebook, Instagram, VideoCall
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const channelConfig = {
  Call: { icon: <Phone />, color: '#1976d2', bg: '#e3f2fd' },
  Email: { icon: <Email />, color: '#388e3c', bg: '#e8f5e9' },
  WhatsApp: { icon: <WhatsApp />, color: '#25d366', bg: '#e8f5e9' },
  SMS: { icon: <Message />, color: '#f57c00', bg: '#fff8e1' },
  Meeting: { icon: <VideoCall />, color: '#9c27b0', bg: '#f3e5f5' },
  Facebook: { icon: <Facebook />, color: '#1877f2', bg: '#e8f0fe' },
  Instagram: { icon: <Instagram />, color: '#e1306c', bg: '#fce4ec' },
  Chat: { icon: <Chat />, color: '#00796b', bg: '#e0f2f1' },
};

const mockHistory = [
  { id: 1, channel: 'Call', direction: 'Inbound', contact: 'Mohan Patel', company: 'TechCorp Ltd', subject: 'Enquiry about CRM pricing', duration: '8m 32s', status: 'Completed', date: '2024-11-15 10:30 AM', agent: 'Anjali S.', notes: 'Client interested in Enterprise plan. Follow-up scheduled.' },
  { id: 2, channel: 'Email', direction: 'Outbound', contact: 'Priya Verma', company: 'ABC Industries', subject: 'Proposal for Q4 2024', duration: null, status: 'Opened', date: '2024-11-14 02:15 PM', agent: 'Ravi K.', notes: 'Sent proposal document. Client opened 3 times.' },
  { id: 3, channel: 'WhatsApp', direction: 'Outbound', contact: 'Suresh Nair', company: 'XYZ Pvt Ltd', subject: 'Demo confirmation', duration: null, status: 'Delivered', date: '2024-11-14 11:00 AM', agent: 'Priya M.', notes: 'Confirmed product demo for Nov 18.' },
  { id: 4, channel: 'Meeting', direction: 'Outbound', contact: 'Vijay Desai', company: 'GlobalTech Inc', subject: 'Product walkthrough – 45 mins', duration: '45m 10s', status: 'Completed', date: '2024-11-13 03:00 PM', agent: 'Anjali S.', notes: 'Demo completed. Shared deck. Decision by Nov 20.' },
  { id: 5, channel: 'SMS', direction: 'Outbound', contact: 'Kavita Rao', company: 'StartupABC', subject: 'Reminder: Free trial expires', duration: null, status: 'Delivered', date: '2024-11-13 09:00 AM', agent: 'System', notes: 'Auto-triggered reminder SMS.' },
  { id: 6, channel: 'Call', direction: 'Outbound', contact: 'Ramesh Kumar', company: 'Pharma Corp', subject: 'Follow-up on proposal', duration: '3m 15s', status: 'No Answer', date: '2024-11-12 04:45 PM', agent: 'Ravi K.', notes: 'No answer. Left voicemail.' },
  { id: 7, channel: 'Email', direction: 'Inbound', contact: 'Sarah Johnson', company: 'GlobalTech Inc', subject: 'RE: Proposal – need clarification', duration: null, status: 'Replied', date: '2024-11-12 01:30 PM', agent: 'Anjali S.', notes: 'Client asked about API integration options.' },
  { id: 8, channel: 'Facebook', direction: 'Inbound', contact: 'Lead #1092', company: null, subject: 'Product inquiry via Facebook Messenger', duration: null, status: 'Responded', date: '2024-11-11 06:20 PM', agent: 'Priya M.', notes: 'Sent pricing brochure via Messenger.' },
];

const stats = [
  { label: 'Total Interactions', value: '1,248', color: '#1976d2' },
  { label: 'This Month', value: '186', color: '#388e3c' },
  { label: 'Inbound', value: '524', color: '#f57c00' },
  { label: 'Outbound', value: '724', color: '#9c27b0' },
];

export default function CommunicationHistory() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [selected, setSelected] = useState(mockHistory[0]);

  const channels = ['All', ...Object.keys(channelConfig)];
  const filtered = mockHistory.filter(h => {
    const matchChannel = channelFilter === 'All' || h.channel === channelFilter;
    const matchSearch = !search || h.contact.toLowerCase().includes(search.toLowerCase()) || h.subject.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  });

  return (
    <Box>
      <PageHeader
        title="Communication History"
        subtitle="All interactions across calls, emails, WhatsApp, SMS and social channels"
        action={<Button variant="contained" startIcon={<Add />}>Log Interaction</Button>}
      />

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* List */}
        <Grid item xs={12} md={selected ? 5 : 12}>
          <Card>
            <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
              <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 160 }} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Channel</InputLabel>
                <Select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} label="Channel">
                  {channels.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <List disablePadding>
              {filtered.map((item, idx) => {
                const cfg = channelConfig[item.channel];
                return (
                  <React.Fragment key={item.id}>
                    <ListItem
                      button
                      alignItems="flex-start"
                      selected={selected?.id === item.id}
                      onClick={() => setSelected(item)}
                      sx={{ px: 2, py: 1.5, '&.Mui-selected': { bgcolor: '#e3f2fd' } }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: cfg.bg, color: cfg.color, width: 38, height: 38 }}>
                          {cfg.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{item.subject}</Typography>
                            <Typography variant="caption" color="text.disabled">{item.date.split(' ')[1] + ' ' + item.date.split(' ')[2]}</Typography>
                          </Box>
                        }
                        secondary={
                          <span>
                            <Typography variant="caption" component="span" color="text.secondary">{item.contact}</Typography>
                            {item.company && <Typography variant="caption" component="span" color="text.disabled"> · {item.company}</Typography>}
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                              <Chip label={item.channel} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: cfg.bg, color: cfg.color }} />
                              <Chip label={item.direction} size="small" sx={{ height: 16, fontSize: '0.6rem' }} variant="outlined" />
                            </Box>
                          </span>
                        }
                      />
                    </ListItem>
                    {idx < filtered.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
        </Grid>

        {/* Detail */}
        {selected && (
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                {(() => {
                  const cfg = channelConfig[selected.channel];
                  return (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: cfg.bg, color: cfg.color, width: 44, height: 44 }}>{cfg.icon}</Avatar>
                          <Box>
                            <Typography variant="h6">{selected.subject}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                              <Chip label={selected.channel} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color }} />
                              <Chip label={selected.direction} size="small" variant="outlined" />
                              <StatusBadge status={selected.status} />
                            </Box>
                          </Box>
                        </Box>
                        <Button size="small" onClick={() => setSelected(null)}>Close</Button>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        {[
                          { label: 'Contact', value: selected.contact },
                          { label: 'Company', value: selected.company || '—' },
                          { label: 'Date & Time', value: selected.date },
                          { label: 'Agent', value: selected.agent },
                          { label: 'Duration', value: selected.duration || 'N/A' },
                          { label: 'Status', value: <StatusBadge status={selected.status} /> },
                        ].map(({ label, value }) => (
                          <Grid item xs={6} key={label}>
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                            <Typography variant="body2" fontWeight={500}>{value}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      {selected.notes && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 2 }}>
                            <Typography variant="body2">{selected.notes}</Typography>
                          </Paper>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                        {selected.channel === 'Call' && <Button variant="outlined" size="small" startIcon={<PlayCircle />}>Play Recording</Button>}
                        <Button variant="outlined" size="small" startIcon={<OpenInNew />}>View Contact</Button>
                        <Button variant="contained" size="small" startIcon={<Add />}>Follow Up</Button>
                      </Box>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
