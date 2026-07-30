import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, InputLabel,
  Select, MenuItem, Slider, Chip, Alert, Paper, Avatar
} from '@mui/material';
import { Facebook, Send, Image, People, LocationOn, Interests, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Campaign Goal', 'Audience Targeting', 'Ad Creative', 'Budget & Schedule'];

const objectives = [
  { id: 'awareness', label: 'Brand Awareness', icon: '👁️', desc: 'Reach people likely to recall your brand' },
  { id: 'traffic', label: 'Traffic', icon: '🔗', desc: 'Send people to your website or app' },
  { id: 'leads', label: 'Lead Generation', icon: '📋', desc: 'Collect leads with built-in forms' },
  { id: 'conversions', label: 'Conversions', icon: '🛒', desc: 'Drive actions on your website' },
  { id: 'engagement', label: 'Engagement', icon: '❤️', desc: 'Get more post reactions, comments, shares' },
  { id: 'messages', label: 'Messages', icon: '💬', desc: 'Get more messages on Messenger' },
];

export default function FacebookCampaign() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', objective: '', ageMin: 18, ageMax: 65,
    gender: 'all', locations: ['India'], interests: ['CRM', 'Business Software'],
    dailyBudget: 500, totalBudget: 5000, bidStrategy: 'lowest_cost',
    headline: '', primaryText: '', callToAction: 'LEARN_MORE',
    startDate: '', endDate: '',
  });

  return (
    <Box>
      <PageHeader
        title="New Facebook Campaign"
        subtitle="Create targeted Facebook and Instagram ads"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Facebook Campaign' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <TextField fullWidth label="Campaign Name" value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Choose Campaign Objective</Typography>
          <Grid container spacing={2}>
            {objectives.map((obj) => (
              <Grid item xs={12} sm={6} md={4} key={obj.id}>
                <Card variant="outlined" onClick={() => setForm(f => ({ ...f, objective: obj.id }))}
                  sx={{
                    cursor: 'pointer', p: 1, textAlign: 'center',
                    border: form.objective === obj.id ? '2px solid #1877f2' : '1px solid #e0e0e0',
                    bgcolor: form.objective === obj.id ? '#e8f0fe' : 'background.paper',
                    '&:hover': { borderColor: '#1877f2', transform: 'translateY(-2px)' }, transition: 'all 0.2s',
                  }}>
                  <CardContent>
                    <Typography fontSize={36}>{obj.icon}</Typography>
                    <Typography variant="body2" fontWeight={700}>{obj.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{obj.desc}</Typography>
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
            <Typography variant="h6" gutterBottom>Audience Targeting</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Age Range: {form.ageMin} – {form.ageMax}</Typography>
                <Slider value={[form.ageMin, form.ageMax]}
                  onChange={(_, v) => setForm(f => ({ ...f, ageMin: v[0], ageMax: v[1] }))}
                  min={13} max={65} valueLabelDisplay="auto" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender} onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))} label="Gender">
                    <MenuItem value="all">All Genders</MenuItem>
                    <MenuItem value="male">Men</MenuItem>
                    <MenuItem value="female">Women</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Locations (comma separated)" value={form.locations.join(', ')}
                  onChange={(e) => setForm(f => ({ ...f, locations: e.target.value.split(',').map(s => s.trim()) }))}
                  InputProps={{ startAdornment: <LocationOn sx={{ mr: 1 }} color="action" /> }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Interests (comma separated)" value={form.interests.join(', ')}
                  onChange={(e) => setForm(f => ({ ...f, interests: e.target.value.split(',').map(s => s.trim()) }))}
                  InputProps={{ startAdornment: <Interests sx={{ mr: 1 }} color="action" /> }} />
              </Grid>
            </Grid>
            <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: '#e8f0fe' }}>
              <Typography variant="subtitle2" gutterBottom><People sx={{ mr: 1 }} />Estimated Audience Size</Typography>
              <Typography variant="h5" fontWeight={700}>2.4M – 5.8M</Typography>
              <Typography variant="caption" color="text.secondary">Based on your targeting parameters</Typography>
            </Paper>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ad Creative</Typography>
                <Divider sx={{ mb: 3 }} />
                <Alert severity="info" sx={{ mb: 2 }}>Upload an image or video (recommended: 1200×628px for feed ads)</Alert>
                <Button variant="outlined" startIcon={<Image />} fullWidth sx={{ mb: 2, height: 80, borderStyle: 'dashed' }}>
                  Upload Image / Video
                </Button>
                <TextField fullWidth label="Primary Text" multiline rows={3} value={form.primaryText}
                  onChange={(e) => setForm(f => ({ ...f, primaryText: e.target.value }))} sx={{ mb: 2 }}
                  helperText="Appears above the ad image (max 125 characters)" />
                <TextField fullWidth label="Headline" value={form.headline}
                  onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))} sx={{ mb: 2 }} />
                <FormControl fullWidth>
                  <InputLabel>Call to Action</InputLabel>
                  <Select value={form.callToAction} onChange={(e) => setForm(f => ({ ...f, callToAction: e.target.value }))} label="Call to Action">
                    {['LEARN_MORE', 'SIGN_UP', 'GET_QUOTE', 'CONTACT_US', 'BOOK_NOW', 'DOWNLOAD', 'SHOP_NOW'].map(v => (
                      <MenuItem key={v} value={v}>{v.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>Ad Preview (Feed)</Typography>
            <Card variant="outlined">
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#1877f2', width: 36, height: 36 }}><Facebook /></Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight={700}>SanCRM</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">Sponsored</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>{form.primaryText || 'Your ad text will appear here...'}</Typography>
                <Box sx={{ bgcolor: '#f5f5f5', height: 180, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image sx={{ fontSize: 60, color: '#bdbdbd' }} />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" fontWeight={700}>{form.headline || 'Your Headline Here'}</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 1 }}>{form.callToAction.replace('_', ' ')}</Button>
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
                <Typography variant="h6" gutterBottom><AttachMoney /> Budget</Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="subtitle2" gutterBottom>Daily Budget: ₹{form.dailyBudget}</Typography>
                <Slider value={form.dailyBudget} onChange={(_, v) => setForm(f => ({ ...f, dailyBudget: v }))}
                  min={100} max={10000} step={100} valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `₹${v}`} sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth type="date" label="Start Date" value={form.startDate}
                      onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth type="date" label="End Date" value={form.endDate}
                      onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#e8f0fe' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Estimated Results</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Est. Daily Reach', value: '12,000 – 35,000 people' },
                  { label: 'Est. Impressions', value: '18,000 – 52,000 / day' },
                  { label: 'Est. Clicks', value: '180 – 540 / day' },
                  { label: 'Est. Cost Per Click', value: '₹0.92 – ₹2.77' },
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
        <Button variant="contained" sx={{ bgcolor: '#1877f2', '&:hover': { bgcolor: '#1565c0' } }}
          startIcon={activeStep === steps.length - 1 ? <Send /> : <Facebook />}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? 'Publish to Facebook' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
