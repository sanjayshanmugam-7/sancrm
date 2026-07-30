import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Divider, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Alert, Chip, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton
} from '@mui/material';
import { Save, Send, Add, Delete, Assignment, Draw } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const agreementTypes = ['Non-Disclosure Agreement (NDA)', 'Service Level Agreement (SLA)', 'Master Service Agreement (MSA)', 'Subscription Agreement', 'Partnership Agreement', 'Employment Contract', 'Vendor Agreement'];

export default function AgreementForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', agreementType: '', client: '', contact: '',
    startDate: '', endDate: '', autoRenew: false, renewalNoticeDays: 30,
    governingLaw: 'Maharashtra, India', currency: 'INR', value: '',
    content: `AGREEMENT\n\nThis Agreement is entered into as of [DATE] between [PARTY A] and [PARTY B].\n\n1. SCOPE OF SERVICES\n[Describe the services to be provided]\n\n2. PAYMENT TERMS\n[Describe payment terms and schedule]\n\n3. CONFIDENTIALITY\nBoth parties agree to maintain the confidentiality of proprietary information...\n\n4. TERM AND TERMINATION\nThis agreement shall be effective from the start date and continue until...\n\n5. GOVERNING LAW\nThis Agreement shall be governed by the laws of [Jurisdiction].`,
    signatories: [
      { name: '', email: '', role: 'Authorized Signatory', order: 1 },
      { name: '', email: '', role: 'Client Representative', order: 2 },
    ],
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addSignatory = () => setForm(f => ({
    ...f,
    signatories: [...f.signatories, { name: '', email: '', role: '', order: f.signatories.length + 1 }]
  }));
  const removeSignatory = (idx) => setForm(f => ({ ...f, signatories: f.signatories.filter((_, i) => i !== idx) }));
  const updateSignatory = (idx, field, value) => {
    const sigs = [...form.signatories];
    sigs[idx] = { ...sigs[idx], [field]: value };
    setForm(f => ({ ...f, signatories: sigs }));
  };

  return (
    <Box>
      <PageHeader
        title="Create Agreement"
        subtitle="Draft a legal agreement for e-signature"
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'New Agreement' }]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Basic Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Agreement Details</Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth required label="Agreement Title" name="title" value={form.title} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Agreement Type</InputLabel>
                    <Select name="agreementType" value={form.agreementType} onChange={handleChange} label="Agreement Type">
                      {agreementTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Client / Party B</InputLabel>
                    <Select name="client" value={form.client} onChange={handleChange} label="Client / Party B">
                      <MenuItem value="techcorp">TechCorp Ltd</MenuItem>
                      <MenuItem value="abc">ABC Industries</MenuItem>
                      <MenuItem value="globaltech">GlobalTech Inc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="date" label="Start Date" name="startDate" value={form.startDate}
                    onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth type="date" label="End Date" name="endDate" value={form.endDate}
                    onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Contract Value (₹)" name="value" value={form.value} onChange={handleChange} type="number" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth label="Governing Law" name="governingLaw" value={form.governingLaw} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel control={
                    <Switch checked={form.autoRenew} onChange={(e) => setForm(f => ({ ...f, autoRenew: e.target.checked }))} />
                  } label="Auto-Renew" />
                  {form.autoRenew && (
                    <TextField type="number" label="Renewal Notice (days)" value={form.renewalNoticeDays}
                      onChange={(e) => setForm(f => ({ ...f, renewalNoticeDays: e.target.value }))}
                      size="small" sx={{ ml: 2, width: 180 }} />
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Agreement Content */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Agreement Content</Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info" sx={{ mb: 2 }}>
                Edit the agreement content below. Use placeholders like [DATE], [PARTY A] etc. which will be auto-filled.
              </Alert>
              <TextField fullWidth multiline rows={18} name="content" value={form.content} onChange={handleChange}
                sx={{ fontFamily: 'monospace', '& textarea': { fontFamily: 'Georgia, serif', lineHeight: 1.8 } }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={4}>
          {/* Signatories */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Signatories</Typography>
                <Button size="small" startIcon={<Add />} onClick={addSignatory}>Add</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {form.signatories.map((sig, i) => (
                <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip label={`Signatory ${i + 1}`} size="small" color={i === 0 ? 'primary' : 'default'} />
                    {i > 0 && <IconButton size="small" onClick={() => removeSignatory(i)}><Delete fontSize="small" /></IconButton>}
                  </Box>
                  <TextField fullWidth size="small" label="Full Name" value={sig.name}
                    onChange={(e) => updateSignatory(i, 'name', e.target.value)} sx={{ mb: 1 }} />
                  <TextField fullWidth size="small" label="Email" value={sig.email}
                    onChange={(e) => updateSignatory(i, 'email', e.target.value)} sx={{ mb: 1 }} />
                  <TextField fullWidth size="small" label="Role / Designation" value={sig.role}
                    onChange={(e) => updateSignatory(i, 'role', e.target.value)} />
                </Box>
              ))}
              <Alert severity="info" sx={{ mt: 1 }} icon={<Draw fontSize="small" />}>
                All signatories will receive an e-signature request via email.
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Actions</Typography>
              <Divider sx={{ mb: 2 }} />
              <Button fullWidth variant="outlined" startIcon={<Save />} sx={{ mb: 1 }} onClick={() => navigate('/documents')}>
                Save as Draft
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Assignment />} sx={{ mb: 1 }}>
                Preview Agreement
              </Button>
              <Button fullWidth variant="contained" startIcon={<Draw />} onClick={() => navigate('/documents')}>
                Send for Signature
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
