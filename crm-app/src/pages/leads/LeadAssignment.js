import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid, Typography, Button, Avatar,
  Chip, Switch, FormControlLabel, Divider, Alert, IconButton,
  Paper, List, ListItem, ListItemText, ListItemAvatar, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add, Delete, Edit, ArrowBack, Assignment, AutoAwesome } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import Modal from '../../components/common/Modal';

const mockAgents = [
  { id: '1', name: 'Ravi Kumar', email: 'ravi@sancrm.com', leads: 24, capacity: 30, active: true },
  { id: '2', name: 'Sneha Rao', email: 'sneha@sancrm.com', leads: 18, capacity: 25, active: true },
  { id: '3', name: 'Meera Joshi', email: 'meera@sancrm.com', leads: 15, capacity: 25, active: true },
  { id: '4', name: 'Vikram Das', email: 'vikram@sancrm.com', leads: 8, capacity: 20, active: false },
];

const mockRules = [
  { id: '1', name: 'High-value Technology Leads', conditions: [{ field: 'industry', operator: '=', value: 'Technology' }, { field: 'budget', operator: '>', value: '500000' }], assignTo: 'Ravi Kumar', priority: 1, active: true },
  { id: '2', name: 'Facebook Campaign Leads', conditions: [{ field: 'source', operator: '=', value: 'Facebook' }], assignTo: 'Sneha Rao', priority: 2, active: true },
  { id: '3', name: 'Healthcare Leads', conditions: [{ field: 'industry', operator: '=', value: 'Healthcare' }], assignTo: 'Meera Joshi', priority: 3, active: false },
];

const LeadAssignment = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState(mockRules);
  const [agents] = useState(mockAgents);
  const [addModal, setAddModal] = useState(false);
  const [rrEnabled, setRrEnabled] = useState(true);
  const [newRule, setNewRule] = useState({ name: '', conditions: [{ field: 'source', operator: '=', value: '' }], assignTo: '', priority: rules.length + 1, active: true });

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const addRule = () => {
    setRules(prev => [...prev, { ...newRule, id: Date.now().toString() }]);
    setAddModal(false);
  };

  return (
    <Box>
      <PageHeader
        title="Lead Assignment Rules"
        subtitle="Automatically assign leads to agents based on rules"
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: 'Lead Assignment' }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' },
          { label: 'Add Rule', icon: <Add />, onClick: () => setAddModal(true), variant: 'contained' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Agent Capacity */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Agent Capacity</Typography>
              {agents.map((agent) => (
                <Box key={agent.id} sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, opacity: agent.active ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#1976d220', color: '#1976d2' }}>{agent.name.split(' ').map(n => n[0]).join('')}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{agent.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{agent.leads}/{agent.capacity} leads</Typography>
                    </Box>
                    <Chip label={agent.active ? 'Active' : 'Inactive'} size="small" color={agent.active ? 'success' : 'default'} sx={{ fontSize: '0.68rem', height: 20 }} />
                  </Box>
                  <Box sx={{ bgcolor: '#f4f6f8', borderRadius: 1, height: 6 }}>
                    <Box sx={{ width: `${(agent.leads / agent.capacity) * 100}%`, bgcolor: agent.leads / agent.capacity > 0.8 ? '#d32f2f' : '#1976d2', height: 6, borderRadius: 1 }} />
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={<Switch checked={rrEnabled} onChange={(e) => setRrEnabled(e.target.checked)} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Round-Robin Assignment</Typography>
                    <Typography variant="caption" color="text.secondary">Auto-assign to next available agent</Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 0.25 } }}
              />
            </CardContent>
          </Card>

          <Card sx={{ mt: 2, bgcolor: '#e8f5e918', border: '1px solid #c8e6c9' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <AutoAwesome sx={{ color: '#388e3c', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={700} color="#2e7d32">AI Assignment</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                AI analyzes lead quality, agent expertise, and availability to suggest optimal assignments.
              </Typography>
              <Button variant="outlined" color="success" size="small" fullWidth sx={{ mt: 1.5, borderRadius: 2, fontSize: '0.75rem' }}>
                Enable AI Assignment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Rules */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Assignment Rules</Typography>
              {rules.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No rules configured yet.</Typography>
                  <Button startIcon={<Add />} onClick={() => setAddModal(true)} sx={{ mt: 1.5 }}>Add Rule</Button>
                </Box>
              ) : rules.map((rule) => (
                <Paper key={rule.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, opacity: rule.active ? 1 : 0.6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        <Chip label={`P${rule.priority}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#1976d218', color: '#1976d2', fontWeight: 700 }} />
                        <Typography variant="body2" fontWeight={700}>{rule.name}</Typography>
                        {!rule.active && <Chip label="Disabled" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 0.75 }}>
                        {rule.conditions.map((c, i) => (
                          <Chip key={i} label={`${c.field} ${c.operator} ${c.value}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.72rem' }} />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Assignment sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">Assign to: <strong>{rule.assignTo}</strong></Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Switch size="small" checked={rule.active} onChange={() => toggleRule(rule.id)} />
                      <IconButton size="small"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => deleteRule(rule.id)}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Rule Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Assignment Rule" maxWidth="sm"
        actions={[
          { label: 'Cancel', onClick: () => setAddModal(false), variant: 'outlined' },
          { label: 'Add Rule', onClick: addRule, variant: 'contained' },
        ]}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormField name="name" label="Rule Name" value={newRule.name} onChange={(e) => setNewRule(p => ({ ...p, name: e.target.value }))} required />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CONDITIONS</Typography>
            {newRule.conditions.map((cond, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <FormField type="select" name="field" label="Field" value={cond.field} onChange={(e) => { const c = [...newRule.conditions]; c[i].field = e.target.value; setNewRule(p => ({ ...p, conditions: c })); }}
                  options={['source', 'industry', 'budget', 'status', 'aiScore'].map(f => ({ label: f, value: f }))} sx={{ flex: 1 }} />
                <FormField type="select" name="op" label="Op" value={cond.operator} onChange={(e) => { const c = [...newRule.conditions]; c[i].operator = e.target.value; setNewRule(p => ({ ...p, conditions: c })); }}
                  options={['=', '!=', '>', '<', 'contains'].map(o => ({ label: o, value: o }))} sx={{ width: 90 }} />
                <FormField name="val" label="Value" value={cond.value} onChange={(e) => { const c = [...newRule.conditions]; c[i].value = e.target.value; setNewRule(p => ({ ...p, conditions: c })); }} sx={{ flex: 1 }} />
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <FormField type="select" name="assignTo" label="Assign To" value={newRule.assignTo} onChange={(e) => setNewRule(p => ({ ...p, assignTo: e.target.value }))}
              options={agents.map(a => ({ label: a.name, value: a.name }))} required />
          </Grid>
        </Grid>
      </Modal>
    </Box>
  );
};

export default LeadAssignment;
