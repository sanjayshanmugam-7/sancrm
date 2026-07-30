import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, InputLabel,
  Select, MenuItem, Slider, Chip, Alert, Paper, IconButton
} from '@mui/material';
import { Google, Search, Add, Delete, Send, Language } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Campaign Type', 'Keywords & Bids', 'Ad Copy', 'Budget & Targeting'];

const campaignTypes = [
  { id: 'search', label: 'Search', icon: '🔍', desc: 'Text ads on Google Search results' },
  { id: 'display', label: 'Display', icon: '🖼️', desc: 'Image ads across Google Display Network' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', desc: 'Product listings on Google Search' },
  { id: 'performance_max', label: 'Performance Max', icon: '🚀', desc: 'AI-optimized across all Google channels' },
];

export default function GoogleCampaign() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: '', campaignType: '', keywords: ['CRM software', 'sales management tool', 'lead tracking software'],
    negativeKeywords: ['free', 'open source'], dailyBudget: 1000, bidStrategy: 'maximize_clicks',
    headlines: ['Best CRM for Growing Businesses', 'Track Leads & Close More Deals', 'Free 14-Day Trial – No Credit Card'],
    descriptions: ['Manage all your leads, contacts, and deals in one place.', 'Boost sales productivity with AI-powered insights.'],
    finalUrl: 'https://sancrm.com/signup',
    locations: ['India'], languages: ['English'],
  });

  const addKeyword = () => setForm(f => ({ ...f, keywords: [...f.keywords, ''] }));
  const removeKeyword = (i) => setForm(f => ({ ...f, keywords: f.keywords.filter((_, idx) => idx !== i) }));
  const updateKeyword = (i, v) => { const kws = [...form.keywords]; kws[i] = v; setForm(f => ({ ...f, keywords: kws })); };

  const updateHeadline = (i, v) => { const hs = [...form.headlines]; hs[i] = v; setForm(f => ({ ...f, headlines: hs })); };
  const updateDesc = (i, v) => { const ds = [...form.descriptions]; ds[i] = v; setForm(f => ({ ...f, descriptions: ds })); };

  return (
    <Box>
      <PageHeader
        title="New Google Ads Campaign"
        subtitle="Create targeted ads on Google Search and Display"
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: 'Google Campaign' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <TextField fullWidth label="Campaign Name" value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Select Campaign Type</Typography>
          <Grid container spacing={2}>
            {campaignTypes.map((t) => (
              <Grid item xs={12} sm={6} key={t.id}>
                <Card variant="outlined" onClick={() => setForm(f => ({ ...f, campaignType: t.id }))}
                  sx={{
                    cursor: 'pointer',
                    border: form.campaignType === t.id ? '2px solid #ea4335' : '1px solid #e0e0e0',
                    bgcolor: form.campaignType === t.id ? '#fce8e6' : 'background.paper',
                    '&:hover': { borderColor: '#ea4335' },
                  }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography fontSize={36}>{t.icon}</Typography>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>{t.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.desc}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Keywords</Typography>
                  <Button size="small" startIcon={<Add />} onClick={addKeyword}>Add</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {form.keywords.map((kw, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField fullWidth size="small" value={kw} onChange={(e) => updateKeyword(i, e.target.value)}
                      placeholder="Enter keyword" />
                    <IconButton size="small" onClick={() => removeKeyword(i)}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Negative Keywords</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Exclude irrelevant searches to save budget
                </Typography>
                {form.negativeKeywords.map((kw, i) => (
                  <Chip key={i} label={kw} onDelete={() => setForm(f => ({ ...f, negativeKeywords: f.negativeKeywords.filter((_, idx) => idx !== i) }))}
                    sx={{ mr: 0.5, mb: 0.5 }} color="error" variant="outlined" size="small" />
                ))}
                <TextField fullWidth size="small" placeholder="Add negative keyword, press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setForm(f => ({ ...f, negativeKeywords: [...f.negativeKeywords, e.target.value] }));
                      e.target.value = '';
                    }
                  }} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ad Copy</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Headlines (up to 15, 30 chars each)</Typography>
                {form.headlines.map((h, i) => (
                  <TextField key={i} fullWidth size="small" value={h} onChange={(e) => updateHeadline(i, e.target.value)}
                    label={`Headline ${i + 1}`} inputProps={{ maxLength: 30 }} sx={{ mb: 1 }}
                    helperText={`${h.length}/30`} />
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => setForm(f => ({ ...f, headlines: [...f.headlines, ''] }))} sx={{ mb: 2 }}>
                  Add Headline
                </Button>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Descriptions (up to 4, 90 chars each)</Typography>
                {form.descriptions.map((d, i) => (
                  <TextField key={i} fullWidth size="small" value={d} onChange={(e) => updateDesc(i, e.target.value)}
                    label={`Description ${i + 1}`} inputProps={{ maxLength: 90 }} sx={{ mb: 1 }}
                    helperText={`${d.length}/90`} />
                ))}
                <Divider sx={{ mb: 2 }} />
                <TextField fullWidth label="Final URL" value={form.finalUrl}
                  onChange={(e) => setForm(f => ({ ...f, finalUrl: e.target.value }))}
                  InputProps={{ startAdornment: <Language sx={{ mr: 1 }} color="action" /> }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>Ad Preview</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="primary" fontWeight={600}>Ad · sancrm.com</Typography>
              <Typography variant="body1" color="primary" fontWeight={700} sx={{ mt: 0.5 }}>
                {form.headlines[0] || 'Headline 1'} | {form.headlines[1] || 'Headline 2'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {form.descriptions[0] || 'Your description will appear here.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Budget & Bidding</Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="subtitle2" gutterBottom>Daily Budget: ₹{form.dailyBudget}</Typography>
                <Slider value={form.dailyBudget} onChange={(_, v) => setForm(f => ({ ...f, dailyBudget: v }))}
                  min={100} max={20000} step={100} valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `₹${v}`} sx={{ mb: 3 }} />
                <FormControl fullWidth>
                  <InputLabel>Bid Strategy</InputLabel>
                  <Select value={form.bidStrategy} onChange={(e) => setForm(f => ({ ...f, bidStrategy: e.target.value }))} label="Bid Strategy">
                    <MenuItem value="maximize_clicks">Maximize Clicks</MenuItem>
                    <MenuItem value="maximize_conversions">Maximize Conversions</MenuItem>
                    <MenuItem value="target_cpa">Target CPA</MenuItem>
                    <MenuItem value="target_roas">Target ROAS</MenuItem>
                    <MenuItem value="manual_cpc">Manual CPC</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#fce8e6' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Estimated Performance</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Est. Impressions/day', value: '3,200 – 8,500' },
                  { label: 'Est. Clicks/day', value: '96 – 255' },
                  { label: 'Est. Avg. CPC', value: '₹3.92 – ₹10.42' },
                  { label: 'Est. Monthly Spend', value: `₹${(form.dailyBudget * 30).toLocaleString()}` },
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
        <Button variant="contained" sx={{ bgcolor: '#ea4335', '&:hover': { bgcolor: '#c62828' } }}
          startIcon={activeStep === steps.length - 1 ? <Send /> : <Google />}
          onClick={() => activeStep === steps.length - 1 ? navigate('/campaigns') : setActiveStep(s => s + 1)}>
          {activeStep === steps.length - 1 ? 'Launch Google Ads' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
