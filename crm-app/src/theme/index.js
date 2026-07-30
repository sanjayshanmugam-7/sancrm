import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: colors.text,
    divider: colors.divider,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
    overline: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 2.66, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.75, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)',
    '0px 2px 6px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.06)',
    '0px 4px 12px rgba(0,0,0,0.08), 0px 2px 6px rgba(0,0,0,0.06)',
    '0px 6px 16px rgba(0,0,0,0.08), 0px 3px 8px rgba(0,0,0,0.06)',
    '0px 8px 20px rgba(0,0,0,0.10), 0px 4px 10px rgba(0,0,0,0.08)',
    '0px 10px 24px rgba(0,0,0,0.10), 0px 5px 12px rgba(0,0,0,0.08)',
    '0px 12px 28px rgba(0,0,0,0.12), 0px 6px 14px rgba(0,0,0,0.10)',
    '0px 14px 32px rgba(0,0,0,0.12), 0px 7px 16px rgba(0,0,0,0.10)',
    '0px 16px 36px rgba(0,0,0,0.14), 0px 8px 18px rgba(0,0,0,0.12)',
    '0px 18px 40px rgba(0,0,0,0.14), 0px 9px 20px rgba(0,0,0,0.12)',
    '0px 20px 44px rgba(0,0,0,0.16), 0px 10px 22px rgba(0,0,0,0.14)',
    '0px 22px 48px rgba(0,0,0,0.16), 0px 11px 24px rgba(0,0,0,0.14)',
    '0px 24px 52px rgba(0,0,0,0.18), 0px 12px 26px rgba(0,0,0,0.16)',
    '0px 26px 56px rgba(0,0,0,0.18), 0px 13px 28px rgba(0,0,0,0.16)',
    '0px 28px 60px rgba(0,0,0,0.20), 0px 14px 30px rgba(0,0,0,0.18)',
    '0px 30px 64px rgba(0,0,0,0.20), 0px 15px 32px rgba(0,0,0,0.18)',
    '0px 32px 68px rgba(0,0,0,0.22), 0px 16px 34px rgba(0,0,0,0.20)',
    '0px 34px 72px rgba(0,0,0,0.22), 0px 17px 36px rgba(0,0,0,0.20)',
    '0px 36px 76px rgba(0,0,0,0.24), 0px 18px 38px rgba(0,0,0,0.22)',
    '0px 38px 80px rgba(0,0,0,0.24), 0px 19px 40px rgba(0,0,0,0.22)',
    '0px 40px 84px rgba(0,0,0,0.26), 0px 20px 42px rgba(0,0,0,0.24)',
    '0px 42px 88px rgba(0,0,0,0.26), 0px 21px 44px rgba(0,0,0,0.24)',
    '0px 44px 92px rgba(0,0,0,0.28), 0px 22px 46px rgba(0,0,0,0.26)',
    '0px 46px 96px rgba(0,0,0,0.28), 0px 23px 48px rgba(0,0,0,0.26)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
        elevation1: { boxShadow: '0px 2px 6px rgba(0,0,0,0.08)' },
        elevation2: { boxShadow: '0px 4px 12px rgba(0,0,0,0.10)' },
        elevation3: { boxShadow: '0px 6px 16px rgba(0,0,0,0.12)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f4f6f8',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: '#424242',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a2035',
          color: '#ffffff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 700, fontSize: '0.65rem' },
      },
    },
  },
});

export default theme;
