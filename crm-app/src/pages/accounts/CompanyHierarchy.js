import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Avatar, Chip, Button, Paper } from '@mui/material';
import { Business, AccountTree, ExpandMore, ArrowForward } from '@mui/icons-material';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const HierarchyNode = ({ account, level = 0, children, navigate }) => (
  <Box sx={{ ml: level * 4, mb: 1.5 }}>
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: 'primary.main', boxShadow: 2 }, borderLeft: level > 0 ? '3px solid' : '3px solid transparent', borderLeftColor: level > 0 ? (level === 1 ? 'primary.main' : 'success.main') : 'transparent' }}
      onClick={() => navigate(`/accounts/${account.id}`)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: level === 0 ? '#1976d220' : level === 1 ? '#388e3c20' : '#f57c0020', color: level === 0 ? '#1976d2' : level === 1 ? '#388e3c' : '#f57c00', borderRadius: 1.5, fontSize: '0.85rem', fontWeight: 700 }}>
          {account.name?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={700}>{account.name}</Typography>
            <Chip label={level === 0 ? 'Parent Company' : level === 1 ? 'Company' : 'Branch'} size="small"
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: level === 0 ? '#e3f2fd' : level === 1 ? '#e8f5e9' : '#fff3e0', color: level === 0 ? '#1976d2' : level === 1 ? '#388e3c' : '#f57c00', fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">{account.industry} · {account.employeeCount} employees · {account.primaryContact}</Typography>
        </Box>
        <StatusBadge status={account.status} />
        <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
    </Paper>
    {children && (
      <Box sx={{ ml: 3, mt: 0.5, borderLeft: '2px dashed #e0e0e0', pl: 2 }}>
        {children}
      </Box>
    )}
  </Box>
);

const CompanyHierarchy = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(s => s.accounts);

  useEffect(() => { dispatch(fetchAccounts()); }, [dispatch]);

  const rootCompanies = items.filter(a => !a.parentId && a.type === 'company');

  return (
    <Box>
      <PageHeader
        title="Company Hierarchy"
        subtitle="Visual tree view of parent companies, companies, and branches"
        breadcrumbs={[{ label: 'Accounts', path: '/accounts' }, { label: 'Hierarchy' }]}
        actions={[{ label: 'Add Account', icon: <Business />, onClick: () => navigate('/accounts/new'), variant: 'contained' }]}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Parent Companies', count: items.filter(a => a.type === 'parent_company').length, color: '#1976d2', bg: '#e3f2fd' },
          { label: 'Companies', count: rootCompanies.length, color: '#388e3c', bg: '#e8f5e9' },
          { label: 'Branches', count: items.filter(a => a.type === 'branch').length, color: '#f57c00', bg: '#fff3e0' },
          { label: 'Total Accounts', count: items.length, color: '#9c27b0', bg: '#f3e5f5' },
        ].map((s, i) => (
          <Card key={i} sx={{ minWidth: 160 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.count}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AccountTree sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle1" fontWeight={700}>Account Tree</Typography>
          </Box>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading hierarchy...</Typography>
          ) : rootCompanies.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No accounts found.</Typography>
          ) : rootCompanies.map(company => {
            const branches = items.filter(a => a.parentId === company.id);
            return (
              <HierarchyNode key={company.id} account={company} level={1} navigate={navigate}>
                {branches.map(branch => (
                  <HierarchyNode key={branch.id} account={branch} level={2} navigate={navigate} />
                ))}
              </HierarchyNode>
            );
          })}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyHierarchy;
