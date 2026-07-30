import React from 'react';
import { Box, Typography, Breadcrumbs, Button, Chip, Divider } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  chips = [],
  divider = true,
  sx,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3, ...sx }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 14 }} />}
          sx={{ mb: 1, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            onClick={() => navigate('/')}
          >
            <Home sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Home</Typography>
          </Box>
          {breadcrumbs.map((crumb, i) => (
            i === breadcrumbs.length - 1 ? (
              <Typography key={i} variant="caption" sx={{ fontSize: '0.75rem', color: 'text.primary', fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            ) : (
              <Typography
                key={i}
                variant="caption"
                sx={{ fontSize: '0.75rem', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                onClick={() => crumb.path && navigate(crumb.path)}
              >
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}

      {/* Title Row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            {chips.map((chip, i) => (
              <Chip
                key={i}
                label={chip.label}
                size="small"
                color={chip.color || 'default'}
                variant={chip.variant || 'outlined'}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            ))}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || (i === actions.length - 1 ? 'contained' : 'outlined')}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                size={action.size || 'small'}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {divider && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
};

export default PageHeader;
