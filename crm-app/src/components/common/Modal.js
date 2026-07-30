import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, Box, Divider, Button,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  fullScreen = false,
  disableClose = false,
  loading = false,
  noPadding = false,
  headerColor,
}) => {
  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 0,
          bgcolor: headerColor || 'transparent',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2, bgcolor: headerColor ? headerColor : 'transparent' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: headerColor ? '#fff' : 'text.primary', lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: headerColor ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {!disableClose && (
            <IconButton onClick={onClose} size="small"
              sx={{ color: headerColor ? 'rgba(255,255,255,0.7)' : 'text.secondary', '&:hover': { bgcolor: headerColor ? 'rgba(255,255,255,0.1)' : 'action.hover' } }}>
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Divider />
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: noPadding ? 0 : 3, overflow: 'auto' }}>
        {children}
      </DialogContent>

      {/* Actions */}
      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || (i === actions.length - 1 ? 'contained' : 'outlined')}
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                startIcon={action.icon}
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                {action.label}
              </Button>
            ))}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default Modal;
