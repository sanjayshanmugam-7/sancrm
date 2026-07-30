import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, Chip, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch,
  IconButton, Alert, Paper, Avatar
} from '@mui/material';
import { Email, People, Schedule, Preview, Send, Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Setup', 'Audience', 'Design', 'Schedule & Send'];

const templates = [
  { id: 1, name: 'Product Launch', thumbnail: '📢', desc: 'Announce a new product or feature' },
  { id: 2, name: 'Newsletter', thumbnail: '📰', desc: 'Regular updates & news' },
  { id: 3, name: 'Promotion', thumbnail: '🎉', desc: 'Offer discounts and deals' },
  { id: 4, name: 'Follow Up', thumbnail: '🔁', desc: 'Re-engage with leads' },
  { id: 5, name: 'Welcome', thumbnail: '👋', desc: 'Onboard new contacts' },
  { id: 6, name: 'Blank', thumbnail: '📄', desc: 'Start from scratch' },
];

export default function EmailMarketing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', subject: '', previewText: '', fromName: 'SanCRM', fromEmail: 'noreply@sancrm.com',
    replyTo: '', template: null, audience: 'all', segments: [], scheduledAt: '', sendNow: false,
    trackOpens: true, trackClicks: true, unsubLink: true,
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <Box>
      <PageHeader
        title="New Email Campaign"
        subtitle="Create and send a targeted email campaign"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'New Email Campaign' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Setup */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Campaign Details</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Campaign Name" name="name" value={form.name} onChange={handleChange} required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Email Subject Line" name="subject" value={form.subject} onChange={handleChange} required
                      helperText="This is what recipients see in their inbox. Keep it under 60 characters." />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Preview Text" name="previewText" value={form.previewText} onChange={handleChange}
                      helperText="Short summary that appears after the subject line in email clients." />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="From Name" name="fromName" value={form.fromName} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="From Email" name="fromEmail" value={form.fromEmail} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Reply-To Email" name="replyTo" value={form.replyTo} onChange={handleChange} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tracking Options</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { key: 'trackOpens', label: 'Track Opens' },
                  { key: 'trackClicks', label: 'Track Clicks' },
                  { key: 'unsubLink', label: 'Include Unsubscribe Link' },
                ].map(({ key, label }) => (
                  <FormControlLabel key={key} control={
                    <Switch checked={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))} color="primary" />
                  } label={label} sx={{ display: 'flex', mb: 1 }} />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Audience */}
      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Select Audience</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Audience Type</InputLabel>
                  <Select name="audience" value={form.audience} onChange={handleChange} label="Audience Type">
                    <MenuItem value="all">All Contacts (12,450)</MenuItem>
                    <MenuItem value="leads">All Leads (3,200)</MenuItem>
                    <MenuItem value="customers">Existing Customers (4,800)</MenuItem>
                    <MenuItem value="segment">Custom Segment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Estimated Reach</Typography>
              <Paper variant="outlined" sx={{ p: 2, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight={700}>12,450</Typography>
                  <Typography variant="caption" color="text.secondary">recipients will receive this email</Typography>
                </Box>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Template */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Choose a Template</Typography>
          <Grid container spacing={2}>
            {templates.map((t) => (
              <Grid item xs={6} sm={4} md={2} key={t.id}>
                <Card
                  variant="outlined"
                  onClick={() => setForm(f => ({ ...f, template: t.id }))}
                  sx={{
                    cursor: 'pointer', textAlign: 'center', p: 2,
                    border: form.template === t.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    bgcolor: form.template === t.id ? '#e3f2fd' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#1976d2', transform: 'translateY(-2px)' }
                  }}
                >
                  <Typography fontSize={36}>{t.thumbnail}</Typography>
                  <Typography variant="body2" fontWeight={600} mt={1}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          {form.template && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Template selected. In a real app, a drag-and-drop email editor would open here.
            </Alert>
          )}
        </Box>
      )}

      {/* Step 3: Schedule */}
      {activeStep === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Schedule Campaign</Typography>
                <Divider sx={{ mb: 3 }} />
                <FormControlLabel control={
                  <Switch checked={form.sendNow} onChange={(e) => setForm(f => ({ ...f, sendNow: e.target.checked }))} />
                } label="Send Immediately" sx={{ mb: 2, display: 'flex' }} />
                {!form.sendNow && (
                  <TextField fullWidth type="datetime-local" label="Schedule Date & Time" name="scheduledAt"
                    value={form.scheduledAt} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Campaign Name', value: form.name || '—' },
                  { label: 'Subject', value: form.subject || '—' },
                  { label: 'From', value: `${form.fromName} <${form.fromEmail}>` },
                  { label: 'Audience', value: form.audience },
                  { label: 'Template', value: templates.find(t => t.id === form.template)?.name || '—' },
                  { label: 'Schedule', value: form.sendNow ? 'Send Now' : form.scheduledAt || '—' },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={500}>{value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/campaigns') : setActiveStep(s => s - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="contained"
          startIcon={activeStep === steps.length - 1 ? <Send /> : null}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}
        >
          {activeStep === steps.length - 1 ? 'Launch Campaign' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
