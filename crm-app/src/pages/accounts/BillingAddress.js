import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Table, TableBody,
  TableCell, TableHead, TableRow, IconButton, Tooltip, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete, LocationOn, Search } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockAddresses = [
  { id: 1, account: 'TechCorp Ltd', address: '4th Floor, TechCorp Tower, BKC', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', country: 'India', gstin: '27AABCC1234D1Z5' },
  { id: 2, account: 'GlobalTech Inc', address: 'Plot 12, Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122002', country: 'India', gstin: '06AABCC9012F3Z1' },
  { id: 3, account: 'ABC Industries', address: '23, Industrial Area, Phase 2', city: 'Pune', state: 'Maharashtra', pincode: '411057', country: 'India', gstin: '27AABCC5678E2Z6' },
];

const emptyForm = { account: '', address: '', city: '', state: '', pincode: '', country: 'India', gstin: '' };

export default function BillingAddress() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = addresses.filter(a => !search || a.account.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (editId) setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
    else setAddresses(prev => [...prev, { id: Date.now(), ...form }]);
    setDialogOpen(false); setForm(emptyForm); setEditId(null);
  };
  const openEdit = (addr) => { setEditId(addr.id); setForm({ account: addr.account, address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, gstin: addr.gstin }); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader title="Billing Address" subtitle="Manage billing addresses for all accounts"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Billing Address' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }}>Add Address</Button>} />
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
      </Box>
      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell>Account</TableCell><TableCell>Address</TableCell><TableCell>City</TableCell>
            <TableCell>State</TableCell><TableCell>Pincode</TableCell><TableCell>GSTIN</TableCell><TableCell align="right">Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.map(addr => (
              <TableRow key={addr.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{addr.account}</Typography></TableCell>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationOn sx={{ fontSize: 14, color: '#1976d2' }} /><Typography variant="body2">{addr.address}</Typography></Box></TableCell>
                <TableCell>{addr.city}</TableCell><TableCell>{addr.state}</TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{addr.pincode}</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{addr.gstin}</Typography></TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(addr)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setAddresses(p => p.filter(a => a.id !== addr.id))}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Billing Address' : 'New Billing Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[{ label: 'Account', key: 'account' }, { label: 'Street Address', key: 'address' }, { label: 'City', key: 'city' }, { label: 'State', key: 'state' }, { label: 'Pincode', key: 'pincode' }, { label: 'Country', key: 'country' }, { label: 'GSTIN', key: 'gstin' }].map(({ label, key }) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField fullWidth label={label} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
