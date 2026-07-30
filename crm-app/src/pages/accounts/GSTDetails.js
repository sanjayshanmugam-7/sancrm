import React from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { Add, Verified } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';

const mockGST = [
  { account: 'TechCorp Ltd', gstin: '27AABCC1234D1Z5', state: 'Maharashtra', status: 'Active', verifiedDate: '2024-01-15' },
  { account: 'GlobalTech Inc', gstin: '07AABCC9012F3Z7', state: 'Delhi', status: 'Active', verifiedDate: '2024-02-10' },
  { account: 'ABC Industries', gstin: '29AABCC5678E2Z6', state: 'Karnataka', status: 'Active', verifiedDate: '2024-03-05' },
];

export default function GSTDetails() {
  return (
    <Box>
      <PageHeader title="GST Details" subtitle="Manage GST/TIN information for all accounts"
        breadcrumbs={[{ label: 'Accounts', href: '/accounts' }, { label: 'GST Details' }]}
        action={<Button variant="contained" startIcon={<Add />}>Add GSTIN</Button>} />
      <Alert severity="info" sx={{ mb: 2 }}>All GSTINs are verified with the GSTN portal. Last sync: 2024-11-15</Alert>
      <Card>
        <Table>
          <TableHead><TableRow>
            <TableCell>Account</TableCell><TableCell>GSTIN</TableCell><TableCell>State</TableCell><TableCell>Status</TableCell><TableCell>Verified Date</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {mockGST.map((g, i) => (
              <TableRow key={i} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{g.account}</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{g.gstin}</Typography></TableCell>
                <TableCell>{g.state}</TableCell>
                <TableCell><Chip icon={<Verified fontSize="small" />} label={g.status} size="small" color="success" /></TableCell>
                <TableCell>{g.verifiedDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
