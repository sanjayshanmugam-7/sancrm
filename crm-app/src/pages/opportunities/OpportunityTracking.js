import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
  List, ListItem, ListItemText, ListItemAvatar, Divider, Paper, Tab, Tabs
} from '@mui/material';
import { TrendingUp, Schedule, CheckCircle, Warning, Add, Flag, Timeline } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';

const stageData = [
  { stage: 'Prospecting', count: 18, value: 3600000, color: '#90caf9' },
  { stage: 'Qualification', count: 12, value: 4800000, color: '#42a5f5' },
  { stage: 'Proposal', count: 8, value: 5200000, color: '#1976d2' },
  { stage: 'Negotiation', count: 5, value: 3800000, color: '#1565c0' },
  { stage: 'Closed Won', count: 14, value: 8400000, color: '#388e3c' },
  { stage: 'Closed Lost', count: 6, value: 0, color: '#e53935' },
];

const trendData = [
  { month: 'Jun', created: 8, closed: 4, lost: 2 },
  { month: 'Jul', created: 10, closed: 6, lost: 3 },
  { month: 'Aug', created: 12, closed: 8, lost: 2 },
  { month: 'Sep', created: 9, closed: 7, lost: 3 },
  { month: 'Oct', created: 15, closed: 10, lost: 2 },
  { month: 'Nov', created: 11, closed: 8, lost: 1 },
];

const recentMilestones = [
  { opp: 'TechCorp – CRM Implementation', stage: 'Proposal', event: 'Proposal sent and opened by client', date: '2024-11-15', flag: 'info' },
  { opp: 'GlobalTech – Enterprise License', stage: 'Negotiation', event: 'Price negotiation – counter offer received', date: '2024-11-14', flag: 'warning' },
  { opp: 'ABC Industries – Module Expansion', stage: 'Closed Won', event: '🎉 Deal closed! ₹2.2L', date: '2024-11-13', flag: 'success' },
  { opp: 'Pharma Corp – Basic Plan', stage: 'Closed Lost', event: 'Lost to competitor Salesforce', date: '2024-11-12', flag: 'error' },
  { opp: 'StartupXYZ – Starter Pack', stage: 'Qualification', event: 'Discovery call completed', date: '2024-11-11', flag: 'info' },
];

const flagColors = { info: '#1976d2', warning: '#f57c00', success: '#388e3c', error: '#d32f2f' };

export default function OpportunityTracking() {
  const [tab, setTab] = useState(0);
  const totalValue = stageData.slice(0, 4).reduce((s, d) => s + d.value, 0);
  const winRate = Math.round(14 / (14 + 6) * 100);

  return (
    <Box>
      <PageHeader
        title="Opportunity Tracking"
        subtitle="Track progress, milestones and performance across all opportunities"
        breadcrumbs={[{ label: 'Opportunities', href: '/opportunities' }, { label: 'Tracking' }]}
      />

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Pipeline Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, sub: '43 open deals', color: '#1976d2' },
          { label: 'Win Rate', value: `${winRate}%`, sub: '14 won / 6 lost', color: '#388e3c' },
          { label: 'Avg. Deal Size', value: '₹6.2L', sub: 'vs ₹5.1L last quarter', color: '#9c27b0' },
          { label: 'Avg. Sales Cycle', value: '38 days', sub: '-5 days vs last quarter', color: '#f57c00' },
        ].map(k => (
          <Grid item xs={6} sm={3} key={k.label}>
            <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${k.color}`, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} color={k.color}>{k.value}</Typography>
              <Typography variant="body2" fontWeight={600}>{k.label}</Typography>
              <Typography variant="caption" color="text.secondary">{k.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Stage funnel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pipeline by Stage</Typography>
              {stageData.map(s => (
                <Box key={s.stage} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }} />
                      <Typography variant="body2" fontWeight={500}>{s.stage}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">{s.count} deals</Typography>
                      <Typography variant="caption" fontWeight={600}>₹{(s.value / 100000).toFixed(1)}L</Typography>
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={s.count / 18 * 100} sx={{ height: 8, borderRadius: 4, bgcolor: s.color + '20', '& .MuiLinearProgress-bar': { bgcolor: s.color } }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Trend</Typography>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#1976d2" strokeWidth={2} name="Created" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="closed" stroke="#388e3c" strokeWidth={2} name="Won" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="lost" stroke="#e53935" strokeWidth={2} name="Lost" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Milestones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom><Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />Recent Milestones</Typography>
              <List>
                {recentMilestones.map((m, i) => (
                  <React.Fragment key={i}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: flagColors[m.flag] + '20', color: flagColors[m.flag], width: 36, height: 36 }}>
                          {m.flag === 'success' ? <CheckCircle /> : m.flag === 'warning' ? <Warning /> : <Flag />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight={600}>{m.opp}</Typography><Typography variant="caption" color="text.secondary">{m.date}</Typography></Box>}
                        secondary={<><Chip label={m.stage} size="small" sx={{ mr: 1, height: 16, fontSize: '0.65rem' }} /><Typography variant="caption">{m.event}</Typography></>}
                      />
                    </ListItem>
                    {i < recentMilestones.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
