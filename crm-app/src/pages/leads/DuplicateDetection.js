import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid, Typography, Button, Avatar, Chip,
  LinearProgress, Divider, Alert, Radio, RadioGroup, FormControlLabel,
} from '@mui/material';
import { MergeType, Check, Close, ArrowBack, Refresh } from '@mui/icons-material';
import { detectDuplicates } from '../../store/slices/leadsSlice';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';

const mockDuplicates = [
  {
    id: 'dup1',
    original: { id: '1', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@example.com', phone: '+91-9876543210', company: 'TechCorp India', status: 'new', aiScore: 87, source: 'Website', createdAt: '2024-01-15' },
    duplicate: { id: '9', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.s@techcorp.in', phone: '+91-9876543210', company: 'TechCorp', status: 'new', aiScore: 72, source: 'Google Ads', createdAt: '2024-01-20' },
    confidence: 92,
    matchFields: ['Phone', 'First Name', 'Last Name'],
  },
  {
    id: 'dup2',
    original: { id: '2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@gmail.com', phone: '+91-9123456789', company: 'Retail Solutions', status: 'contacted', aiScore: 62, source: 'Facebook', createdAt: '2024-01-16' },
    duplicate: { id: '10', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@gmail.com', phone: '+91-9000111222', company: 'Retail Solutions Ltd', status: 'new', aiScore: 45, source: 'Website', createdAt: '2024-01-22' },
    confidence: 88,
    matchFields: ['Email', 'First Name', 'Last Name', 'Company'],
  },
];

const DuplicateDetection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(true);
  const [duplicates, setDuplicates] = useState(mockDuplicates);
  const [decisions, setDecisions] = useState({});
  const [merging, setMerging] = useState(false);
  const [done, setDone] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    setScanning(false);
    setScanned(true);
  };

  const handleDecision = (dupId, decision) => {
    setDecisions(prev => ({ ...prev, [dupId]: decision }));
  };

  const handleMergeAll = async () => {
    setMerging(true);
    await new Promise(r => setTimeout(r, 1500));
    setMerging(false);
    setDone(true);
  };

  const getConfidenceColor = (c) => c >= 90 ? '#d32f2f' : c >= 75 ? '#f57c00' : '#388e3c';

  return (
    <Box>
      <PageHeader
        title="Duplicate Detection"
        subtitle="Find and merge duplicate leads automatically using AI"
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: 'Duplicate Detection' }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' },
          { label: 'Scan Again', icon: <Refresh />, onClick: handleScan, variant: 'outlined' },
        ]}
      />

      {!scanned ? (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {scanning ? (
              <Box>
                <MergeType sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Scanning for duplicates...</Typography>
                <LinearProgress sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2, height: 8 }} />
              </Box>
            ) : (
              <Box>
                <MergeType sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>Ready to scan</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  AI will analyze your leads and identify potential duplicates based on name, email, phone, and company.
                </Typography>
                <Button variant="contained" onClick={handleScan} size="large" sx={{ borderRadius: 2 }}>
                  Start Scanning
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : done ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          All duplicate decisions applied. {Object.keys(decisions).length} pairs processed.
        </Alert>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Found <strong>{duplicates.length} potential duplicate pairs</strong>. Review each pair and decide to merge or keep separate.
          </Alert>

          {duplicates.map((dup) => (
            <Card key={dup.id} sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <MergeType sx={{ color: getConfidenceColor(dup.confidence) }} />
                  <Typography variant="subtitle1" fontWeight={700}>Potential Duplicate</Typography>
                  <Chip
                    label={`${dup.confidence}% match`}
                    size="small"
                    sx={{ bgcolor: `${getConfidenceColor(dup.confidence)}18`, color: getConfidenceColor(dup.confidence), fontWeight: 700, fontSize: '0.75rem' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    {dup.matchFields.map(f => <Chip key={f} label={f} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />)}
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {[{ label: 'Original Lead', lead: dup.original, tag: 'Keep' }, { label: 'Duplicate Lead', lead: dup.duplicate, tag: 'Merge' }].map(({ label, lead, tag }) => (
                    <Grid item xs={12} md={6} key={label}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d220', color: '#1976d2', fontSize: '0.8rem', fontWeight: 700 }}>
                            {lead.firstName[0]}{lead.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{lead.firstName} {lead.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{lead.company}</Typography>
                          </Box>
                          <Chip label={label} size="small" color={tag === 'Keep' ? 'primary' : 'default'} sx={{ ml: 'auto', fontWeight: 600, fontSize: '0.7rem' }} />
                        </Box>
                        {[
                          { label: 'Email', value: lead.email },
                          { label: 'Phone', value: lead.phone },
                          { label: 'Source', value: lead.source },
                          { label: 'Created', value: lead.createdAt },
                        ].map(({ label: l, value }) => (
                          <Box key={l} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 55, fontWeight: 600 }}>{l}:</Typography>
                            <Typography variant="caption">{value || '-'}</Typography>
                          </Box>
                        ))}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <StatusBadge status={lead.status} />
                          <AIScoreBadge score={lead.aiScore} size="small" />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="body2" fontWeight={600}>Action:</Typography>
                  <RadioGroup row value={decisions[dup.id] || ''} onChange={(e) => handleDecision(dup.id, e.target.value)}>
                    <FormControlLabel value="merge" control={<Radio size="small" />} label={<Typography variant="body2">Merge into original</Typography>} />
                    <FormControlLabel value="keep" control={<Radio size="small" />} label={<Typography variant="body2">Keep both separate</Typography>} />
                    <FormControlLabel value="skip" control={<Radio size="small" />} label={<Typography variant="body2">Skip for now</Typography>} />
                  </RadioGroup>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleMergeAll} startIcon={<Check />} disabled={merging || Object.keys(decisions).length === 0} sx={{ borderRadius: 2 }}>
              {merging ? 'Processing...' : `Apply ${Object.keys(decisions).length} Decisions`}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DuplicateDetection;
