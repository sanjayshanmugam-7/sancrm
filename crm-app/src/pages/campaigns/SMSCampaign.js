import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch, Paper, Alert,
  Chip, LinearProgress
} from '@mui/material';
import { Sms, Send, People, PhoneAndroid } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Setup', 'Audience', 'Message', 'Schedule'];
const SMS_LIMIT = 160;

export default function SMSCampaign() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', senderId: 'SANCRM', message: '', audience: 'all',
    scheduledAt: '', sendNow: false, includeOptOut: true, unicode: false,
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const msgLen = form.message.length;
  const smsCount = Math.ceil(msgLen / SMS_LIMIT) || 1;
  const remaining = SMS_LIMIT * smsCount - msgLen;

  const quickVars = ['{name}', '{company}', '{amount}', '{date}', '{link}'];

  return (
    <Box>
      <PageHeader
        title="New SMS Campaign"
        subtitle="Send bulk SMS to your contacts"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'New SMS Campaign' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>SMS Setup</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Campaign Name" name="name" value={form.name} onChange={handleChange} required />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Sender ID" name="senderId" value={form.senderId} onChange={handleChange}
                      helperText="Max 6 alphanumeric characters (DLT registered)" inputProps={{ maxLength: 6 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel control={
                      <Switch checked={form.unicode} onChange={(e) => setForm(f => ({ ...f, unicode: e.target.checked }))} />
                    } label="Unicode (for regional languages – limit 70 chars/SMS)" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#fff8e1' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="warning.dark">📋 DLT Compliance</Typography>
                <Typography variant="caption" color="text.secondary">
                  Ensure your Sender ID and message templates are registered with your telecom operator's DLT (Distributed Ledger Technology) platform as per TRAI regulations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Select Audience</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Audience</InputLabel>
                  <Select name="audience" value={form.audience} onChange={handleChange} label="Audience">
                    <MenuItem value="all">All Contacts with Phone (8,200)</MenuItem>
                    <MenuItem value="leads">Active Leads (2,400)</MenuItem>
                    <MenuItem value="customers">Customers Only (3,800)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 2, mt: 3, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <PhoneAndroid color="primary" />
              <Box>
                <Typography variant="h5" fontWeight={700}>8,200</Typography>
                <Typography variant="caption" color="text.secondary">verified mobile numbers</Typography>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Compose Message</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Quick Insert Variables:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {quickVars.map((v) => (
                      <Chip key={v} label={v} size="small" onClick={() => setForm(f => ({ ...f, message: f.message + v }))}
                        sx={{ cursor: 'pointer' }} />
                    ))}
                  </Box>
                </Box>
                <TextField
                  fullWidth multiline rows={5} name="message" value={form.message} onChange={handleChange}
                  label="SMS Message"
                  helperText={`${msgLen} characters • ${smsCount} SMS credit(s) • ${remaining} characters remaining`}
                />
                <LinearProgress variant="determinate" value={(msgLen % SMS_LIMIT) / SMS_LIMIT * 100}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }} color={remaining < 20 ? 'warning' : 'primary'} />
                <FormControlLabel sx={{ mt: 2 }} control={
                  <Switch checked={form.includeOptOut} onChange={(e) => setForm(f => ({ ...f, includeOptOut: e.target.checked }))} />
                } label='Auto-append opt-out text: "Reply STOP to unsubscribe"' />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: '#fafafa' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                <Box sx={{ bgcolor: '#25d366', color: 'white', borderRadius: 3, p: 2, display: 'inline-block', maxWidth: 260, textAlign: 'left', boxShadow: 3 }}>
                  <Typography variant="caption" fontWeight={700}>{form.senderId || 'SANCRM'}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {form.message || 'Your message will appear here...'}
                    {form.includeOptOut && form.message ? '\n\nReply STOP to unsubscribe.' : ''}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Schedule</Typography>
                <Divider sx={{ mb: 3 }} />
                <FormControlLabel control={
                  <Switch checked={form.sendNow} onChange={(e) => setForm(f => ({ ...f, sendNow: e.target.checked }))} />
                } label="Send Immediately" sx={{ mb: 2, display: 'flex' }} />
                {!form.sendNow && (
                  <TextField fullWidth type="datetime-local" label="Schedule Date & Time" name="scheduledAt"
                    value={form.scheduledAt} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                )}
                <Alert severity="info" sx={{ mt: 2 }}>
                  SMS campaigns are sent between 9 AM – 9 PM IST as per TRAI guidelines.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cost Estimate</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Recipients', value: '8,200' },
                  { label: 'SMS per Contact', value: smsCount },
                  { label: 'Total SMS', value: (8200 * smsCount).toLocaleString() },
                  { label: 'Rate per SMS', value: '₹0.15' },
                  { label: 'Estimated Cost', value: `₹${(8200 * smsCount * 0.15).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/campaigns') : setActiveStep(s => s - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button variant="contained" startIcon={activeStep === steps.length - 1 ? <Send /> : null}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? 'Send SMS Campaign' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
