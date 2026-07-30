import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Button, Divider,
  Alert, Stepper, Step, StepLabel,
} from '@mui/material';
import { Save, ArrowBack, ArrowForward } from '@mui/icons-material';
import { createLead, updateLead, fetchLeadById } from '../../store/slices/leadsSlice';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';

const steps = ['Basic Info', 'Contact Details', 'Lead Details'];

const initialValues = {
  firstName: '', lastName: '', email: '', phone: '', mobile: '',
  company: '', jobTitle: '', website: '', industry: '',
  source: '', status: 'new', assignedTo: '',
  budget: '', expectedClose: '', tags: [], notes: '',
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
};

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.leads);
  const isEdit = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const existing = items.find(l => l.id === id);
      if (existing) setValues({ ...initialValues, ...existing });
      else dispatch(fetchLeadById(id));
    }
  }, [id, isEdit, items, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setValues(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!values.firstName.trim()) errs.firstName = 'First name is required';
    if (!values.lastName.trim()) errs.lastName = 'Last name is required';
    if (!values.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(values.email)) errs.email = 'Invalid email';
    if (!values.phone.trim()) errs.phone = 'Phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(updateLead({ id, data: values })).unwrap();
      } else {
        await dispatch(createLead(values)).unwrap();
      }
      setSaved(true);
      setTimeout(() => navigate('/leads'), 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const stepFields = [
    // Step 0: Basic Info
    <Grid container spacing={2.5} key={0}>
      <Grid item xs={12} sm={6}>
        <FormField name="firstName" label="First Name" value={values.firstName} onChange={handleChange} error={errors.firstName} required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="lastName" label="Last Name" value={values.lastName} onChange={handleChange} error={errors.lastName} required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="email" label="Email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="phone" label="Phone" value={values.phone} onChange={handleChange} error={errors.phone} required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="mobile" label="Mobile" value={values.mobile} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="company" label="Company" value={values.company} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="jobTitle" label="Job Title" value={values.jobTitle} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="website" label="Website" value={values.website} onChange={handleChange} />
      </Grid>
    </Grid>,
    // Step 1: Contact Details
    <Grid container spacing={2.5} key={1}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Address</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormField name="address.street" label="Street Address" value={values.address?.street || ''} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="address.city" label="City" value={values.address?.city || ''} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="address.state" label="State" value={values.address?.state || ''} onChange={handleChange} type="select"
          options={['Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(s => ({ label: s, value: s }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="address.pincode" label="PIN Code" value={values.address?.pincode || ''} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="address.country" label="Country" value={values.address?.country || 'India'} onChange={handleChange} />
      </Grid>
    </Grid>,
    // Step 2: Lead Details
    <Grid container spacing={2.5} key={2}>
      <Grid item xs={12} sm={6}>
        <FormField type="select" name="source" label="Lead Source" value={values.source} onChange={handleChange}
          options={['Website','Facebook','Google Ads','WhatsApp','Instagram','Email','Referral','Event','Cold Call'].map(s => ({ label: s, value: s }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField type="select" name="status" label="Status" value={values.status} onChange={handleChange}
          options={['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'].map(s => ({ label: s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: s }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField type="select" name="industry" label="Industry" value={values.industry} onChange={handleChange}
          options={['Technology','Finance','Healthcare','Manufacturing','Retail','Education','Logistics','Real Estate','FMCG','Other'].map(s => ({ label: s, value: s }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField name="budget" label="Budget" value={values.budget} onChange={handleChange} placeholder="e.g. ₹5,00,000" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField type="select" name="assignedTo" label="Assigned To" value={values.assignedTo} onChange={handleChange}
          options={['Ravi Kumar','Sneha Rao','Meera Joshi','Vikram Das'].map(s => ({ label: s, value: s }))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormField type="date" name="expectedClose" label="Expected Close Date" value={values.expectedClose} onChange={handleChange}
          InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12}>
        <FormField type="tags" name="tags" label="Tags" value={values.tags} onChange={handleChange}
          options={['hot','warm','cold','enterprise','startup','high-value']} />
      </Grid>
      <Grid item xs={12}>
        <FormField type="textarea" name="notes" label="Notes" value={values.notes} onChange={handleChange} rows={3} />
      </Grid>
    </Grid>,
  ];

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Lead' : 'Create New Lead'}
        subtitle={isEdit ? 'Update lead information' : 'Fill in the details to create a new lead'}
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: isEdit ? 'Edit Lead' : 'New Lead' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' }]}
      />

      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Lead {isEdit ? 'updated' : 'created'} successfully! Redirecting...</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          <Box sx={{ mb: 3 }}>
            {stepFields[activeStep]}
          </Box>

          <Divider sx={{ mb: 2.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => activeStep === 0 ? navigate('/leads') : setActiveStep(s => s - 1)} startIcon={<ArrowBack />} sx={{ borderRadius: 2 }}>
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep(s => s + 1)} endIcon={<ArrowForward />} sx={{ borderRadius: 2 }}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<Save />} disabled={saving} sx={{ borderRadius: 2 }}>
                {saving ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeadForm;
