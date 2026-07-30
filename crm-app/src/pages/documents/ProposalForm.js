import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Divider, FormControl, InputLabel, Select, MenuItem, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Alert,
  InputAdornment, Stepper, Step, StepLabel, Chip
} from '@mui/material';
import { Add, Delete, Save, Send, Preview, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Basic Info', 'Content & Sections', 'Pricing', 'Review & Send'];

const defaultSections = [
  { id: 1, title: 'Executive Summary', content: 'Brief overview of the proposal and its objectives...' },
  { id: 2, title: 'Problem Statement', content: 'Describe the challenges the client is facing...' },
  { id: 3, title: 'Proposed Solution', content: 'Detail your solution and approach...' },
  { id: 4, title: 'Implementation Timeline', content: 'Phase-wise project timeline...' },
  { id: 5, title: 'Team & Expertise', content: 'Introduce your team and relevant experience...' },
];

const defaultItems = [
  { id: 1, description: 'CRM Software License (Annual)', qty: 1, unit: 'Year', unitPrice: 120000, taxRate: 18 },
  { id: 2, description: 'Implementation & Setup', qty: 1, unit: 'Project', unitPrice: 50000, taxRate: 18 },
  { id: 3, description: 'Training (2 days, on-site)', qty: 2, unit: 'Day', unitPrice: 15000, taxRate: 18 },
];

export default function ProposalForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '', client: '', contact: '', opportunity: '', validUntil: '',
    currency: 'INR', template: 'standard', notes: '', terms: '',
    discount: 0,
  });
  const [sections, setSections] = useState(defaultSections);
  const [items, setItems] = useState(defaultItems);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), description: '', qty: 1, unit: 'Unit', unitPrice: 0, taxRate: 18 }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, field, value) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const subtotal = items.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0);
  const taxTotal = items.reduce((sum, i) => sum + (i.qty * i.unitPrice * i.taxRate / 100), 0);
  const discount = subtotal * form.discount / 100;
  const total = subtotal + taxTotal - discount;

  const addSection = () => setSections(prev => [...prev, { id: Date.now(), title: 'New Section', content: '' }]);
  const updateSection = (id, field, value) => setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const removeSection = (id) => setSections(prev => prev.filter(s => s.id !== id));

  return (
    <Box>
      <PageHeader
        title="Create Proposal"
        subtitle="Build and send a professional sales proposal"
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'New Proposal' }]}
      />
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Basic Info */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Proposal Details</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth required label="Proposal Title" name="title" value={form.title} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Client / Account</InputLabel>
                      <Select name="client" value={form.client} onChange={handleChange} label="Client / Account">
                        <MenuItem value="techcorp">TechCorp Ltd</MenuItem>
                        <MenuItem value="abc">ABC Industries</MenuItem>
                        <MenuItem value="xyz">XYZ Pvt Ltd</MenuItem>
                        <MenuItem value="globaltech">GlobalTech Inc</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Contact Person</InputLabel>
                      <Select name="contact" value={form.contact} onChange={handleChange} label="Contact Person">
                        <MenuItem value="mohan">Mohan Patel</MenuItem>
                        <MenuItem value="priya">Priya Verma</MenuItem>
                        <MenuItem value="suresh">Suresh Nair</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Related Opportunity</InputLabel>
                      <Select name="opportunity" value={form.opportunity} onChange={handleChange} label="Related Opportunity">
                        <MenuItem value="opp1">TechCorp – CRM Implementation</MenuItem>
                        <MenuItem value="opp2">ABC – Module Expansion</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth type="date" label="Valid Until" name="validUntil" value={form.validUntil}
                      onChange={handleChange} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Template Style</InputLabel>
                      <Select name="template" value={form.template} onChange={handleChange} label="Template Style">
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="minimal">Minimal</MenuItem>
                        <MenuItem value="bold">Bold</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select name="currency" value={form.currency} onChange={handleChange} label="Currency">
                        <MenuItem value="INR">INR (₹)</MenuItem>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notes & Terms</Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} label="Internal Notes" name="notes" value={form.notes} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} label="Terms & Conditions" name="terms" value={form.terms} onChange={handleChange} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Sections */}
      {activeStep === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Proposal Sections</Typography>
            <Button startIcon={<Add />} onClick={addSection}>Add Section</Button>
          </Box>
          {sections.map((section, i) => (
            <Card key={section.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip label={`Section ${i + 1}`} size="small" color="primary" variant="outlined" />
                  <IconButton size="small" onClick={() => removeSection(section.id)}><Delete fontSize="small" /></IconButton>
                </Box>
                <TextField fullWidth label="Section Title" value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={4} label="Content" value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)} />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Step 2: Pricing */}
      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Pricing Table</Typography>
              <Button startIcon={<Add />} onClick={addItem}>Add Line Item</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '35%' }}>Description</TableCell>
                  <TableCell align="right" sx={{ width: '10%' }}>Qty</TableCell>
                  <TableCell sx={{ width: '12%' }}>Unit</TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>Unit Price (₹)</TableCell>
                  <TableCell align="right" sx={{ width: '10%' }}>Tax %</TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>Total</TableCell>
                  <TableCell sx={{ width: '3%' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><TextField size="small" fullWidth value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} sx={{ width: 70 }} /></TableCell>
                    <TableCell><TextField size="small" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} sx={{ width: 80 }} /></TableCell>
                    <TableCell><TextField size="small" type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', +e.target.value)} sx={{ width: 120 }} /></TableCell>
                    <TableCell><TextField size="small" type="number" value={item.taxRate} onChange={(e) => updateItem(item.id, 'taxRate', +e.target.value)} sx={{ width: 70 }} /></TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>₹{(item.qty * item.unitPrice).toLocaleString()}</Typography></TableCell>
                    <TableCell><IconButton size="small" onClick={() => removeItem(item.id)}><Delete fontSize="small" /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Box sx={{ width: 300 }}>
                {[
                  { label: 'Subtotal', value: `₹${subtotal.toLocaleString()}` },
                  { label: 'Tax (GST)', value: `₹${taxTotal.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <TextField size="small" type="number" value={form.discount}
                    onChange={(e) => setForm(f => ({ ...f, discount: +e.target.value }))}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    sx={{ width: 90 }} inputProps={{ min: 0, max: 100 }} />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>₹{Math.round(total).toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {activeStep === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: '#f8f9fa', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Description sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6">{form.title || 'Your Proposal'}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{form.client || 'Client'} • {items.length} line items • ₹{Math.round(total).toLocaleString()}</Typography>
                <Button variant="outlined" startIcon={<Preview />}>Preview PDF</Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Ready to Send?</Typography>
                <Divider sx={{ mb: 2 }} />
                {[
                  { label: 'Title', value: form.title || '—' },
                  { label: 'Client', value: form.client || '—' },
                  { label: 'Sections', value: sections.length },
                  { label: 'Line Items', value: items.length },
                  { label: 'Total Value', value: `₹${Math.round(total).toLocaleString()}` },
                  { label: 'Valid Until', value: form.validUntil || '—' },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Button fullWidth variant="outlined" startIcon={<Save />} sx={{ mb: 1 }} onClick={() => navigate('/documents')}>
                  Save as Draft
                </Button>
                <Button fullWidth variant="contained" startIcon={<Send />} onClick={() => navigate('/documents')}>
                  Send Proposal
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/documents') : setActiveStep(s => s - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        {activeStep < steps.length - 1 && (
          <Button variant="contained" onClick={() => setActiveStep(s => s + 1)}>Next</Button>
        )}
      </Box>
    </Box>
  );
}
