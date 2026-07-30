import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Button, Avatar, Chip, IconButton, Tooltip } from '@mui/material';
import { Add, Edit, Delete, People } from '@mui/icons-material';
import { fetchGroups, createGroup } from '../../store/slices/contactsSlice';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';

const CustomerGroups = () => {
  const dispatch = useDispatch();
  const { groups, items } = useSelector(s => s.contacts);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#1976d2' });

  useEffect(() => { dispatch(fetchGroups()); }, [dispatch]);

  const handleSave = () => {
    dispatch(createGroup(form));
    setModal(false);
    setForm({ name: '', description: '', color: '#1976d2' });
  };

  const colors = ['#1976d2', '#388e3c', '#f57c00', '#9c27b0', '#d32f2f', '#0288d1', '#2e7d32', '#6d4c41'];

  return (
    <Box>
      <PageHeader
        title="Customer Groups"
        subtitle="Organize contacts into groups for targeted communication"
        breadcrumbs={[{ label: 'Contacts', path: '/contacts' }, { label: 'Customer Groups' }]}
        actions={[{ label: 'Create Group', icon: <Add />, onClick: () => setModal(true), variant: 'contained' }]}
      />
      <Grid container spacing={2.5}>
        {groups.map((group) => {
          const count = items.filter(c => c.group === group.name).length;
          return (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: group.color + '20', color: group.color, width: 44, height: 44, borderRadius: 2.5 }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{group.description}</Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip label={`${count} contacts`} size="small" sx={{ bgcolor: group.color + '15', color: group.color, fontWeight: 700, fontSize: '0.72rem' }} />
                    <Button size="small" variant="text" sx={{ fontSize: '0.75rem' }}>View Contacts</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Customer Group" maxWidth="xs"
        actions={[{ label: 'Cancel', onClick: () => setModal(false), variant: 'outlined' }, { label: 'Create', onClick: handleSave, variant: 'contained' }]}>
        <Grid container spacing={2}>
          <Grid item xs={12}><FormField name="name" label="Group Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required /></Grid>
          <Grid item xs={12}><FormField name="description" label="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} /></Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>Color</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colors.map(c => (
                <Box key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                  sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none' }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Modal>
    </Box>
  );
};

export default CustomerGroups;
