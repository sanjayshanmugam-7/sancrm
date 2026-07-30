import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button, Tabs, Tab, Divider, List, ListItem, ListItemText, Paper } from '@mui/material';
import { Edit, Delete, Phone, Email, WhatsApp, Event, ArrowBack } from '@mui/icons-material';
import { fetchContactById } from '../../store/slices/contactsSlice';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const TabPanel = ({ value, index, children }) => value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.contacts);
  const [tab, setTab] = useState(0);

  useEffect(() => { dispatch(fetchContactById(id)); }, [id, dispatch]);

  const contact = items.find(c => c.id === id);
  if (!contact) return <Box p={3}><Typography>Contact not found</Typography></Box>;

  return (
    <Box>
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={`${contact.jobTitle} at ${contact.company}`}
        breadcrumbs={[{ label: 'Contacts', path: '/contacts' }, { label: `${contact.firstName} ${contact.lastName}` }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/contacts'), variant: 'outlined' },
          { label: 'Edit', icon: <Edit />, onClick: () => navigate(`/contacts/${id}/edit`), variant: 'outlined' },
          { label: 'Delete', icon: <Delete />, onClick: () => {}, variant: 'outlined', color: 'error' },
        ]}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: '#1976d220', color: '#1976d2', fontSize: '1.8rem', fontWeight: 700, mb: 1.5 }}>
                {contact.firstName?.[0]}{contact.lastName?.[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{contact.firstName} {contact.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">{contact.jobTitle}</Typography>
              <Typography variant="body2" color="text.secondary">{contact.company}</Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1.5, mb: 2 }}>
                <StatusBadge status={contact.status} />
                <Chip label={contact.type === 'business' ? 'Business' : 'Individual'} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button size="small" variant="outlined" startIcon={<Phone />} sx={{ borderRadius: 2, fontSize: '0.75rem' }}>Call</Button>
                <Button size="small" variant="outlined" startIcon={<Email />} sx={{ borderRadius: 2, fontSize: '0.75rem' }}>Email</Button>
                <Button size="small" variant="outlined" startIcon={<WhatsApp />} sx={{ borderRadius: 2, fontSize: '0.75rem' }}>WhatsApp</Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              {[
                { label: 'Email', value: contact.email },
                { label: 'Phone', value: contact.phone },
                { label: 'Group', value: contact.group },
                { label: 'Created', value: contact.createdAt },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                  <Typography variant="caption" fontWeight={500}>{value || '-'}</Typography>
                </Box>
              ))}
              {contact.address && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="left" fontWeight={600} mb={0.5}>ADDRESS</Typography>
                  <Typography variant="caption" display="block" textAlign="left">
                    {contact.address.street}, {contact.address.city}, {contact.address.state} {contact.address.pincode}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                <Tab label="Overview" />
                <Tab label="Activities" />
                <Tab label="Notes" />
                <Tab label="Relationships" />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <TabPanel value={tab} index={0}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Type', value: contact.type },
                    { label: 'Status', value: <StatusBadge status={contact.status} /> },
                    { label: 'Group', value: contact.group || '-' },
                    { label: 'Tags', value: contact.tags?.join(', ') || '-' },
                    { label: 'Industry', value: contact.company },
                    { label: 'Created', value: contact.createdAt },
                  ].map(({ label, value }) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>{label}</Typography>
                      <Box sx={{ mt: 0.25 }}>{typeof value === 'string' ? <Typography variant="body2" fontWeight={500}>{value}</Typography> : value}</Box>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
              <TabPanel value={tab} index={1}>
                <Typography variant="body2" color="text.secondary">No activities yet. Activities from leads and opportunities associated with this contact will appear here.</Typography>
              </TabPanel>
              <TabPanel value={tab} index={2}>
                <Typography variant="body2" color="text.secondary">No notes added yet.</Typography>
              </TabPanel>
              <TabPanel value={tab} index={3}>
                <Typography variant="body2" color="text.secondary">Relationship mapping will show connections to other contacts, accounts, and opportunities.</Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactDetail;
