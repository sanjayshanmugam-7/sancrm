import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Grid, Card, CardContent, Button, Alert, Typography, Divider, Switch, FormControlLabel } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { createAccount } from '../../store/slices/accountsSlice';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';

const initValues = {
  name: '', type: 'company', parentId: '', industry: '', website: '',
  phone: '', email: '', employeeCount: '', annualRevenue: '',
  creditLimit: '', creditUsed: '0', category: 'mid-market', status: 'active',
  primaryContact: '', description: '', tags: [],
  gst: { number: '', state: '', registered: false },
  billingAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
  shippingAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
  sameAsShipping: false,
};

const AccountForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [values, setValues] = useState(initValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [p, c] = name.split('.');
      setValues(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSameAddress = (e) => {
    setSameAddress(e.target.checked);
    if (e.target.checked) {
      setValues(prev => ({ ...prev, shippingAddress: { ...prev.billingAddress } }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!values.name) errs.name = 'Account name is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await dispatch(createAccount(values)).unwrap().catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/accounts'), 1000);
  };

  return (
    <Box>
      <PageHeader
        title="Add Account"
        breadcrumbs={[{ label: 'Accounts', path: '/accounts' }, { label: 'New Account' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/accounts'), variant: 'outlined' }]}
      />
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Account created successfully!</Alert>}

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><FormField name="name" label="Account Name" value={values.name} onChange={handleChange} error={errors.name} required /></Grid>
                <Grid item xs={12} sm={6}><FormField type="select" name="type" label="Type" value={values.type} onChange={handleChange}
                  options={['company', 'branch', 'parent_company'].map(t => ({ label: t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: t }))} /></Grid>
                <Grid item xs={12} sm={6}><FormField type="select" name="industry" label="Industry" value={values.industry} onChange={handleChange}
                  options={['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Logistics', 'Real Estate', 'FMCG'].map(s => ({ label: s, value: s }))} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="phone" label="Phone" value={values.phone} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="email" label="Email" type="email" value={values.email} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="website" label="Website" value={values.website} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="primaryContact" label="Primary Contact" value={values.primaryContact} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="employeeCount" label="Employee Count" type="number" value={values.employeeCount} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={6}><FormField name="annualRevenue" label="Annual Revenue" value={values.annualRevenue} onChange={handleChange} placeholder="e.g. ₹10 Cr" /></Grid>
                <Grid item xs={12}><FormField type="textarea" name="description" label="Description" value={values.description} onChange={handleChange} rows={2} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* GST */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>GST Details</Typography>
                <FormControlLabel control={<Switch size="small" checked={values.gst.registered} onChange={(e) => setValues(p => ({ ...p, gst: { ...p.gst, registered: e.target.checked } }))} />}
                  label={<Typography variant="body2">GST Registered</Typography>} />
              </Box>
              {values.gst.registered && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><FormField name="gst.number" label="GST Number" value={values.gst.number} onChange={handleChange} placeholder="e.g. 29ABCDE1234F1Z5" /></Grid>
                  <Grid item xs={12} sm={6}><FormField type="select" name="gst.state" label="GST State" value={values.gst.state} onChange={handleChange}
                    options={['Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map(s => ({ label: s, value: s }))} /></Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Billing Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><FormField name="billingAddress.street" label="Street" value={values.billingAddress.street} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="billingAddress.city" label="City" value={values.billingAddress.city} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="billingAddress.state" label="State" value={values.billingAddress.state} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="billingAddress.pincode" label="PIN Code" value={values.billingAddress.pincode} onChange={handleChange} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Shipping Address</Typography>
                <FormControlLabel control={<Switch size="small" checked={sameAddress} onChange={handleSameAddress} />}
                  label={<Typography variant="body2">Same as billing</Typography>} />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><FormField name="shippingAddress.street" label="Street" value={values.shippingAddress.street} onChange={handleChange} disabled={sameAddress} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="shippingAddress.city" label="City" value={values.shippingAddress.city} onChange={handleChange} disabled={sameAddress} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="shippingAddress.state" label="State" value={values.shippingAddress.state} onChange={handleChange} disabled={sameAddress} /></Grid>
                <Grid item xs={12} sm={4}><FormField name="shippingAddress.pincode" label="PIN Code" value={values.shippingAddress.pincode} onChange={handleChange} disabled={sameAddress} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Account Details</Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}><FormField type="select" name="category" label="Category" value={values.category} onChange={handleChange}
                  options={['enterprise', 'mid-market', 'smb', 'startup'].map(c => ({ label: c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: c }))} /></Grid>
                <Grid item xs={12}><FormField type="select" name="status" label="Status" value={values.status} onChange={handleChange}
                  options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} /></Grid>
                <Grid item xs={12}><FormField name="creditLimit" label="Credit Limit (₹)" type="number" value={values.creditLimit} onChange={handleChange} /></Grid>
                <Grid item xs={12}><FormField type="tags" name="tags" label="Tags" value={values.tags} onChange={handleChange} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/accounts')} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={saving} sx={{ borderRadius: 2 }}>
              {saving ? 'Saving...' : 'Save Account'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountForm;
