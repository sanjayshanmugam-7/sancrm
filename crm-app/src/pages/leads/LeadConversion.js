import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Grid, Typography, Button, Switch,
  FormControlLabel, Divider, Alert, Stepper, Step, StepLabel, Chip,
} from '@mui/material';
import { Loop, Check, People, Business, TrendingUp, ArrowBack } from '@mui/icons-material';
import { convertLead } from '../../store/slices/leadsSlice';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';

const LeadConversion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('id') || '1';
  const { items } = useSelector(s => s.leads);
  const lead = items.find(l => l.id === leadId) || items[0];

  const [createContact, setCreateContact] = useState(true);
  const [createAccount, setCreateAccount] = useState(true);
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const [contactData, setContactData] = useState({ firstName: lead?.firstName || '', lastName: lead?.lastName || '', email: lead?.email || '', phone: lead?.phone || '', jobTitle: '' });
  const [accountData, setAccountData] = useState({ name: lead?.company || '', industry: lead?.industry || '', website: '' });
  const [oppData, setOppData] = useState({ title: `${lead?.company || ''} - New Opportunity`, value: '', stage: 'qualified', assignedTo: lead?.assignedTo || '' });

  const handleConvert = async () => {
    setConverting(true);
    await new Promise(r => setTimeout(r, 2000));
    setConverting(false);
    setDone(true);
  };

  if (!lead) return <Box p={3}><Typography>Lead not found</Typography></Box>;

  return (
    <Box>
      <PageHeader
        title="Convert Lead"
        subtitle={`Converting ${lead.firstName} ${lead.lastName} from ${lead.company}`}
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: 'Lead Conversion' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' }]}
      />

      {done ? (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Check sx={{ fontSize: 64, color: '#388e3c', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Lead Converted Successfully!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {createContact && '✅ Contact created. '}{createAccount && '✅ Account created. '}{createOpportunity && '✅ Opportunity created.'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/contacts')} sx={{ mr: 1.5, borderRadius: 2 }}>View Contacts</Button>
            <Button variant="outlined" onClick={() => navigate('/leads')} sx={{ borderRadius: 2 }}>Back to Leads</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Lead Summary */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
              <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Loop sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Converting Lead: {lead.firstName} {lead.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">{lead.email} · {lead.phone} · {lead.company}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Conversion */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <People sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>Create Contact</Typography>
                  </Box>
                  <Switch size="small" checked={createContact} onChange={(e) => setCreateContact(e.target.checked)} />
                </Box>
                {createContact && (
                  <Grid container spacing={1.5}>
                    {Object.entries({ firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone', jobTitle: 'Job Title' }).map(([k, l]) => (
                      <Grid item xs={12} key={k}>
                        <FormField name={k} label={l} value={contactData[k]} onChange={(e) => setContactData(p => ({ ...p, [k]: e.target.value }))} size="small" />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Account Conversion */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Business sx={{ color: '#388e3c', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>Create Account</Typography>
                  </Box>
                  <Switch size="small" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                </Box>
                {createAccount && (
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}><FormField name="name" label="Account Name" value={accountData.name} onChange={(e) => setAccountData(p => ({ ...p, name: e.target.value }))} size="small" /></Grid>
                    <Grid item xs={12}><FormField type="select" name="industry" label="Industry" value={accountData.industry} onChange={(e) => setAccountData(p => ({ ...p, industry: e.target.value }))} size="small"
                      options={['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'].map(s => ({ label: s, value: s }))} /></Grid>
                    <Grid item xs={12}><FormField name="website" label="Website" value={accountData.website} onChange={(e) => setAccountData(p => ({ ...p, website: e.target.value }))} size="small" /></Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Opportunity Conversion */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TrendingUp sx={{ color: '#f57c00', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>Create Opportunity</Typography>
                  </Box>
                  <Switch size="small" checked={createOpportunity} onChange={(e) => setCreateOpportunity(e.target.checked)} />
                </Box>
                {createOpportunity && (
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}><FormField name="title" label="Opportunity Title" value={oppData.title} onChange={(e) => setOppData(p => ({ ...p, title: e.target.value }))} size="small" /></Grid>
                    <Grid item xs={12}><FormField name="value" label="Deal Value (₹)" type="number" value={oppData.value} onChange={(e) => setOppData(p => ({ ...p, value: e.target.value }))} size="small" /></Grid>
                    <Grid item xs={12}>
                      <FormField type="select" name="stage" label="Stage" value={oppData.stage} onChange={(e) => setOppData(p => ({ ...p, stage: e.target.value }))} size="small"
                        options={['lead', 'qualified', 'proposal', 'negotiation'].map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))} />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Convert Button */}
          <Grid item xs={12}>
            <Button variant="contained" size="large" startIcon={<Loop />} onClick={handleConvert} disabled={converting || (!createContact && !createAccount && !createOpportunity)}
              sx={{ borderRadius: 2, px: 4 }}>
              {converting ? 'Converting...' : 'Convert Lead'}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LeadConversion;
