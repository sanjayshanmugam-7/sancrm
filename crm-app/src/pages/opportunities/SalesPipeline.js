import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, Button, IconButton, Tooltip, Paper } from '@mui/material';
import { Add, DragIndicator, TrendingUp, ArrowForward, AutoAwesome } from '@mui/icons-material';
import { fetchOpportunities, moveOpportunityStage } from '../../store/slices/opportunitiesSlice';
import StatusBadge from '../../components/common/StatusBadge';
import AIScoreBadge from '../../components/common/AIScoreBadge';
import PageHeader from '../../components/common/PageHeader';

const stages = [
  { key: 'lead', label: 'Lead', color: '#42a5f5', bg: '#e3f2fd' },
  { key: 'qualified', label: 'Qualified', color: '#66bb6a', bg: '#e8f5e9' },
  { key: 'proposal', label: 'Proposal', color: '#ba68c8', bg: '#f3e5f5' },
  { key: 'negotiation', label: 'Negotiation', color: '#ffa726', bg: '#fff3e0' },
  { key: 'closed_won', label: 'Closed Won', color: '#26a69a', bg: '#e0f2f1' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#ef5350', bg: '#ffebee' },
];

const formatCurrency = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v || 0).toLocaleString('en-IN')}`;

const OpportunityCard = ({ opportunity, onMove, navigate }) => {
  const [dragOver, setDragOver] = useState(false);
  const stage = stages.find(s => s.key === opportunity.stage);

  return (
    <Paper
      draggable
      onDragStart={(e) => e.dataTransfer.setData('oppId', opportunity.id)}
      elevation={0}
      sx={{
        p: 1.5, mb: 1.25, borderRadius: 2, cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        '&:hover': { boxShadow: 3, borderColor: stage?.color },
        transition: 'all 0.15s',
      }}
      onClick={() => navigate(`/opportunities/${opportunity.id}`)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
        <DragIndicator sx={{ fontSize: 14, color: 'text.secondary', cursor: 'grab', flexShrink: 0 }} />
        <Box sx={{ flex: 1, mx: 0.75 }}>
          <Typography variant="body2" fontWeight={700} fontSize="0.82rem" sx={{ lineHeight: 1.3 }}>{opportunity.title}</Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.72rem">{opportunity.accountName}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="body2" fontWeight={800} sx={{ color: stage?.color, fontSize: '0.85rem' }}>{formatCurrency(opportunity.value)}</Typography>
        <Typography variant="caption" color="text.secondary">{opportunity.probability}%</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar sx={{ width: 18, height: 18, fontSize: '0.6rem', bgcolor: '#1976d2' }}>{opportunity.assignedTo?.[0]}</Avatar>
          <Typography variant="caption" fontSize="0.7rem" color="text.secondary">{opportunity.assignedTo?.split(' ')[0]}</Typography>
        </Box>
        {opportunity.aiPrediction && <AIScoreBadge score={opportunity.aiPrediction.winProbability} size="small" showLabel={false} />}
      </Box>
      {opportunity.expectedClose && (
        <Typography variant="caption" color="text.secondary" fontSize="0.7rem" sx={{ mt: 0.5, display: 'block' }}>
          Close: {opportunity.expectedClose}
        </Typography>
      )}
    </Paper>
  );
};

const SalesPipeline = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: opportunities } = useSelector(s => s.opportunities);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => { dispatch(fetchOpportunities()); }, [dispatch]);

  const handleDrop = (e, targetStage) => {
    const oppId = e.dataTransfer.getData('oppId');
    if (oppId) dispatch(moveOpportunityStage({ id: oppId, stage: targetStage }));
    setDragOver(null);
  };

  const getStageOpps = (stageKey) => opportunities.filter(o => o.stage === stageKey);
  const getStageValue = (stageKey) => getStageOpps(stageKey).reduce((sum, o) => sum + (o.value || 0), 0);

  return (
    <Box>
      <PageHeader
        title="Sales Pipeline"
        subtitle="Drag and drop opportunities between stages"
        breadcrumbs={[{ label: 'Opportunities', path: '/opportunities' }, { label: 'Pipeline' }]}
        actions={[
          { label: 'List View', icon: <TrendingUp />, onClick: () => navigate('/opportunities'), variant: 'outlined' },
          { label: 'Add Opportunity', icon: <Add />, onClick: () => navigate('/opportunities/new'), variant: 'contained' },
        ]}
      />

      {/* Pipeline Summary */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, overflowX: 'auto', pb: 0.5 }}>
        {stages.map(stage => {
          const opps = getStageOpps(stage.key);
          const val = getStageValue(stage.key);
          return (
            <Box key={stage.key} sx={{ textAlign: 'center', minWidth: 120, p: 1.5, bgcolor: stage.bg, borderRadius: 2, border: `1px solid ${stage.color}30` }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: stage.color }}>{opps.length}</Typography>
              <Typography variant="caption" sx={{ color: stage.color, fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>{stage.label}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">{formatCurrency(val)}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Kanban Board */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
        {stages.map(stage => {
          const stageOpps = getStageOpps(stage.key);
          const stageValue = getStageValue(stage.key);
          return (
            <Box
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, stage.key)}
              sx={{
                minWidth: 240, maxWidth: 280, flex: '0 0 auto',
                bgcolor: dragOver === stage.key ? stage.bg : '#f4f6f8',
                borderRadius: 2, p: 1.5,
                border: '2px solid', borderColor: dragOver === stage.key ? stage.color : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {/* Stage Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={800} sx={{ color: stage.color }}>{stage.label}</Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
                    {stageOpps.length} · {formatCurrency(stageValue)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label={stageOpps.length} size="small" sx={{ height: 20, minWidth: 28, fontSize: '0.7rem', bgcolor: stage.bg, color: stage.color, fontWeight: 700 }} />
                  <Tooltip title="Add Opportunity">
                    <IconButton size="small" onClick={() => navigate('/opportunities/new')} sx={{ color: stage.color, '&:hover': { bgcolor: stage.bg } }}>
                      <Add sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Opportunity Cards */}
              <Box sx={{ minHeight: 60 }}>
                {stageOpps.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3, opacity: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Drop here</Typography>
                  </Box>
                ) : stageOpps.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} navigate={navigate}
                    onMove={(id, stage) => dispatch(moveOpportunityStage({ id, stage }))} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SalesPipeline;
