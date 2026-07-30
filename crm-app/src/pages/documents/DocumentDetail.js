import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Divider, Avatar, List, ListItem, ListItemText, ListItemAvatar,
  IconButton, Tooltip, Tab, Tabs, Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/material';
import {
  ArrowBack, Download, Share, Edit, Draw, Description,
  Visibility, Email, Check, Schedule, Person, History
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const document = {
  id: 1,
  name: 'Q4 Sales Proposal – TechCorp',
  type: 'Proposal',
  status: 'Sent',
  size: '2.4 MB',
  pages: 12,
  owner: 'Anjali Sharma',
  createdAt: '2024-11-10',
  sentAt: '2024-11-10',
  expiresAt: '2024-12-10',
  relatedTo: 'TechCorp Ltd',
  relatedType: 'Account',
  opportunity: 'TechCorp – CRM Implementation',
  value: 250000,
  currency: 'INR',
  description: 'Comprehensive CRM implementation proposal covering all modules, integration, training, and 1-year support.',
  recipients: [
    { name: 'Mohan Patel', email: 'mohan@techcorp.com', viewed: true, viewedAt: '2024-11-11 10:32 AM', signed: false },
    { name: 'Priya Verma', email: 'priya@techcorp.com', viewed: false, viewedAt: null, signed: false },
  ],
  activities: [
    { action: 'Document Created', user: 'Anjali Sharma', date: '2024-11-10 09:00 AM', icon: 'create' },
    { action: 'Sent to TechCorp (Mohan Patel)', user: 'Anjali Sharma', date: '2024-11-10 09:15 AM', icon: 'send' },
    { action: 'Viewed by Mohan Patel', user: 'Mohan Patel', date: '2024-11-11 10:32 AM', icon: 'view' },
    { action: 'Reminder sent', user: 'System', date: '2024-11-14 09:00 AM', icon: 'reminder' },
  ],
};

export default function DocumentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState(0);

  const d = document;

  return (
    <Box>
      <PageHeader
        title={d.name}
        subtitle={`${d.type} • ${d.size} • ${d.pages} pages`}
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: d.name }]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download />} size="small">Download</Button>
            <Button variant="outlined" startIcon={<Share />} size="small">Share</Button>
            <Button variant="contained" startIcon={<Draw />} size="small">Send for Signature</Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Document Preview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ bgcolor: '#f5f5f5', height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px 12px 0 0' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Description sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">{d.name}</Typography>
                <Typography variant="body2" color="text.disabled">{d.pages} pages • {d.size}</Typography>
                <Button variant="contained" sx={{ mt: 2 }} startIcon={<Visibility />}>View Full Document</Button>
              </Box>
            </Box>
          </Card>

          {/* Recipients & Activity */}
          <Card>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tab label="Recipients" />
              <Tab label="Activity" />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <List>
                  {d.recipients.map((r, i) => (
                    <ListItem key={i} divider={i < d.recipients.length - 1}
                      secondaryAction={
                        <Chip label={r.signed ? 'Signed' : r.viewed ? 'Viewed' : 'Not Opened'}
                          size="small" color={r.signed ? 'success' : r.viewed ? 'info' : 'default'} />
                      }>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: r.viewed ? '#e8f5e9' : '#f5f5f5', color: r.viewed ? '#388e3c' : '#9e9e9e' }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={r.name}
                        secondary={
                          <span>
                            {r.email}
                            {r.viewed && <span style={{ display: 'block', fontSize: '0.75rem' }}>Viewed: {r.viewedAt}</span>}
                          </span>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              {tab === 1 && (
                <List dense>
                  {d.activities.map((a, i) => (
                    <ListItem key={i} divider={i < d.activities.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd', color: '#1976d2' }}>
                          {a.icon === 'view' ? <Visibility fontSize="small" /> :
                            a.icon === 'send' ? <Email fontSize="small" /> :
                              a.icon === 'reminder' ? <Schedule fontSize="small" /> : <History fontSize="small" />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={a.action}
                        secondary={`${a.user} • ${a.date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Details Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Document Info</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Type', value: d.type },
                { label: 'Status', value: <StatusBadge status={d.status} /> },
                { label: 'Owner', value: d.owner },
                { label: 'Related To', value: d.relatedTo },
                { label: 'Opportunity', value: d.opportunity },
                { label: 'Value', value: `₹${d.value.toLocaleString()}` },
                { label: 'Created', value: d.createdAt },
                { label: 'Sent', value: d.sentAt },
                { label: 'Expires', value: d.expiresAt },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500} align="right" sx={{ maxWidth: '55%' }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Signature Status</Typography>
              <Divider sx={{ mb: 2 }} />
              {d.recipients.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#1976d2' }}>
                      {r.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="body2">{r.name}</Typography>
                  </Box>
                  {r.signed
                    ? <Chip icon={<Check />} label="Signed" size="small" color="success" />
                    : <Button size="small" variant="outlined" startIcon={<Email />}>Remind</Button>}
                </Box>
              ))}
              <Button fullWidth variant="contained" startIcon={<Draw />} sx={{ mt: 1 }}>
                Send Signature Request
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
