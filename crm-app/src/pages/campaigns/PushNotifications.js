import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch, Paper, Alert, Chip
} from '@mui/material';
import { Notifications, Send, PhoneAndroid, Web, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Compose', 'Audience', 'Schedule'];

const emojis = ['🎉', '🔥', '⚡', '💡', '🚀', '🎁', '📢', '✅', '❗', '💰'];

export default function PushNotifications() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '', body: '', icon: '', imageUrl: '', ctaUrl: '',
    badge: '', platform: 'both', audience: 'all',
    scheduledAt: '', sendNow: false, ttl: 86400, priority: 'high',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <Box>
      <PageHeader
        title="New Push Notification Campaign"
        subtitle="Send push notifications to web and mobile app users"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Push Notifications' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notification Content</Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Quick Emoji Insert:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {emojis.map((e) => (
                      <Chip key={e} label={e} size="small" onClick={() => setForm(f => ({ ...f, title: f.title + e }))}
                        sx={{ cursor: 'pointer', fontSize: '1rem' }} />
                    ))}
                  </Box>
                </Box>
                <TextField fullWidth label="Notification Title" name="title" value={form.title} onChange={handleChange}
                  inputProps={{ maxLength: 50 }} helperText={`${form.title.length}/50`} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} label="Notification Body" name="body" value={form.body} onChange={handleChange}
                  inputProps={{ maxLength: 150 }} helperText={`${form.body.length}/150 characters`} sx={{ mb: 2 }} />
                <TextField fullWidth label="Click URL (CTA)" name="ctaUrl" value={form.ctaUrl} onChange={handleChange}
                  placeholder="https://yourapp.com/offer" sx={{ mb: 2 }} />
                <TextField fullWidth label="Image URL (optional)" name="imageUrl" value={form.imageUrl} onChange={handleChange}
                  placeholder="https://..." sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select name="priority" value={form.priority} onChange={handleChange} label="Priority">
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Platform</InputLabel>
                      <Select name="platform" value={form.platform} onChange={handleChange} label="Platform">
                        <MenuItem value="both">Both (Web + Mobile)</MenuItem>
                        <MenuItem value="web"><Web fontSize="small" sx={{ mr: 1 }} />Web Only</MenuItem>
                        <MenuItem value="mobile"><PhoneAndroid fontSize="small" sx={{ mr: 1 }} />Mobile Only</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>Notification Preview</Typography>
            {/* Android Style */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Android Preview</Typography>
                <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2, p: 1.5, boxShadow: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Notifications sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" fontWeight={700}>{form.title || 'Notification Title'}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {form.body || 'Notification body text will appear here...'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled">now</Typography>
                  </Box>
                  {form.imageUrl && (
                    <Box sx={{ mt: 1, bgcolor: '#f5f5f5', height: 80, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Image Preview</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
            {/* Web Style */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Web Browser Preview</Typography>
                <Box sx={{ bgcolor: '#323232', color: 'white', borderRadius: 2, p: 1.5, boxShadow: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Notifications sx={{ fontSize: 16, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700}>{form.title || 'Notification Title'}</Typography>
                      <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                        {form.body || 'Body text...'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.5 }}>sancrm.com</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Target Audience</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Audience Segment</InputLabel>
                  <Select name="audience" value={form.audience} onChange={handleChange} label="Audience Segment">
                    <MenuItem value="all">All Subscribers (18,400)</MenuItem>
                    <MenuItem value="mobile">Mobile App Users (12,200)</MenuItem>
                    <MenuItem value="web">Web Subscribers (6,200)</MenuItem>
                    <MenuItem value="active">Active Users (last 30 days) (8,500)</MenuItem>
                    <MenuItem value="inactive">Inactive Users (9,900)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 2, mt: 3, display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: '#f3e5f5' }}>
              <Notifications color="secondary" />
              <Box>
                <Typography variant="h5" fontWeight={700}>18,400</Typography>
                <Typography variant="caption" color="text.secondary">subscribed devices will receive this notification</Typography>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom><Schedule /> Schedule</Typography>
                <Divider sx={{ mb: 3 }} />
                <FormControlLabel control={
                  <Switch checked={form.sendNow} onChange={(e) => setForm(f => ({ ...f, sendNow: e.target.checked }))} />
                } label="Send Immediately" sx={{ mb: 2, display: 'flex' }} />
                {!form.sendNow && (
                  <TextField fullWidth type="datetime-local" label="Schedule Date & Time" name="scheduledAt"
                    value={form.scheduledAt} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                )}
                <FormControl fullWidth>
                  <InputLabel>TTL (Time to Live)</InputLabel>
                  <Select name="ttl" value={form.ttl} onChange={handleChange} label="TTL (Time to Live)">
                    <MenuItem value={3600}>1 Hour</MenuItem>
                    <MenuItem value={86400}>1 Day</MenuItem>
                    <MenuItem value={604800}>1 Week</MenuItem>
                    <MenuItem value={0}>No Expiry</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Title', value: form.title || '—' },
                  { label: 'Platform', value: form.platform },
                  { label: 'Audience', value: form.audience },
                  { label: 'Priority', value: form.priority },
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/campaigns') : setActiveStep(s => s - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button variant="contained" color="secondary"
          startIcon={activeStep === steps.length - 1 ? <Send /> : <Notifications />}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? 'Send Push Notification' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
