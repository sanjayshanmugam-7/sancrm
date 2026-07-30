import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText, Button, Chip, LinearProgress, IconButton } from '@mui/material';
import { TrendingUp, People, Business, Campaign, Phone, Email, Event, ArrowForward, MoreVert, PersonAdd } from '@mui/icons-material';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import AIScoreBadge from '../components/common/AIScoreBadge';

const revenueData = [
  { month: 'Jul', revenue: 4200000, target: 4000000 },
  { month: 'Aug', revenue: 3800000, target: 4200000 },
  { month: 'Sep', revenue: 5100000, target: 4500000 },
  { month: 'Oct', revenue: 4700000, target: 5000000 },
  { month: 'Nov', revenue: 5500000, target: 5200000 },
  { month: 'Dec', revenue: 6200000, target: 5500000 },
  { month: 'Jan', revenue: 5800000, target: 6000000 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: '#1976d2' },
  { name: 'Google Ads', value: 25, color: '#388e3c' },
  { name: 'Facebook', value: 18, color: '#1565c0' },
  { name: 'WhatsApp', value: 12, color: '#2e7d32' },
  { name: 'Referral', value: 10, color: '#f57c00' },
];

const pipelineData = [
  { stage: 'Lead', count: 45, value: 8500000 },
  { stage: 'Qualified', count: 28, value: 15200000 },
  { stage: 'Proposal', count: 15, value: 22800000 },
  { stage: 'Negotiation', count: 8, value: 18600000 },
  { stage: 'Closed Won', count: 12, value: 34500000 },
];

const activityData = [
  { day: 'Mon', calls: 12, emails: 25, meetings: 4 },
  { day: 'Tue', calls: 18, emails: 30, meetings: 6 },
  { day: 'Wed', calls: 15, emails: 22, meetings: 3 },
  { day: 'Thu', calls: 22, emails: 35, meetings: 8 },
  { day: 'Fri', calls: 19, emails: 28, meetings: 5 },
  { day: 'Sat', calls: 8, emails: 12, meetings: 2 },
  { day: 'Sun', calls: 5, emails: 8, meetings: 1 },
];

const recentLeads = [
  { id: '1', name: 'Arjun Sharma', company: 'TechCorp India', status: 'new', aiScore: 87, source: 'Website', time: '5 min ago' },
  { id: '2', name: 'Priya Patel', company: 'Retail Solutions', status: 'contacted', aiScore: 62, source: 'Facebook', time: '30 min ago' },
  { id: '3', name: 'Rohit Verma', company: 'Manufacturing Co', status: 'qualified', aiScore: 91, source: 'Google Ads', time: '1 hr ago' },
  { id: '4', name: 'Ananya Singh', company: 'FinServ Ltd', status: 'proposal', aiScore: 74, source: 'WhatsApp', time: '2 hr ago' },
];

const upcomingActivities = [
  { type: 'meeting', title: 'Product Demo with Priya Patel', time: 'Today, 2:00 PM', company: 'Retail Solutions', priority: 'high' },
  { type: 'call', title: 'Follow-up Call - Rohit Verma', time: 'Today, 4:30 PM', company: 'Manufacturing Co', priority: 'medium' },
  { type: 'followup', title: 'Send Proposal - FinServ Ltd', time: 'Tomorrow, 10:00 AM', company: 'FinServ Ltd', priority: 'urgent' },
  { type: 'email', title: 'Re-engagement Email - TechCorp', time: 'Tomorrow, 9:00 AM', company: 'TechCorp India', priority: 'low' },
];

const formatCurrency = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const COLORS = ['#1976d2', '#388e3c', '#1565c0', '#2e7d32', '#f57c00'];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Welcome back, Ravi Kumar! Here's what's happening today.</Typography>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Total Leads', value: '248', subtitle: '18 new today', icon: <PersonAdd />, color: '#1976d2', trendValue: 12 },
          { title: 'Active Contacts', value: '1,842', subtitle: '45 added this week', icon: <People />, color: '#388e3c', trendValue: 8 },
          { title: 'Open Opportunities', value: '67', subtitle: '₹8.5 Cr pipeline', icon: <TrendingUp />, color: '#f57c00', trendValue: 15 },
          { title: 'Active Accounts', value: '134', subtitle: '12 new this month', icon: <Business />, color: '#9c27b0', trendValue: 5 },
          { title: 'Campaigns Running', value: '7', subtitle: '3 email, 2 SMS, 2 other', icon: <Campaign />, color: '#0288d1', trendValue: -2 },
          { title: 'Monthly Revenue', value: '₹58L', subtitle: 'vs ₹55L target', icon: <TrendingUp />, color: '#2e7d32', trendValue: 5.4 },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Revenue Overview</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Monthly revenue vs target</Typography>
                </Box>
                <Chip label="Last 7 months" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              </Box>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#388e3c" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#388e3c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} width={50} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1976d2" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#1976d2' }} />
                  <Area type="monotone" dataKey="target" name="Target" stroke="#388e3c" strokeWidth={2} strokeDasharray="5 5" fill="url(#targetGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Lead Source Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Lead Sources</Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem" sx={{ mb: 1.5 }}>This month's distribution</Typography>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {leadSourceData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 1 }}>
                {leadSourceData.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i] }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{item.name}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem' }}>{item.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Pipeline Funnel */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Sales Pipeline</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Deal stages overview</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => navigate('/opportunities/pipeline')} sx={{ fontSize: '0.75rem' }}>
                  View Pipeline
                </Button>
              </Box>
              {pipelineData.map((stage, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontSize="0.8rem" fontWeight={500}>{stage.stage}</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">{stage.count} deals</Typography>
                      <Typography variant="caption" fontWeight={700}>{formatCurrency(stage.value)}</Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stage.count / 45) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: `${COLORS[i]}20`, '& .MuiLinearProgress-bar': { bgcolor: COLORS[i], borderRadius: 3 } }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Chart */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Activity This Week</Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Calls, emails and meetings</Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="calls" name="Calls" fill="#1976d2" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="emails" name="Emails" fill="#388e3c" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="meetings" name="Meetings" fill="#f57c00" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={2.5}>
        {/* Recent Leads */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>Recent Leads</Typography>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => navigate('/leads')} sx={{ fontSize: '0.75rem' }}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <List disablePadding>
                {recentLeads.map((lead) => (
                  <ListItem
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    sx={{ px: 0, py: 1, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 'none' }, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                    secondaryAction={<AIScoreBadge score={lead.aiScore} size="small" />}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d220', color: '#1976d2', fontSize: '0.85rem', fontWeight: 700 }}>
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{lead.name}</Typography>}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">{lead.company}</Typography>
                          <StatusBadge status={lead.status} />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>Upcoming Activities</Typography>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => navigate('/activities')} sx={{ fontSize: '0.75rem' }}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <List disablePadding>
                {upcomingActivities.map((act, i) => (
                  <ListItem
                    key={i}
                    sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 'none' } }}
                    secondaryAction={<StatusBadge status={act.priority} size="small" />}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: act.type === 'meeting' ? '#f57c0018' : act.type === 'call' ? '#1976d218' : '#38 8e3c18', borderRadius: 2 }}>
                        {act.type === 'meeting' ? <Event sx={{ fontSize: 18, color: '#f57c00' }} /> : act.type === 'call' ? <Phone sx={{ fontSize: 18, color: '#1976d2' }} /> : <Email sx={{ fontSize: 18, color: '#388e3c' }} />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{act.title}</Typography>}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="primary" fontSize="0.75rem" fontWeight={600}>{act.time}</Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.75rem"> · {act.company}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
