import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, Avatar, Tooltip, Badge,
} from '@mui/material';
import {
  Dashboard, People, Business, TrendingUp, Event, Campaign,
  Description, ContactMail, ExpandLess, ExpandMore,
  PersonAdd, ImportExport, MergeType, Assignment, Loop, Settings,
  Phone, Email, VideoCall, Notifications, Facebook, Google,
  WhatsApp, Instagram, Message, NotificationsActive, Article,
  Gavel, RequestQuote, DocumentScanner, Draw, CorporateFare,
  AccountTree, BarChart, MenuBook, SupervisedUserCircle, History,
  StickyNote2, AttachFile, Hub, Apartment, AccountBalance,
  LocationOn, Category, CreditCard, Receipt, LocalShipping,
  Timeline, CorporateFare as Corporate,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },

  // ── Communication ────────────────────────────────────────────
  {
    label: 'Communication', icon: <History />, path: '/communication', children: [
      { label: 'History', icon: <History />, path: '/communication/history' },
      { label: 'Notes', icon: <StickyNote2 />, path: '/communication/notes' },
      { label: 'Attachments', icon: <AttachFile />, path: '/communication/attachments' },
      { label: 'Relationship Map', icon: <Hub />, path: '/communication/relationships' },
    ],
  },

  // ── Leads ────────────────────────────────────────────────────
  {
    label: 'Leads', icon: <PersonAdd />, path: '/leads', children: [
      { label: 'All Leads', icon: <People />, path: '/leads' },
      { label: 'Bulk Import', icon: <ImportExport />, path: '/leads/tools/bulk-import' },
      { label: 'Duplicate Detection', icon: <MergeType />, path: '/leads/tools/duplicate-detection' },
      { label: 'Lead Assignment', icon: <Assignment />, path: '/leads/tools/assignment' },
    ],
  },

  // ── Contacts ─────────────────────────────────────────────────
  {
    label: 'Contacts', icon: <ContactMail />, path: '/contacts', children: [
      { label: 'All Contacts', icon: <People />, path: '/contacts' },
      { label: 'Customer Groups', icon: <SupervisedUserCircle />, path: '/contacts/groups' },
    ],
  },

  // ── Accounts ─────────────────────────────────────────────────
  {
    label: 'Accounts', icon: <Business />, path: '/accounts', children: [
      { label: 'All Accounts', icon: <Business />, path: '/accounts' },
      { label: 'Companies', icon: <Apartment />, path: '/accounts/companies' },
      { label: 'Branches', icon: <LocationOn />, path: '/accounts/branches' },
      { label: 'Parent Companies', icon: <AccountBalance />, path: '/accounts/parent-companies' },
      { label: 'Customer Categories', icon: <Category />, path: '/accounts/categories' },
      { label: 'Credit Limits', icon: <CreditCard />, path: '/accounts/credit-limits' },
      { label: 'GST Details', icon: <Receipt />, path: '/accounts/gst' },
      { label: 'Billing Address', icon: <LocationOn />, path: '/accounts/billing-address' },
      { label: 'Shipping Address', icon: <LocalShipping />, path: '/accounts/shipping-address' },
      { label: 'Company Hierarchy', icon: <AccountTree />, path: '/accounts/hierarchy' },
    ],
  },

  // ── Opportunities ────────────────────────────────────────────
  {
    label: 'Opportunities', icon: <TrendingUp />, path: '/opportunities', children: [
      { label: 'All Opportunities', icon: <TrendingUp />, path: '/opportunities' },
      { label: 'Opportunity Tracking', icon: <Timeline />, path: '/opportunities/tracking' },
      { label: 'Sales Pipeline', icon: <BarChart />, path: '/opportunities/pipeline' },
    ],
  },

  // ── Activities ───────────────────────────────────────────────
  {
    label: 'Activities', icon: <Event />, path: '/activities', children: [
      { label: 'Calendar', icon: <Event />, path: '/activities' },
      { label: 'Calls', icon: <Phone />, path: '/activities/calls' },
      { label: 'Meetings', icon: <VideoCall />, path: '/activities/meetings' },
      { label: 'Emails', icon: <Email />, path: '/activities/emails' },
      { label: 'Follow-ups', icon: <NotificationsActive />, path: '/activities/followups' },
    ],
  },

  // ── Campaigns ────────────────────────────────────────────────
  {
    label: 'Campaigns', icon: <Campaign />, path: '/campaigns', children: [
      { label: 'All Campaigns', icon: <Campaign />, path: '/campaigns' },
      { label: 'Email Marketing', icon: <Email />, path: '/campaigns/email/new' },
      { label: 'SMS Campaign', icon: <Message />, path: '/campaigns/sms/new' },
      { label: 'WhatsApp Campaign', icon: <WhatsApp />, path: '/campaigns/whatsapp/new' },
      { label: 'Facebook Campaign', icon: <Facebook />, path: '/campaigns/facebook/new' },
      { label: 'Google Campaign', icon: <Google />, path: '/campaigns/google/new' },
      { label: 'Push Notifications', icon: <Notifications />, path: '/campaigns/push/new' },
    ],
  },

  // ── Documents ────────────────────────────────────────────────
  {
    label: 'Documents', icon: <Description />, path: '/documents', children: [
      { label: 'All Documents', icon: <MenuBook />, path: '/documents' },
      { label: 'Proposals', icon: <Article />, path: '/documents/proposal/new' },
      { label: 'Agreements', icon: <Gavel />, path: '/documents/agreement/new' },
      { label: 'Quotations', icon: <RequestQuote />, path: '/documents/quotation/new' },
      { label: 'OCR Documents', icon: <DocumentScanner />, path: '/documents/ocr' },
      { label: 'Digital Signature', icon: <Draw />, path: '/documents/signature' },
    ],
  },
];

