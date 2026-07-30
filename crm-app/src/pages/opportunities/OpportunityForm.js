import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Grid, Card, CardContent, Button, Alert } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { createOpportunity } from '../../store/slices/opportunitiesSlice';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';

const initValues = {
  title: '', accountId: '', accountName: '', contactId: '', contactName: '',
  stage: 'lead', value: '', probability: '20', expectedClose: '',
  assignedTo: '', source: '', description: '', tags: [],
};

const OpportunityForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [values, setValues] = useState(initValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const stageOptions = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map(s => ({
    label: s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: s,
  }));

  const validate = () => {
    const errs = {};
    if (!values.title) errs.title = 'Title is required';
    if (!values.accountName) errs.accountName = 'Account is required';
    if (!values.value) errs.value = 'Deal value is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await dispatch(createOpportunity(values)).unwrap().catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/opportunities'), 1000);
  };

  return (
    <Box>
      <PageHeader
        title="Add Opportunity"
        breadcrumbs={[{ label: 'Opportunities', path: '/opportunities' }, { label: 'New Opportunity' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/opportunities'), variant: 'outlined' }]}
      />
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Opportunity created successfully!</Alert>}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}><FormField name="title" label="Opportunity Title" value={values.title} onChange={handleChange} error={errors.title} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="accountName" label="Account" value={values.accountName} onChange={handleChange} error={errors.accountName} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="contactName" label="Contact" value={values.contactName} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormField name="value" label="Deal Value (₹)" type="number" value={values.value} onChange={handleChange} error={errors.value} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="probability" label="Probability (%)" type="number" value={values.probability} onChange={handleChange} inputProps={{ min: 0, max: 100 }} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="select" name="stage" label="Stage" value={values.stage} onChange={handleChange} options={stageOptions} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="date" name="expectedClose" label="Expected Close Date" value={values.expectedClose} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="select" name="assignedTo" label="Assigned To" value={values.assignedTo} onChange={handleChange}
              options={['Ravi Kumar', 'Sneha Rao', 'Meera Joshi', 'Vikram Das'].map(s => ({ label: s, value: s }))} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="select" name="source" label="Source" value={values.source} onChange={handleChange}
              options={['Website', 'Facebook', 'Google Ads', 'WhatsApp', 'Referral', 'Email'].map(s => ({ label: s, value: s }))} /></Grid>
            <Grid item xs={12}><FormField type="textarea" name="description" label="Description" value={values.description} onChange={handleChange} rows={3} /></Grid>
            <Grid item xs={12}><FormField type="tags" name="tags" label="Tags" value={values.tags} onChange={handleChange} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/opportunities')} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={saving} sx={{ borderRadius: 2 }}>
              {saving ? 'Saving...' : 'Create Opportunity'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OpportunityForm;
