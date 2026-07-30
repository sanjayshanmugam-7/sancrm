import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Grid, Card, CardContent, Button, Alert } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { createContact } from '../../store/slices/contactsSlice';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';

const initValues = {
  type: 'individual', firstName: '', lastName: '', email: '', phone: '',
  mobile: '', company: '', jobTitle: '', website: '',
  group: '', status: 'active', tags: [],
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
  notes: '',
};

const ContactForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [values, setValues] = useState(initValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [p, c] = name.split('.');
      setValues(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!values.firstName) errs.firstName = 'Required';
    if (!values.lastName) errs.lastName = 'Required';
    if (!values.email) errs.email = 'Required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await dispatch(createContact(values)).unwrap().catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/contacts'), 1000);
  };

  return (
    <Box>
      <PageHeader
        title="Add Contact"
        breadcrumbs={[{ label: 'Contacts', path: '/contacts' }, { label: 'New Contact' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/contacts'), variant: 'outlined' }]}
      />
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Contact created successfully!</Alert>}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}><FormField type="radio" name="type" label="Contact Type" value={values.type} onChange={handleChange} options={[{ label: 'Individual', value: 'individual' }, { label: 'Business', value: 'business' }]} /></Grid>
            <Grid item xs={12} sm={6}><FormField name="firstName" label="First Name" value={values.firstName} onChange={handleChange} error={errors.firstName} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="lastName" label="Last Name" value={values.lastName} onChange={handleChange} error={errors.lastName} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="email" label="Email" type="email" value={values.email} onChange={handleChange} error={errors.email} required /></Grid>
            <Grid item xs={12} sm={6}><FormField name="phone" label="Phone" value={values.phone} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormField name="company" label="Company" value={values.company} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormField name="jobTitle" label="Job Title" value={values.jobTitle} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="select" name="group" label="Customer Group" value={values.group} onChange={handleChange}
              options={['VIP Clients', 'Regular Clients', 'High Value', 'Prospects'].map(g => ({ label: g, value: g }))} /></Grid>
            <Grid item xs={12} sm={6}><FormField type="select" name="status" label="Status" value={values.status} onChange={handleChange}
              options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} /></Grid>
            <Grid item xs={12}><FormField name="address.street" label="Street Address" value={values.address.street} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><FormField name="address.city" label="City" value={values.address.city} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><FormField name="address.state" label="State" value={values.address.state} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><FormField name="address.pincode" label="PIN Code" value={values.address.pincode} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormField type="tags" name="tags" label="Tags" value={values.tags} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormField type="textarea" name="notes" label="Notes" value={values.notes} onChange={handleChange} rows={3} /></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/contacts')} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={saving} sx={{ borderRadius: 2 }}>
              {saving ? 'Saving...' : 'Save Contact'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactForm;
