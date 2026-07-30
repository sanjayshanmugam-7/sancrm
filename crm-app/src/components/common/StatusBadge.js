import React from 'react';
import { Chip } from '@mui/material';
import { colors } from '../../theme/colors';

const statusConfig = {
  // Lead statuses
  new: { label: 'New', color: '#1976d2', bg: '#e3f2fd' },
  contacted: { label: 'Contacted', color: '#f57c00', bg: '#fff3e0' },
  qualified: { label: 'Qualified', color: '#388e3c', bg: '#e8f5e9' },
  proposal: { label: 'Proposal', color: '#7b1fa2', bg: '#f3e5f5' },
  negotiation: { label: 'Negotiation', color: '#e64a19', bg: '#fbe9e7' },
  closed_won: { label: 'Closed Won', color: '#2e7d32', bg: '#e8f5e9' },
  closed_lost: { label: 'Closed Lost', color: '#c62828', bg: '#ffebee' },
  converted: { label: 'Converted', color: '#00695c', bg: '#e0f2f1' },
  // Pipeline stages
  lead: { label: 'Lead', color: '#1976d2', bg: '#e3f2fd' },
  // Activity statuses
  completed: { label: 'Completed', color: '#388e3c', bg: '#e8f5e9' },
  scheduled: { label: 'Scheduled', color: '#1976d2', bg: '#e3f2fd' },
  pending: { label: 'Pending', color: '#f57c00', bg: '#fff3e0' },
  cancelled: { label: 'Cancelled', color: '#757575', bg: '#f5f5f5' },
  sent: { label: 'Sent', color: '#0288d1', bg: '#e1f5fe' },
  // Campaign statuses
  active: { label: 'Active', color: '#388e3c', bg: '#e8f5e9' },
  draft: { label: 'Draft', color: '#757575', bg: '#f5f5f5' },
  paused: { label: 'Paused', color: '#f57c00', bg: '#fff3e0' },
  stopped: { label: 'Stopped', color: '#c62828', bg: '#ffebee' },
  // Document statuses
  approved: { label: 'Approved', color: '#388e3c', bg: '#e8f5e9' },
  rejected: { label: 'Rejected', color: '#c62828', bg: '#ffebee' },
  signed: { label: 'Signed', color: '#2e7d32', bg: '#e8f5e9' },
  pending_signature: { label: 'Pending Signature', color: '#f57c00', bg: '#fff3e0' },
  processed: { label: 'Processed', color: '#0288d1', bg: '#e1f5fe' },
  // General
  inactive: { label: 'Inactive', color: '#757575', bg: '#f5f5f5' },
  // Temperature
  hot: { label: 'Hot', color: '#c62828', bg: '#ffebee' },
  warm: { label: 'Warm', color: '#e64a19', bg: '#fbe9e7' },
  cold: { label: 'Cold', color: '#0277bd', bg: '#e1f5fe' },
  // Priority
  urgent: { label: 'Urgent', color: '#b71c1c', bg: '#ffebee' },
  high: { label: 'High', color: '#e64a19', bg: '#fbe9e7' },
  medium: { label: 'Medium', color: '#f57c00', bg: '#fff3e0' },
  low: { label: 'Low', color: '#388e3c', bg: '#e8f5e9' },
  // Outcome
  positive: { label: 'Positive', color: '#388e3c', bg: '#e8f5e9' },
  neutral: { label: 'Neutral', color: '#757575', bg: '#f5f5f5' },
  negative: { label: 'Negative', color: '#c62828', bg: '#ffebee' },
  awaiting_reply: { label: 'Awaiting Reply', color: '#0288d1', bg: '#e1f5fe' },
  opened: { label: 'Opened', color: '#7b1fa2', bg: '#f3e5f5' },
};

const StatusBadge = ({ status, label, size = 'small', variant = 'filled', sx }) => {
  const config = statusConfig[status] || statusConfig[status?.toLowerCase()] || {
    label: label || status || 'Unknown',
    color: '#757575',
    bg: '#f5f5f5',
  };

  const displayLabel = label || config.label;

  return (
    <Chip
      label={displayLabel}
      size={size}
      sx={{
        bgcolor: variant === 'filled' ? config.bg : 'transparent',
        color: config.color,
        border: variant === 'outlined' ? `1px solid ${config.color}` : 'none',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.75rem',
        height: size === 'small' ? 22 : 26,
        borderRadius: 1.5,
        '& .MuiChip-label': { px: 1 },
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
