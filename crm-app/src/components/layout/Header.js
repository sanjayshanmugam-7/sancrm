import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Badge, Avatar,
  InputBase, Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Tooltip, Chip, Paper, List, ListItem,
} from '@mui/material';
import {
  Menu as MenuIcon, Search, Notifications, Settings, Logout,
  Person, Help, TrendingUp, PersonAdd, Close, KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const mockNotifications = [
  { id: 1, type: 'lead', message: 'New lead from Website: Arjun Sharma', time: '5 min ago', read: false, path: '/leads/1' },
  { id: 2, type: 'activity', message: 'Meeting with Priya Patel scheduled for 2 PM', time: '30 min ago', read: false, path: '/activities/meetings' },
  { id: 3, type: 'opportunity', message: 'Opportunity "TechCorp ERP" moved to Proposal stage', time: '1 hr ago', read: true, path: '/opportunities/1' },
  { id: 4, type: 'task', message: 'Follow-up reminder: Call Rohit Verma', time: '2 hr ago', read: true, path: '/activities/followups' },
  { id: 5, type: 'campaign', message: 'Email Campaign "Q1 Launch" completed. 675 opens.', time: '3 hr ago', read: true, path: '/campaigns/1' },
];

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const displayName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  function handleLogout() {
    setAnchorEl(null);
    dispatch(logout());
    navigate('/login', { replace: true });
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1, sm: 2 }, gap: 1 }}>
        {/* Hamburger */}
        <IconButton
          onClick={onToggleSidebar}
          size="small"
          sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 0.75 }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        {/* Search */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            maxWidth: 480,
            bgcolor: searchFocused ? '#fff' : '#f4f6f8',
            border: '1px solid',
            borderColor: searchFocused ? 'primary.main' : 'transparent',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            transition: 'all 0.2s',
            ml: 1,
          }}
        >
          <Search sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search leads, contacts, accounts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{ flex: 1, fontSize: '0.875rem', '& input': { p: 0 } }}
          />
          {searchValue && (
            <IconButton size="small" onClick={() => setSearchValue('')} sx={{ p: 0.25 }}>
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Paper>

        <Box sx={{ flex: 1 }} />

        {/* Quick Actions */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          <Tooltip title="New Lead">
            <Chip
              icon={<PersonAdd sx={{ fontSize: '16px !important' }} />}
              label="New Lead"
              onClick={() => navigate('/leads/new')}
              size="small"
              sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', '&:hover': { bgcolor: 'primary.dark' } }}
            />
          </Tooltip>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} size="small" sx={{ color: 'text.secondary' }}>
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', minWidth: 16, height: 16 } }}>
              <Notifications fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>{initials}</Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.8rem' }}>{displayName}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', lineHeight: 1 }}>{user?.role ?? 'CRM User'}</Typography>
          </Box>
          <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>

        {/* User Menu Dropdown */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{displayName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email ?? ''}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)} sx={{ gap: 1.5, py: 1 }}>
            <ListItemIcon><Help fontSize="small" /></ListItemIcon>
            <ListItemText primary="Help & Support" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>
          <Divider />
          <MenuItem sx={{ gap: 1.5, py: 1, color: 'error.main' }} onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.875rem', color: 'error.main' }} />
          </MenuItem>
        </Menu>

        {/* Notifications Panel */}
        <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
          PaperProps={{ elevation: 3, sx: { mt: 1.5, width: 360, maxHeight: 480, borderRadius: 2, border: '1px solid', borderColor: 'divider' } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
            <Chip label={`${unreadCount} new`} size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
          </Box>
          <Divider />
          <List disablePadding sx={{ maxHeight: 380, overflow: 'auto' }}>
            {mockNotifications.map((notif) => (
              <ListItem key={notif.id} alignItems="flex-start"
                onClick={() => { navigate(notif.path); setNotifAnchor(null); }}
                sx={{ cursor: 'pointer', px: 2, py: 1.5, bgcolor: notif.read ? 'transparent' : 'rgba(25,118,210,0.04)', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: notif.read ? 'grey.200' : 'primary.light', fontSize: '0.75rem' }}>
                    {notif.type === 'lead' ? <PersonAdd sx={{ fontSize: 16 }} /> : notif.type === 'opportunity' ? <TrendingUp sx={{ fontSize: 16 }} /> : <Notifications sx={{ fontSize: 16 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: notif.read ? 400 : 600, lineHeight: 1.4 }}>{notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{notif.time}</Typography>
                  </Box>
                  {!notif.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.5, flexShrink: 0 }} />}
                </Box>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', '&:hover': { textDecoration: 'underline' } }}>
              View all notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
