import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Avatar, LinearProgress,
  Tabs, Tab, Menu, MenuItem, Divider
} from '@mui/material';
import {
  Add, Email, Sms, WhatsApp, Facebook, Google,
  Notifications, MoreVert, PlayArrow, Pause, Stop,
  BarChart, People, TrendingUp, Send
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';

const mockCampaigns = [
  { id: 1, name: 'Q4 Product Launch Email', type: 'Email', status: 'Active', sent: 4500, opened: 1800, clicked: 720, converted: 144, budget: 5000, spent: 3200, startDate: '2024-10-01', endDate: '2024-10-31' },
  { id: 2, name: 'Diwali Offers SMS Blast', type: 'SMS', status: 'Completed', sent: 10000, opened: 8500, clicked: 2100, converted: 630, budget: 2000, spent: 2000, startDate: '2024-10-20', endDate: '2024-10-25' },
  { id: 3, name: 'WhatsApp New Year Promo', type: 'WhatsApp', status: 'Draft', sent: 0, opened: 0, clicked: 0, converted: 0, budget: 3000, spent: 0, startDate: '2024-12-28', endDate: '2025-01-05' },
  { id: 4, name: 'Facebook Brand Awareness', type: 'Facebook', status: 'Active', sent: 25000, opened: 12000, clicked: 3600, converted: 360, budget: 10000, spent: 6500, startDate: '2024-10-15', endDate: '2024-11-15' },
  { id: 5, name: 'Google Search – CRM Keywords', type: 'Google', status: 'Paused', sent: 8000, opened: 8000, clicked: 1200, converted: 96, budget: 8000, spent: 4200, startDate: '2024-09-01', endDate: '2024-11-30' },
  { id: 6, name: 'App Re-engagement Push', type: 'Push', status: 'Active', sent: 15000, opened: 6000, clicked: 1800, converted: 270, budget: 1000, spent: 650, startDate: '2024-10-10', endDate: '2024-11-10' },
];

const channelConfig = {
  Email: { icon: <Email />, color: '#1976d2', newRoute: '/campaigns/email/new' },
  SMS: { icon: <Sms />, color: '#388e3c', newRoute: '/campaigns/sms/new' },
  WhatsApp: { icon: <WhatsApp />, color: '#25d366', newRoute: '/campaigns/whatsapp/new' },
  Facebook: { icon: <Facebook />, color: '#1877f2', newRoute: '/campaigns/facebook/new' },
  Google: { icon: <Google />, color: '#ea4335', newRoute: '/campaigns/google/new' },
  Push: { icon: <Notifications />, color: '#f57c00', newRoute: '/campaigns/push/new' },
};

const stats = [
  { title: 'Total Campaigns', value: '24', subtitle: '6 active', icon: <BarChart />, color: '#1976d2' },
  { title: 'Total Reach', value: '62.5K', subtitle: 'across all channels', icon: <People />, color: '#388e3c' },
  { title: 'Avg. Open Rate', value: '38.4%', subtitle: '+4.2% vs last month', icon: <TrendingUp />, color: '#f57c00' },
  { title: 'Total Conversions', value: '1,500', subtitle: 'Revenue: ₹7.5L', icon: <Send />, color: '#9c27b0' },
];

export default function CampaignsList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCampaign, setMenuCampaign] = useState(null);
  const [newAnchor, setNewAnchor] = useState(null);

  const channels = ['All', 'Email', 'SMS', 'WhatsApp', 'Facebook', 'Google', 'Push'];
  const filtered = tab === 0 ? mockCampaigns : mockCampaigns.filter(c => c.type === channels[tab]);

  const getOpenRate = (c) => c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : 0;
  const getClickRate = (c) => c.opened > 0 ? ((c.clicked / c.opened) * 100).toFixed(1) : 0;
  const getBudgetPct = (c) => c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;

  return (
    <Box>
      <PageHeader
        title="Campaigns"
        subtitle="Manage all marketing campaigns across channels"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={(e) => setNewAnchor(e.currentTarget)}
          >
            New Campaign
          </Button>
        }
      />
      <Menu anchorEl={newAnchor} open={Boolean(newAnchor)} onClose={() => setNewAnchor(null)}>
        {Object.entries(channelConfig).map(([type, cfg]) => (
          <MenuItem key={type} onClick={() => { navigate(cfg.newRoute); setNewAnchor(null); }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
              <Typography>{type} Campaign</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Channel Tabs */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {channels.map((ch, i) => (
            <Tab key={ch} label={ch} icon={i > 0 ? channelConfig[ch]?.icon : undefined} iconPosition="start" />
          ))}
        </Tabs>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Sent</TableCell>
                <TableCell align="right">Open Rate</TableCell>
                <TableCell align="right">Click Rate</TableCell>
                <TableCell align="right">Conversions</TableCell>
                <TableCell>Budget Usage</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((campaign) => {
                const cfg = channelConfig[campaign.type];
                return (
                  <TableRow key={campaign.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{campaign.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={cfg?.icon}
                        label={campaign.type}
                        size="small"
                        sx={{ bgcolor: cfg?.color + '18', color: cfg?.color, fontWeight: 600, '& .MuiChip-icon': { color: cfg?.color } }}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{campaign.sent.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={getOpenRate(campaign) > 30 ? 'success.main' : 'warning.main'} fontWeight={600}>
                        {getOpenRate(campaign)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{getClickRate(campaign)}%</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">{campaign.converted.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">₹{campaign.spent.toLocaleString()}</Typography>
                          <Typography variant="caption">{getBudgetPct(campaign)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getBudgetPct(campaign)}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={getBudgetPct(campaign) > 90 ? 'error' : getBudgetPct(campaign) > 70 ? 'warning' : 'primary'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{campaign.startDate}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">→ {campaign.endDate}</Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setMenuCampaign(campaign); }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}><PlayArrow fontSize="small" sx={{ mr: 1 }} /> Activate</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}><Pause fontSize="small" sx={{ mr: 1 }} /> Pause</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}><Stop fontSize="small" sx={{ mr: 1 }} /> Stop</MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)}><BarChart fontSize="small" sx={{ mr: 1 }} /> View Report</MenuItem>
      </Menu>
    </Box>
  );
}
