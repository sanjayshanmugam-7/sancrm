import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, Divider, Alert, List, ListItem, ListItemText,
  ListItemAvatar, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stepper, Step, StepLabel
} from '@mui/material';
import {
  Draw, CheckCircle, Schedule, Email, Visibility, Cancel,
  Download, History, Verified, Send, PersonAdd, Add
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';

const mockRequests = [
  {
    id: 1, document: 'Q4 Sales Proposal – TechCorp', type: 'Proposal', createdAt: '2024-11-10',
    expiresAt: '2024-12-10', status: 'Partially Signed',
    signatories: [
      { name: 'Anjali Sharma', email: 'anjali@sancrm.com', status: 'Signed', signedAt: '2024-11-10 09:30 AM' },
      { name: 'Mohan Patel', email: 'mohan@techcorp.com', status: 'Pending', signedAt: null },
    ]
  },
  {
    id: 2, document: 'NDA – GlobalTech', type: 'Agreement', createdAt: '2024-11-08',
    expiresAt: '2024-11-30', status: 'Pending',
    signatories: [
      { name: 'Ravi Kumar', email: 'ravi@sancrm.com', status: 'Pending', signedAt: null },
      { name: 'Sarah Johnson', email: 'sarah@globaltech.com', status: 'Pending', signedAt: null },
    ]
  },
  {
    id: 3, document: 'Annual SLA – ABC Industries', type: 'Agreement', createdAt: '2024-10-20',
    expiresAt: '2024-11-20', status: 'Completed',
    signatories: [
      { name: 'Priya Mehta', email: 'priya@sancrm.com', status: 'Signed', signedAt: '2024-10-21' },
      { name: 'Vijay Desai', email: 'vijay@abc.com', status: 'Signed', signedAt: '2024-10-22' },
    ]
  },
  {
    id: 4, document: 'Quotation – Pharma Corp', type: 'Quotation', createdAt: '2024-10-01',
    expiresAt: '2024-10-15', status: 'Expired',
    signatories: [
      { name: 'Suresh Nair', email: 'suresh@sancrm.com', status: 'Signed', signedAt: '2024-10-02' },
      { name: 'Dr. Rao', email: 'rao@pharma.com', status: 'Pending', signedAt: null },
    ]
  },
];

const stats = [
  { title: 'Total Requests', value: '28', subtitle: 'All time', icon: <Draw />, color: '#1976d2' },
  { title: 'Completed', value: '18', subtitle: '64% completion rate', icon: <CheckCircle />, color: '#388e3c' },
  { title: 'Pending', value: '7', subtitle: '3 expiring soon', icon: <Schedule />, color: '#f57c00' },
  { title: 'Expired', value: '3', subtitle: 'Need renewal', icon: <Cancel />, color: '#d32f2f' },
];

const sigStatusConfig = {
  Signed: { color: 'success', icon: <CheckCircle fontSize="small" /> },
  Pending: { color: 'warning', icon: <Schedule fontSize="small" /> },
};

export default function DigitalSignature() {
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <PageHeader
        title="Digital Signature"
        subtitle="Send, track, and manage e-signature requests"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            New Signature Request
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Requests Table */}
        <Grid item xs={12} md={selected ? 7 : 12}>
          <Card>
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" gutterBottom>Signature Requests</Typography>
            </CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Signatories</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockRequests.map((req) => (
                  <TableRow key={req.id} hover sx={{ cursor: 'pointer', bgcolor: selected?.id === req.id ? '#e3f2fd' : 'inherit' }}
                    onClick={() => setSelected(req)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{req.document}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={req.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {req.signatories.map((s, i) => (
                          <Tooltip key={i} title={`${s.name}: ${s.status}`}>
                            <Avatar sx={{
                              width: 28, height: 28, fontSize: '0.7rem',
                              bgcolor: s.status === 'Signed' ? '#e8f5e9' : '#fff8e1',
                              color: s.status === 'Signed' ? '#388e3c' : '#f57c00',
                            }}>
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{req.createdAt}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" color={req.status === 'Expired' ? 'error' : 'text.primary'}>{req.expiresAt}</Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Download"><IconButton size="small"><Download fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Send Reminder"><IconButton size="small" disabled={req.status === 'Completed'}><Email fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Detail Panel */}
        {selected && (
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Signature Details</Typography>
                  <Button size="small" onClick={() => setSelected(null)}>Close</Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" fontWeight={600} gutterBottom>{selected.document}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={selected.type} size="small" />
                  <StatusBadge status={selected.status} />
                </Box>
                <Typography variant="subtitle2" gutterBottom>Signing Progress</Typography>
                <List dense>
                  {selected.signatories.map((sig, i) => (
                    <ListItem key={i} divider={i < selected.signatories.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 36, height: 36,
                          bgcolor: sig.status === 'Signed' ? '#e8f5e9' : '#fff8e1',
                          color: sig.status === 'Signed' ? '#388e3c' : '#f57c00',
                        }}>
                          {sig.status === 'Signed' ? <CheckCircle /> : <Schedule />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{sig.name}</Typography>
                          <Chip label={sig.status} size="small" color={sigStatusConfig[sig.status].color} />
                        </Box>}
                        secondary={sig.signedAt ? `Signed: ${sig.signedAt}` : sig.email}
                      />
                      {sig.status === 'Pending' && (
                        <Button size="small" startIcon={<Email />} variant="outlined">Remind</Button>
                      )}
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<History />} size="small">Audit Trail</Button>
                  <Button variant="outlined" startIcon={<Download />} size="small">Download</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* New Signature Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Signature Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Select Document" select>
                <option value="">-- Choose --</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">Signatories will receive an email with a secure link to sign the document electronically.</Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />} onClick={() => setDialogOpen(false)}>Send Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
