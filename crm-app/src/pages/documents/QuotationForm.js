import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Divider, FormControl, InputLabel, Select, MenuItem, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow,
  InputAdornment, Alert, Chip
} from '@mui/material';
import { Add, Delete, Save, Send, Print, ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const taxOptions = [0, 5, 12, 18, 28];

export default function QuotationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    quotationNo: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    client: '', contact: '', opportunity: '', currency: 'INR',
    billingAddress: '', shippingAddress: '', sameAddress: true,
    paymentTerms: 'net30', deliveryTerms: '', notes: '', terms: '',
    discount: 0, shippingCharge: 0,
  });

  const [items, setItems] = useState([
    { id: 1, code: 'CRM-001', description: 'CRM Software License', qty: 1, unit: 'Year', unitPrice: 120000, taxRate: 18, discount: 0 },
    { id: 2, code: 'SVC-001', description: 'Implementation Services', qty: 1, unit: 'Project', unitPrice: 50000, taxRate: 18, discount: 0 },
  ]);

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), code: '', description: '', qty: 1, unit: 'Unit', unitPrice: 0, taxRate: 18, discount: 0 }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, field, value) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const getItemTotal = (item) => {
    const base = item.qty * item.unitPrice;
    const discountAmt = base * item.discount / 100;
    const taxAmt = (base - discountAmt) * item.taxRate / 100;
    return base - discountAmt + taxAmt;
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const totalDiscount = items.reduce((s, i) => s + (i.qty * i.unitPrice * i.discount / 100), 0) + (subtotal * form.discount / 100);
  const taxableAmount = subtotal - totalDiscount;
  const taxTotal = items.reduce((s, i) => {
    const base = i.qty * i.unitPrice * (1 - i.discount / 100);
    return s + base * i.taxRate / 100;
  }, 0);
  const grandTotal = taxableAmount + taxTotal + Number(form.shippingCharge || 0);

  return (
    <Box>
      <PageHeader
        title="Create Quotation"
        subtitle="Generate a detailed price quotation for your client"
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'New Quotation' }]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Print />} size="small">Print</Button>
            <Button variant="outlined" startIcon={<ContentCopy />} size="small">Duplicate</Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Left */}
        <Grid item xs={12} md={8}>
          {/* Header Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Quotation No." value={form.quotationNo} InputProps={{ readOnly: true }}
                    sx={{ bgcolor: '#f5f5f5' }} size="small" />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth type="date" label="Date" value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={6} md={4}>
                  <TextField fullWidth type="date" label="Valid Until" value={form.validUntil}
                    onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Client</InputLabel>
                    <Select value={form.client} onChange={(e) => setForm(f => ({ ...f, client: e.target.value }))} label="Client">
                      <MenuItem value="techcorp">TechCorp Ltd</MenuItem>
                      <MenuItem value="abc">ABC Industries</MenuItem>
                      <MenuItem value="xyz">XYZ Pvt Ltd</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Contact Person</InputLabel>
                    <Select value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} label="Contact Person">
                      <MenuItem value="mohan">Mohan Patel</MenuItem>
                      <MenuItem value="priya">Priya Verma</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Terms</InputLabel>
                    <Select value={form.paymentTerms} onChange={(e) => setForm(f => ({ ...f, paymentTerms: e.target.value }))} label="Payment Terms">
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="net15">Net 15 Days</MenuItem>
                      <MenuItem value="net30">Net 30 Days</MenuItem>
                      <MenuItem value="net60">Net 60 Days</MenuItem>
                      <MenuItem value="advance">100% Advance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Currency</InputLabel>
                    <Select value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))} label="Currency">
                      <MenuItem value="INR">INR (₹)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Line Items</Typography>
                <Button size="small" startIcon={<Add />} onClick={addItem}>Add Item</Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Disc%</TableCell>
                    <TableCell align="right">Tax%</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><TextField size="small" value={item.code} onChange={(e) => updateItem(item.id, 'code', e.target.value)} sx={{ width: 80 }} /></TableCell>
                      <TableCell><TextField size="small" fullWidth value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></TableCell>
                      <TableCell><TextField size="small" type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} sx={{ width: 60 }} /></TableCell>
                      <TableCell><TextField size="small" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} sx={{ width: 70 }} /></TableCell>
                      <TableCell><TextField size="small" type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', +e.target.value)} sx={{ width: 100 }} /></TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ width: 60 }}>
                          <Select value={item.discount} onChange={(e) => updateItem(item.id, 'discount', +e.target.value)}>
                            {[0, 5, 10, 15, 20, 25].map(d => <MenuItem key={d} value={d}>{d}%</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ width: 70 }}>
                          <Select value={item.taxRate} onChange={(e) => updateItem(item.id, 'taxRate', +e.target.value)}>
                            {taxOptions.map(t => <MenuItem key={t} value={t}>{t}%</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={600}>₹{Math.round(getItemTotal(item)).toLocaleString()}</Typography></TableCell>
                      <TableCell><IconButton size="small" onClick={() => removeItem(item.id)}><Delete fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth multiline rows={3} label="Notes to Client" value={form.notes}
                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth multiline rows={3} label="Terms & Conditions" value={form.terms}
                    onChange={(e) => setForm(f => ({ ...f, terms: e.target.value }))} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Amount Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{subtotal.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Global Discount</Typography>
                <TextField size="small" type="number" value={form.discount}
                  onChange={(e) => setForm(f => ({ ...f, discount: +e.target.value }))}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  sx={{ width: 90 }} inputProps={{ min: 0, max: 100 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Tax (GST)</Typography>
                <Typography variant="body2">₹{Math.round(taxTotal).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <TextField size="small" type="number" value={form.shippingCharge}
                  onChange={(e) => setForm(f => ({ ...f, shippingCharge: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  sx={{ width: 100 }} />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Grand Total</Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>₹{Math.round(grandTotal).toLocaleString()}</Typography>
              </Box>
              <Button fullWidth variant="outlined" startIcon={<Save />} sx={{ mb: 1 }} onClick={() => navigate('/documents')}>Save Draft</Button>
              <Button fullWidth variant="contained" startIcon={<Send />} onClick={() => navigate('/documents')}>Send to Client</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
