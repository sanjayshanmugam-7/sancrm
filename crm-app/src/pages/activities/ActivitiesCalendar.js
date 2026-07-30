import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper, Tabs, Tab } from '@mui/material';
import { Add, Phone, Email, VideoCall, NotificationsActive, Event } from '@mui/icons-material';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const typeIcons = {
  call: <Phone sx={{ fontSize: 16, color: '#1976d2' }} />,
  meeting: <VideoCall sx={{ fontSize: 16, color: '#f57c00' }} />,
  email: <Email sx={{ fontSize: 16, color: '#388e3c' }} />,
  followup: <NotificationsActive sx={{ fontSize: 16, color: '#9c27b0' }} />,
};

const typeColors = { call: '#1976d2', meeting: '#f57c00', email: '#388e3c', followup: '#9c27b0' };
const typeBg = { call: '#e3f2fd', meeting: '#fff3e0', email: '#e8f5e9', followup: '#f3e5f5' };

const ActivitiesCalendar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(s => s.activities);
  const [tab, setTab] = useState(0);

  useEffect(() => { dispatch(fetchActivities()); }, [dispatch]);

  const today = items.filter(a => a.scheduledAt?.startsWith('2024-01-20') || a.scheduledAt?.startsWith('2024-01-25'));
  const upcoming = items.filter(a => a.status === 'scheduled' || a.status === 'pending');
  const completed = items.filter(a => a.status === 'completed');

  const stats = [
    { label: 'Today', value: today.length, color: '#1976d2' },
    { label: 'Upcoming', value: upcoming.length, color: '#f57c00' },
    { label: 'Completed', value: completed.length, color: '#388e3c' },
    { label: 'Total', value: items.length, color: '#9c27b0' },
  ];

  const ActivityItem = ({ activity }) => (
    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
      <ListItemAvatar>
        <Avatar sx={{ width: 36, height: 36, bgcolor: typeBg[activity.type], borderRadius: 2 }}>
          {typeIcons[activity.type]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{activity.subject}</Typography>
            <StatusBadge status={activity.priority} size="small" />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="caption" color="text.secondary">{activity.contactName} · {activity.accountName}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
              <Typography variant="caption" color="primary" fontWeight={600}>{activity.scheduledAt?.slice(0, 16).replace('T', ' ')}</Typography>
              <StatusBadge status={activity.status} size="small" />
            </Box>
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Box>
      <PageHeader
        title="Activities"
        subtitle="Manage calls, meetings, emails and follow-ups"
        breadcrumbs={[{ label: 'Activities' }]}
        actions={[
          { label: 'Log Call', icon: <Phone />, onClick: () => navigate('/activities/calls'), variant: 'outlined' },
          { label: 'Schedule Meeting', icon: <VideoCall />, onClick: () => navigate('/activities/meetings'), variant: 'outlined' },
          { label: 'Add Activity', icon: <Add />, onClick: () => {}, variant: 'contained' },
        ]}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Activity Types Quick Nav */}
        <Grid item xs={12} md={3}>
          <Grid container spacing={1.5}>
            {[
              { label: 'Calls', icon: <Phone />, count: items.filter(a => a.type === 'call').length, color: '#1976d2', path: '/activities/calls' },
              { label: 'Meetings', icon: <VideoCall />, count: items.filter(a => a.type === 'meeting').length, color: '#f57c00', path: '/activities/meetings' },
              { label: 'Emails', icon: <Email />, count: items.filter(a => a.type === 'email').length, color: '#388e3c', path: '/activities/emails' },
              { label: 'Follow-ups', icon: <NotificationsActive />, count: items.filter(a => a.type === 'followup').length, color: '#9c27b0', path: '/activities/followups' },
            ].map((item) => (
              <Grid item xs={6} md={12} key={item.label}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3, borderColor: item.color }, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s' }} onClick={() => navigate(item.path)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: `${item.color}18`, color: item.color, borderRadius: 1.5 }}>{item.icon}</Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: item.color, lineHeight: 1 }}>{item.count}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Main Activity List */}
        <Grid item xs={12} md={9}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                <Tab label={`All (${items.length})`} />
                <Tab label={`Upcoming (${upcoming.length})`} />
                <Tab label={`Completed (${completed.length})`} />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <List disablePadding>
                {(tab === 0 ? items : tab === 1 ? upcoming : completed).map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivitiesCalendar;
