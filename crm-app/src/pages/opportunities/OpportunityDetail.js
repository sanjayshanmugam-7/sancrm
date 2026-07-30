import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, Typography, Chip, Button, Tabs, Tab, Divider, Avatar, LinearProgress, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { Edit, Delete, ArrowBack, AutoAwesome, TrendingUp, Timeline } from '@mui/icons-material';
import { fetchOpportunityById, moveOpportunityStage } from '../../store/slices/opportunitiesSlice';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';
import PageHeader from '../../components/common/PageHeader';

const pipelineStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];
const stageColors = { lead: '#42a5f5', qualified: '#66bb6a', proposal: '#ba68c8', negotiation: '#ffa726', closed_won: '#26a69a', closed_lost: '#ef5350' };

const TabPanel = ({ value, index, children }) => value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector(s => s.opportunities);
  const [tab, setTab] = useState(0);

  useEffect(() => { dispatch(fetchOpportunityById(id)); }, [id, dispatch]);

  const opp = items.find(o => o.id === id);
  if (!opp) return <Box p={3}><Typography>Opportunity not found</Typography></Box>;

  const formatCurrency = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${v?.toLocaleString('en-IN')}`;
  const currentStageIdx = pipelineStages.indexOf(opp.stage);

  return (
    <Box>
      <PageHeader
        title={opp.title}
        subtitle={`${opp.accountName} · ${opp.contactName}`}
        breadcrumbs={[{ label: 'Opportunities', path: '/opportunities' }, { label: opp.title }]}
        actions={[
          { label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/opportunities'), variant: 'outlined' },
          { label: 'Edit', icon: <Edit />, onClick: () => navigate(`/opportunities/${id}/edit`), variant: 'outlined' },
          { label: 'Delete', icon: <Delete />, onClick: () => {}, variant: 'outlined', color: 'error' },
        ]}
      />

      {/* Pipeline Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stepper activeStep={currentStageIdx} alternativeLabel>
            {pipelineStages.map((stage) => (
              <Step key={stage} completed={pipelineStages.indexOf(stage) < currentStageIdx}
                onClick={() => dispatch(moveOpportunityStage({ id, stage }))} sx={{ cursor: 'pointer' }}>
                <StepLabel StepIconProps={{ sx: { '&.Mui-active': { color: stageColors[stage] }, '&.Mui-completed': { color: '#388e3c' } } }}>
                  <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{stage.replace('_', ' ')}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" fontWeight={900} sx={{ color: stageColors[opp.stage] || '#1976d2' }}>{formatCurrency(opp.value)}</Typography>
                <Typography variant="body2" color="text.secondary">Deal Value</Typography>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              {[
                { label: 'Stage', value: <Chip label={opp.stage?.replace('_', ' ')} size="small" sx={{ bgcolor: `${stageColors[opp.stage]}22`, color: stageColors[opp.stage], fontWeight: 700, textTransform: 'capitalize' }} /> },
                { label: 'Probability', value: <Typography variant="body2" fontWeight={700} sx={{ color: opp.probability >= 70 ? '#388e3c' : '#f57c00' }}>{opp.probability}%</Typography> },
                { label: 'Account', value: opp.accountName },
                { label: 'Contact', value: opp.contactName },
                { label: 'Assigned To', value: opp.assignedTo },
                { label: 'Source', value: opp.source },
                { label: 'Expected Close', value: opp.expectedClose },
                { label: 'Created', value: opp.createdAt },
                { label: 'Activities', value: `${opp.activities} activities` },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                  {typeof value === 'string' ? <Typography variant="caption" fontWeight={500}>{value}</Typography> : value}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* AI Prediction */}
          {opp.aiPrediction && (
            <Card sx={{ bgcolor: '#f3e5f518', border: '1px solid #e1bee7' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
                  <AutoAwesome sx={{ color: '#9c27b0', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#7b1fa2">AI Prediction</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontSize="0.8rem">Win Probability</Typography>
                  <AIScoreBadge score={opp.aiPrediction.winProbability} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontSize="0.8rem">Expected Revenue</Typography>
                  <Typography variant="body2" fontWeight={700}>{formatCurrency(opp.aiPrediction.expectedRevenue)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                  💡 {opp.aiPrediction.recommendation}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Tabs */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                <Tab label="Overview" /><Tab label="Timeline" /><Tab label="Notes" /><Tab label="Documents" />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <TabPanel value={tab} index={0}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Description', value: opp.description || 'No description provided', span: 12 },
                  ].map(({ label, value, span }) => (
                    <Grid item xs={12} sm={span || 6} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>{label}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {opp.tags?.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {opp.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />)}
                  </Box>
                )}
              </TabPanel>
              <TabPanel value={tab} index={1}>
                <Box sx={{ position: 'relative', pl: 2 }}>
                  {[
                    { event: 'Opportunity created', date: opp.createdAt, type: 'create' },
                    { event: `Stage moved to ${opp.stage}`, date: opp.updatedAt, type: 'stage' },
                    { event: `${opp.activities} activities completed`, date: opp.updatedAt, type: 'activity' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, '&::before': { content: '""', position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, bgcolor: '#e0e0e0', zIndex: 0 } }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1976d2', flexShrink: 0, mt: 0.5, zIndex: 1, position: 'relative' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{item.event}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.date}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </TabPanel>
              <TabPanel value={tab} index={2}>
                <Typography variant="body2" color="text.secondary">No notes added yet.</Typography>
              </TabPanel>
              <TabPanel value={tab} index={3}>
                <Typography variant="body2" color="text.secondary">No documents attached.</Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunityDetail;
