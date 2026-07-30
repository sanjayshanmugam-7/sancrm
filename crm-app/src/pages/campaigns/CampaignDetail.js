import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, Divider, LinearProgress, Tab, Tabs, Table,
  TableBody, TableCell, TableHead, TableRow, List,
  ListItem, ListItemText, ListItemAvatar, IconButton
} from '@mui/material';
import {
  ArrowBack, Edit, PlayArrow, Pause, Stop, Email,
  OpenInNew, Mouse, CheckCircle, Cancel, BarChart,
  People, Schedule, AttachMoney
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AreaChart, Area, BarChart as ReBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const campaignData = {
  id: 1,
  name: 'Q4 Product Launch Email',
  type: 'Email',
  status: 'Active',
  subject: 'Introducing Our New CRM Features – Built for Your Growth',
  from: 'noreply@sancrm.com',
  audience: 'All Active Leads + Customers',
  totalRecipients: 4500,
  sent: 4500,
  delivered: 4400,
  opened: 1800,
  clicked: 720,
  converted: 144,
  unsubscribed: 32,
  bounced: 100,
  budget: 5000,
  spent: 3200,
  revenue: 72000,
  startDate: '2024-10-01',
  endDate: '2024-10-31',
  createdBy: 'Anjali Sharma',
};

const dailyData = [
  { day: 'Oct 1', sent: 900, opened: 380, clicked: 152 },
  { day: 'Oct 5', sent: 800, opened: 340, clicked: 136 },
  { day: 'Oct 10', sent: 750, opened: 310, clicked: 124 },
  { day: 'Oct 15', sent: 700, opened: 290, clicked: 116 },
  { day: 'Oct 20', sent: 650, opened: 270, clicked: 108 },
  { day: 'Oct 25', sent: 450, opened: 140, clicked: 56 },
  { day: 'Oct 31', sent: 250, opened: 70, clicked: 28 },
];

const deviceData = [
  { name: 'Mobile', value: 58 },
  { name: 'Desktop', value: 32 },
  { name: 'Tablet', value: 10 },
];

const COLORS = ['#1976d2', '#388e3c', '#f57c00'];

const topLinks = [
  { url: 'https://sancrm.com/features', clicks: 312, pct: 43 },
  { url: 'https://sancrm.com/pricing', clicks: 198, pct: 28 },
  { url: 'https://sancrm.com/demo', clicks: 140, pct: 19 },
  { url: 'https://sancrm.com/blog', clicks: 70, pct: 10 },
];

const MetricCard = ({ icon, label, value, sub, color }) => (
  <Card variant="outlined">
    <CardContent sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ color, mb: 1 }}>{icon}</Box>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </CardContent>
  </Card>
);

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState(0);

  const c = campaignData;
  const openRate = ((c.opened / c.delivered) * 100).toFixed(1);
  const clickRate = ((c.clicked / c.opened) * 100).toFixed(1);
  const convRate = ((c.converted / c.clicked) * 100).toFixed(1);
  const roi = (((c.revenue - c.spent) / c.spent) * 100).toFixed(0);

  return (
    <Box>
      <PageHeader
        title={c.name}
        subtitle={`${c.type} Campaign • ${c.startDate} → ${c.endDate}`}
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: c.name }]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Pause />} size="small">Pause</Button>
            <Button variant="contained" startIcon={<Edit />} size="small">Edit</Button>
          </Box>
        }
      />

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <Email />, label: 'Delivered', value: c.delivered.toLocaleString(), sub: `${((c.delivered / c.sent) * 100).toFixed(1)}% delivery rate`, color: '#1976d2' },
          { icon: <OpenInNew />, label: 'Opened', value: c.opened.toLocaleString(), sub: `${openRate}% open rate`, color: '#388e3c' },
          { icon: <Mouse />, label: 'Clicked', value: c.clicked.toLocaleString(), sub: `${clickRate}% CTR`, color: '#f57c00' },
          { icon: <CheckCircle />, label: 'Converted', value: c.converted.toLocaleString(), sub: `${convRate}% conv. rate`, color: '#9c27b0' },
          { icon: <Cancel />, label: 'Bounced', value: c.bounced.toLocaleString(), sub: `${((c.bounced / c.sent) * 100).toFixed(1)}% bounce rate`, color: '#d32f2f' },
          { icon: <AttachMoney />, label: 'ROI', value: `${roi}%`, sub: `Revenue: ₹${c.revenue.toLocaleString()}`, color: '#00796b' },
        ].map((m) => (
          <Grid item xs={6} sm={4} md={2} key={m.label}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left: Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Engagement Over Time" />
              <Tab label="Device Breakdown" />
              <Tab label="Top Links" />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sent" stackId="1" stroke="#90caf9" fill="#e3f2fd" name="Sent" />
                    <Area type="monotone" dataKey="opened" stackId="2" stroke="#1976d2" fill="#1976d240" name="Opened" />
                    <Area type="monotone" dataKey="clicked" stackId="3" stroke="#388e3c" fill="#388e3c40" name="Clicked" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {tab === 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                        {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box>
                    {deviceData.map((d, i) => (
                      <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[i] }} />
                        <Typography variant="body2">{d.name}: <strong>{d.value}%</strong></Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {tab === 2 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>URL</TableCell>
                      <TableCell align="right">Clicks</TableCell>
                      <TableCell sx={{ width: 180 }}>Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topLinks.map((link) => (
                      <TableRow key={link.url}>
                        <TableCell><Typography variant="caption" color="primary">{link.url}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={600}>{link.clicks}</Typography></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={link.pct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                            <Typography variant="caption">{link.pct}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Details */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Campaign Info</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                { label: 'Status', value: <StatusBadge status={c.status} /> },
                { label: 'Type', value: c.type },
                { label: 'Subject', value: c.subject },
                { label: 'From', value: c.from },
                { label: 'Audience', value: c.audience },
                { label: 'Recipients', value: c.totalRecipients.toLocaleString() },
                { label: 'Created By', value: c.createdBy },
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
              <Typography variant="h6" gutterBottom>Budget</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Spent</Typography>
                <Typography variant="body2" fontWeight={600}>₹{c.spent.toLocaleString()} / ₹{c.budget.toLocaleString()}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={(c.spent / c.budget) * 100} sx={{ height: 8, borderRadius: 4, mb: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Remaining</Typography>
                <Typography variant="caption" fontWeight={600} color="success.main">₹{(c.budget - c.spent).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
