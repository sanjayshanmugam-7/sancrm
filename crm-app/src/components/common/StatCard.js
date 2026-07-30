import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = '#1976d2',
  bgColor,
  chip,
  onClick,
  sx,
}) => {
  const trendPositive = trendValue > 0;
  const trendNeutral = trendValue === 0;

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
        } : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ my: 0.5, color: 'text.primary', lineHeight: 1.1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {subtitle}
              </Typography>
            )}
            {(trend !== undefined || trendValue !== undefined) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                {trendNeutral ? (
                  <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />
                ) : trendPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography variant="caption" sx={{
                  color: trendNeutral ? 'text.secondary' : trendPositive ? 'success.main' : 'error.main',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}>
                  {trendValue > 0 ? '+' : ''}{trendValue}% {trend || 'vs last month'}
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                bgcolor: bgColor || `${color}18`,
                color: color,
                width: 48,
                height: 48,
                borderRadius: 2.5,
                '& svg': { fontSize: 24 },
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
        {chip && (
          <Chip
            label={chip.label}
            size="small"
            sx={{ mt: 1.5, bgcolor: `${color}18`, color: color, fontWeight: 700, fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 1 } }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