const SidebarItem = ({ item, depth = 0, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      navigate(item.path);
    }
  };

  const itemContent = (
    <ListItemButton
      onClick={handleClick}
      selected={isActive && !hasChildren}
      sx={{
        pl: depth > 0 ? 3.5 : 1.5,
        pr: 1.5,
        py: 0.85,
        mx: 0.75,
        borderRadius: 2,
        mb: 0.25,
        '&.Mui-selected': {
          bgcolor: 'primary.main',
          '& .MuiListItemIcon-root': { color: '#fff' },
          '& .MuiListItemText-primary': { color: '#fff', fontWeight: 700 },
        },
        '& .MuiListItemIcon-root': {
          color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
          minWidth: 36,
        },
        '& .MuiListItemText-primary': {
          color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
          fontSize: depth > 0 ? '0.8rem' : '0.875rem',
          fontWeight: isActive ? 600 : 400,
        },
      }}
    >
      <ListItemIcon sx={{ '& svg': { fontSize: depth > 0 ? 18 : 20 } }}>
        {item.icon}
      </ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText primary={item.label} />
          {hasChildren && (open ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />)}
        </>
      )}
    </ListItemButton>
  );

  return (
    <>
      {collapsed && depth === 0 ? (
        <Tooltip title={item.label} placement="right" arrow>
          {itemContent}
        </Tooltip>
      ) : itemContent}
      {hasChildren && !collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children.map((child) => (
              <SidebarItem key={child.path} item={child} depth={depth + 1} collapsed={collapsed} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const Sidebar = ({ open, onClose, variant = 'permanent', collapsed = false }) => {
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a2035', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ p: collapsed ? 1.5 : 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 64 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 800 }}>C</Avatar>
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, fontSize: '1.1rem' }}>SanCRM</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>Customer Relationship</Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
        <List disablePadding>
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </List>
      </Box>

      {/* User Profile at bottom */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: collapsed ? 1 : 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Badge badgeContent="" color="success" variant="dot" overlap="circular"
          sx={{ '& .MuiBadge-badge': { right: 2, bottom: 2, border: '2px solid #1a2035', minWidth: 10, height: 10, borderRadius: '50%' } }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '0.85rem', fontWeight: 700 }}>RK</Avatar>
        </Badge>
        {!collapsed && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ravi Kumar</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Sales Manager</Typography>
          </Box>
        )}
        {!collapsed && (
          <Tooltip title="Settings">
            <Settings sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', '&:hover': { color: 'rgba(255,255,255,0.8)' } }} />
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' } }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 64 : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 64 : DRAWER_WIDTH,
          border: 'none',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
