import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch, Paper, Alert,
  Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar
} from '@mui/material';
import { WhatsApp, Send, AttachFile, Image, VideoLibrary } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Template', 'Audience', 'Personalize', 'Schedule'];

const waTemplates = [
  { id: 1, name: 'welcome_message', category: 'UTILITY', language: 'en', preview: 'Hello {{1}}, welcome to SanCRM! Your account is now active.' },
  { id: 2, name: 'payment_reminder', category: 'UTILITY', language: 'en', preview: 'Dear {{1}}, your invoice #{{2}} of ₹{{3}} is due on {{4}}.' },
  { id: 3, name: 'promotional_offer', category: 'MARKETING', language: 'en', preview: 'Hi {{1}}! 🎉 Exclusive offer just for you: {{2}} off on {{3}}. Valid till {{4}}.' },
  { id: 4, name: 'meeting_reminder', category: 'UTILITY', language: 'en', preview: 'Reminder: Your meeting with {{1}} is scheduled on {{2}} at {{3}}.' },
  { id: 5, name: 'festive_wishes', category: 'MARKETING', language: 'en', preview: 'Wishing you and your family a very Happy {{1}}! 🙏 – Team SanCRM' },
];

export default function WhatsAppCampaign() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', template: null, audience: 'all', mediaType: 'none',
    variables: ['John Doe', 'INV-001', '5000', '30 Nov 2024'],
    scheduledAt: '', sendNow: false,
  });

  const selected = waTemplates.find(t => t.id === form.template);

  const renderPreview = () => {
    if (!selected) return 'Select a template to preview...';
    let text = selected.preview;
    form.variables.forEach((v, i) => { text = text.replace(`{{${i + 1}}}`, v || `{{${i + 1}}}`); });
    return text;
  };

  return (
    <Box>
      <PageHeader
        title="New WhatsApp Campaign"
        subtitle="Send WhatsApp messages using approved templates"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'WhatsApp Campaign' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Select Approved Template</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            WhatsApp Business API requires pre-approved message templates for outbound campaigns. Only APPROVED templates can be sent.
          </Alert>
          <Grid container spacing={2}>
            {waTemplates.map((t) => (
              <Grid item xs={12} md={6} key={t.id}>
                <Card
                  variant="outlined"
                  onClick={() => setForm(f => ({ ...f, template: t.id }))}
                  sx={{
                    cursor: 'pointer', p: 1,
                    border: form.template === t.id ? '2px solid #25d366' : '1px solid #e0e0e0',
                    bgcolor: form.template === t.id ? '#e8f5e9' : 'background.paper',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{t.name}</Typography>
                      <Chip label={t.category} size="small"
                        color={t.category === 'MARKETING' ? 'warning' : 'info'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{t.preview}</Typography>
                    <Typography variant="caption" color="text.disabled">Language: {t.language.toUpperCase()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Audience</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Campaign Name" name="name"
                  value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Audience</InputLabel>
                  <Select name="audience" value={form.audience}
                    onChange={(e) => setForm(f => ({ ...f, audience: e.target.value }))} label="Audience">
                    <MenuItem value="all">All Contacts with WhatsApp (6,800)</MenuItem>
                    <MenuItem value="leads">Leads (2,100)</MenuItem>
                    <MenuItem value="customers">Customers (4,700)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Personalize Variables</Typography>
                <Divider sx={{ mb: 2 }} />
                {form.variables.map((v, i) => (
                  <TextField key={i} fullWidth label={`Variable {{${i + 1}}}`} value={v}
                    onChange={(e) => { const vars = [...form.variables]; vars[i] = e.target.value; setForm(f => ({ ...f, variables: vars })); }}
                    sx={{ mb: 2 }} helperText="Will be replaced per contact from their profile" />
                ))}
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Attach Media (optional)</InputLabel>
                  <Select name="mediaType" value={form.mediaType}
                    onChange={(e) => setForm(f => ({ ...f, mediaType: e.target.value }))} label="Attach Media (optional)">
                    <MenuItem value="none">No Media</MenuItem>
                    <MenuItem value="image"><Box sx={{ display: 'flex', gap: 1 }}><Image fontSize="small" /> Image</Box></MenuItem>
                    <MenuItem value="video"><Box sx={{ display: 'flex', gap: 1 }}><VideoLibrary fontSize="small" /> Video</Box></MenuItem>
                    <MenuItem value="document"><Box sx={{ display: 'flex', gap: 1 }}><AttachFile fontSize="small" /> Document</Box></MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>WhatsApp Preview</Typography>
            <Box sx={{ bgcolor: '#e5ddd5', borderRadius: 3, p: 2, minHeight: 200, backgroundImage: 'url("data:image/svg+xml,%3Csvg...")', position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ bgcolor: '#dcf8c6', borderRadius: '12px 12px 0 12px', p: 1.5, maxWidth: '80%', boxShadow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <WhatsApp sx={{ fontSize: 14, color: '#25d366' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>SanCRM</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{renderPreview()}</Typography>
                  <Typography variant="caption" color="text.disabled" display="block" textAlign="right" mt={0.5}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </Typography>
                </Box>
              </Box>
            </Box>
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
                    value={form.scheduledAt} onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    InputLabelProps={{ shrink: true }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/campaigns') : setActiveStep(s => s - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button variant="contained" sx={{ bgcolor: '#25d366', '&:hover': { bgcolor: '#1da851' } }}
          startIcon={activeStep === steps.length - 1 ? <Send /> : null}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? 'Send WhatsApp Campaign' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
