import React, { useState } from 'react';
import {
  Box, Card, Grid, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Tooltip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { Add, Edit, Delete, LocalShipping, Search, ContentCopy } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockAddresses = [
  { id: 1, account: 'TechCorp Ltd', address: '4th Floor, TechCorp Tower, BKC', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', country: 'India', sameAsBilling: true },
  { id: 2, account: 'GlobalTech Inc', address: 'Warehouse No. 5, Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', country: 'India', sameAsBilling: false },
  { id: 3, account: 'ABC Industries', address: 'Factory Plot 8, MIDC', city: 'Pune', state: 'Maharashtra', pincode: '411019', country: 'India', sameAsBilling: false },
];

const emptyForm = { account: '', address: '', city: '', state: '', pincode: '', country: 'India' };

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = addresses.filter(a => !search || a.account.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (editId) setAddresses(prev => prev.map(a => a.id === editId ? { ...a, ...form } : a));
    else setAddresses(prev => [...prev, { id: Date.now(), sameAsBilling: false, ...form }]);
    setDialogOpen(false); setForm(emptyForm); setEditId(null);
  };
  const openEdit = (addr) => { setEditId(addr.id); setForm({ account: addr.account, address: addr.address, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country }); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader title="Shipping Address" subtitle="Delivery and shipping addresses for all accounts"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Shipping Address' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }}>Add Address</Button>} />
      <Box sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
      </Box>
      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell>Account</TableCell><TableCell>Address</TableCell><TableCell>City</TableCell>
            <TableCell>State</TableCell><TableCell>Pincode</TableCell><TableCell>Type</TableCell><TableCell align="right">Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.map(addr => (
              <TableRow key={addr.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{addr.account}</Typography></TableCell>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalShipping sx={{ fontSize: 14, color: '#388e3c' }} /><Typography variant="body2">{addr.address}</Typography></Box></TableCell>
                <TableCell>{addr.city}</TableCell><TableCell>{addr.state}</TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{addr.pincode}</Typography></TableCell>
                <TableCell>{addr.sameAsBilling ? <Chip label="Same as Billing" size="small" color="info" variant="outlined" /> : <Chip label="Different" size="small" variant="outlined" />}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Copy from Billing"><IconButton size="small"><ContentCopy fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(addr)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setAddresses(p => p.filter(a => a.id !== addr.id))}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Shipping Address' : 'New Shipping Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[{ label: 'Account', key: 'account' }, { label: 'Street Address', key: 'address' }, { label: 'City', key: 'city' }, { label: 'State', key: 'state' }, { label: 'Pincode', key: 'pincode' }, { label: 'Country', key: 'country' }].map(({ label, key }) => (
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
