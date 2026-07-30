import React from 'react';
import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

const AIScoreBadge = ({ score, showLabel = true, showBar = false, size = 'medium', tooltip }) => {
  const getColor = (s) => {
    if (s >= 75) return '#388e3c';
    if (s >= 50) return '#f57c00';
    return '#d32f2f';
  };

  const getLabel = (s) => {
    if (s >= 75) return 'High';
    if (s >= 50) return 'Medium';
    return 'Low';
  };

  const color = getColor(score);
  const label = getLabel(score);

  const badge = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: size === 'small' ? 0.4 : 0.6 }}>
      <AutoAwesome sx={{ fontSize: size === 'small' ? 12 : 14, color }} />
      <Typography
        component="span"
        sx={{
          fontSize: size === 'small' ? '0.7rem' : '0.8rem',
          fontWeight: 700,
          color,
          bgcolor: `${color}18`,
          px: size === 'small' ? 0.75 : 1,
          py: 0.25,
          borderRadius: 1,
          border: `1px solid ${color}40`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.4,
        }}
      >
        {score}
        {showLabel && (
          <Typography component="span" sx={{ fontSize: size === 'small' ? '0.65rem' : '0.7rem', fontWeight: 500, opacity: 0.8 }}>
            {label}
          </Typography>
        )}
      </Typography>
      {showBar && (
        <Box sx={{ width: 60 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: `${color}20`,
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
            }}
          />
        </Box>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default AIScoreBadge;
