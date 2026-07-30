import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Tabs, Tab, Chip, Button, Divider, Avatar, LinearProgress, Paper } from '@mui/material';
import { Edit, Delete, ArrowBack, LocationOn, Phone, Email, Language, Business } from '@mui/icons-material';
import { fetchAccountById } from '../../store/slices/accountsSlice';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const TabPanel = ({ value, index, children }) => value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.accounts);
  const [tab, setTab] = useState(0);

  useEffect(() => { dispatch(fetchAccountById(id)); }, [id, dispatch]);

  const account = items.find(a => a.id === id);
  if (!account) return <Box p={3}><Typography>Account not found</Typography></Box>;

  const branches = items.filter(a => a.parentId === id);

  return (
    <Box>
      <PageHeader
        title={account.name}
        subtitle={`${account.type} · ${account.industry}`}
        breadcrumbs={[{ label: 'Accounts', path: '/accounts' }, { label: account.name }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/accounts'), variant: 'outlined' },
          { label: 'Edit', icon: <Edit />, onClick: () => navigate(`/accounts/${id}/edit`), variant: 'outlined' },
          { label: 'Delete', icon: <Delete />, onClick: () => {}, variant: 'outlined', color: 'error' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Left */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: '#388e3c20', color: '#388e3c', borderRadius: 2, fontSize: '1.2rem', fontWeight: 700 }}>{account.name?.[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{account.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25 }}>
                    <Chip label={account.type} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20, textTransform: 'capitalize' }} />
                    <StatusBadge status={account.status} />
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              {[
                { icon: <Phone sx={{ fontSize: 14 }} />, value: account.phone },
                { icon: <Email sx={{ fontSize: 14 }} />, value: account.email },
                { icon: <Language sx={{ fontSize: 14 }} />, value: account.website },
              ].map((item, i) => item.value && (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                  <Typography variant="caption">{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Credit Limit */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Credit Limit</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Used / Limit</Typography>
                <Typography variant="caption" fontWeight={700}>₹{(account.creditUsed / 100000).toFixed(1)}L / ₹{(account.creditLimit / 100000).toFixed(1)}L</Typography>
              </Box>
              <LinearProgress variant="determinate" value={(account.creditUsed / account.creditLimit) * 100}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: account.creditUsed / account.creditLimit > 0.8 ? '#d32f2f' : '#388e3c' } }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {Math.round((account.creditUsed / account.creditLimit) * 100)}% utilized
              </Typography>
            </CardContent>
          </Card>

          {/* GST */}
          {account.gst?.registered && (
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>GST Details</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">GST Number</Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{account.gst.number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">State</Typography>
                  <Typography variant="caption" fontWeight={500}>{account.gst.state}</Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Info" /><Tab label="Branches" /><Tab label="Contacts" /><Tab label="Opportunities" /><Tab label="Documents" />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <TabPanel value={tab} index={0}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Category', value: account.category },
                    { label: 'Employees', value: account.employeeCount },
                    { label: 'Annual Revenue', value: account.annualRevenue },
                    { label: 'Primary Contact', value: account.primaryContact },
                    { label: 'Created', value: account.createdAt },
                    { label: 'Status', value: <StatusBadge status={account.status} /> },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>{label}</Typography>
                      <Box sx={{ mt: 0.25 }}>{typeof value === 'string' || typeof value === 'number' ? <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography> : value}</Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Billing Address</Typography>
                    {account.billingAddress && (
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {account.billingAddress.street}<br />
                        {account.billingAddress.city}, {account.billingAddress.state} {account.billingAddress.pincode}<br />
                        {account.billingAddress.country}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>Shipping Address</Typography>
                    {account.shippingAddress && (
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {account.shippingAddress.street}<br />
                        {account.shippingAddress.city}, {account.shippingAddress.state} {account.shippingAddress.pincode}<br />
                        {account.shippingAddress.country}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {account.tags?.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {account.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />)}
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={tab} index={1}>
                {branches.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No branches found for this account.</Typography>
                ) : branches.map(branch => (
                  <Paper key={branch.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${branch.id}`)}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Business sx={{ color: '#388e3c', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{branch.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{branch.email} · {branch.phone}</Typography>
                      </Box>
                      <StatusBadge status={branch.status} sx={{ ml: 'auto' }} />
                    </Box>
                  </Paper>
                ))}
              </TabPanel>

              <TabPanel value={tab} index={2}>
                <Typography variant="body2" color="text.secondary">Contacts associated with this account will appear here.</Typography>
              </TabPanel>
              <TabPanel value={tab} index={3}>
                <Typography variant="body2" color="text.secondary">Opportunities for this account will appear here.</Typography>
              </TabPanel>
              <TabPanel value={tab} index={4}>
                <Typography variant="body2" color="text.secondary">Documents for this account will appear here.</Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountDetail;
