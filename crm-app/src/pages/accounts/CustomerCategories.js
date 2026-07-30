import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Button, Avatar, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Tooltip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Paper, List, ListItem, ListItemText
} from '@mui/material';
import { Add, Edit, Delete, Category, Business, Star, Diamond, WorkspacePremium, Shield } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockCategories = [
  { id: 1, name: 'Enterprise', icon: '🏢', color: '#1976d2', description: 'Large enterprises with 500+ employees', accounts: 8, creditLimit: '₹50L', discount: '20%', priority: 'Platinum', sla: '4 hours' },
  { id: 2, name: 'SMB', icon: '🏪', color: '#388e3c', description: 'Small and medium businesses 50–500 employees', accounts: 24, creditLimit: '₹10L', discount: '10%', priority: 'Gold', sla: '8 hours' },
  { id: 3, name: 'Startup', icon: '🚀', color: '#f57c00', description: 'Early-stage startups under 50 employees', accounts: 15, creditLimit: '₹2L', discount: '5%', priority: 'Silver', sla: '24 hours' },
  { id: 4, name: 'Government', icon: '🏛️', color: '#9c27b0', description: 'Govt. organizations and PSUs', accounts: 5, creditLimit: '₹1Cr', discount: '0%', priority: 'Platinum', sla: '4 hours' },
  { id: 5, name: 'Partner', icon: '🤝', color: '#00796b', description: 'Resellers, referral and channel partners', accounts: 10, creditLimit: '₹20L', discount: '30%', priority: 'Gold', sla: '8 hours' },
];

const priorityIcons = { Platinum: <Diamond sx={{ fontSize: 14 }} />, Gold: <Star sx={{ fontSize: 14 }} />, Silver: <WorkspacePremium sx={{ fontSize: 14 }} /> };
const priorityColors = { Platinum: '#7b1fa2', Gold: '#f9a825', Silver: '#78909c' };

export default function CustomerCategories() {
  const [categories, setCategories] = useState(mockCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#1976d2', discount: '', creditLimit: '', sla: '', priority: 'Gold' });

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description, color: cat.color, discount: cat.discount, creditLimit: cat.creditLimit, sla: cat.sla, priority: cat.priority });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editCat) {
      setCategories(prev => prev.map(c => c.id === editCat.id ? { ...c, ...form } : c));
    } else {
      setCategories(prev => [...prev, { id: Date.now(), icon: '📋', accounts: 0, ...form }]);
    }
    setDialogOpen(false);
    setEditCat(null);
    setForm({ name: '', description: '', color: '#1976d2', discount: '', creditLimit: '', sla: '', priority: 'Gold' });
  };

  return (
    <Box>
      <PageHeader
        title="Customer Categories"
        subtitle="Define customer tiers with different credit limits, discounts and SLA levels"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'Customer Categories' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={() => { setEditCat(null); setDialogOpen(true); }}>New Category</Button>}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {categories.map(cat => (
          <Grid item xs={12} sm={6} md={4} key={cat.id}>
            <Card variant="outlined" sx={{ borderTop: `4px solid ${cat.color}`, '&:hover': { boxShadow: 3 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize={28}>{cat.icon}</Typography>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{cat.name}</Typography>
                      <Chip icon={priorityIcons[cat.priority]} label={cat.priority} size="small"
                        sx={{ bgcolor: priorityColors[cat.priority] + '20', color: priorityColors[cat.priority], fontWeight: 600, height: 18, fontSize: '0.65rem' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(cat)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{cat.description}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {[
                    { label: 'Accounts', value: cat.accounts },
                    { label: 'Credit Limit', value: cat.creditLimit },
                    { label: 'Discount', value: cat.discount },
                    { label: 'SLA Response', value: cat.sla },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCat ? 'Edit Category' : 'New Customer Category'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { label: 'Category Name', key: 'name' },
              { label: 'Description', key: 'description' },
              { label: 'Discount (%)', key: 'discount' },
              { label: 'Credit Limit', key: 'creditLimit' },
              { label: 'SLA Response Time', key: 'sla', placeholder: 'e.g. 4 hours' },
            ].map(({ label, key, placeholder }) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField fullWidth label={label} value={form[key]} placeholder={placeholder}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
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
