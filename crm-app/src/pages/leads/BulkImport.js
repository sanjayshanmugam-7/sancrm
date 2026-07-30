import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Alert, Stepper,
  Step, StepLabel, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, LinearProgress, Paper, Divider, Grid,
} from '@mui/material';
import { CloudUpload, Download, CheckCircle, Error, ArrowBack } from '@mui/icons-material';
import { importLeads } from '../../store/slices/leadsSlice';
import PageHeader from '../../components/common/PageHeader';

const EXPECTED_COLUMNS = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Industry', 'Notes'];

const mockPreviewData = [
  { 'First Name': 'Rahul', 'Last Name': 'Mehta', 'Email': 'rahul.m@techco.in', 'Phone': '9876543210', 'Company': 'TechCo', 'Source': 'Website', 'Status': 'new', 'Industry': 'Technology', 'Notes': '' },
  { 'First Name': 'Sunita', 'Last Name': 'Sharma', 'Email': 'sunita@finance.com', 'Phone': '9123456780', 'Company': 'FinancePlus', 'Source': 'Google Ads', 'Status': 'new', 'Industry': 'Finance', 'Notes': 'Via contact form' },
  { 'First Name': 'Kiran', 'Last Name': 'Bhat', 'Email': 'kiran@mfg.co', 'Phone': '8877665544', 'Company': 'MFG Corp', 'Source': 'Referral', 'Status': 'new', 'Industry': 'Manufacturing', 'Notes': '' },
  { 'First Name': 'Deepa', 'Last Name': 'Nair', 'Email': '', 'Phone': '9988776655', 'Company': 'RetailMart', 'Source': 'Facebook', 'Status': 'new', 'Industry': 'Retail', 'Notes': '' },
  { 'First Name': 'Anil', 'Last Name': 'Kumar', 'Email': 'anil.k@health.org', 'Phone': '7766554433', 'Company': 'HealthFirst', 'Source': 'WhatsApp', 'Status': 'new', 'Industry': 'Healthcare', 'Notes': 'High priority' },
];

const steps = ['Upload File', 'Preview & Validate', 'Import'];

const BulkImport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setPreviewData(mockPreviewData);
      setActiveStep(1);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData(mockPreviewData);
      setActiveStep(1);
    }
  };

  const validRows = previewData.filter(r => r['Email'] && r['First Name'] && r['Phone']);
  const invalidRows = previewData.filter(r => !r['Email'] || !r['First Name'] || !r['Phone']);

  const handleImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 2000));
    setResult({ total: previewData.length, imported: validRows.length, failed: invalidRows.length, skipped: 0 });
    setImporting(false);
    setActiveStep(2);
  };

  return (
    <Box>
      <PageHeader
        title="Bulk Import Leads"
        subtitle="Import multiple leads at once using CSV or Excel files"
        breadcrumbs={[{ label: 'Leads', path: '/leads' }, { label: 'Bulk Import' }]}
        actions={[{ label: 'Back', icon: <ArrowBack />, onClick: () => navigate('/leads'), variant: 'outlined' }]}
      />

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Upload */}
      {activeStep === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: dragging ? 'primary.main' : '#e0e0e0',
                    borderRadius: 3,
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: dragging ? '#e3f2fd' : '#fafafa',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: '#e3f2fd' },
                  }}
                >
                  <CloudUpload sx={{ fontSize: 56, color: dragging ? '#1976d2' : '#bdbdbd', mb: 1.5 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Drop your file here</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>or click to browse</Typography>
                  <Chip label="CSV" sx={{ mr: 0.5 }} size="small" variant="outlined" />
                  <Chip label="XLSX" size="small" variant="outlined" />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5 }}>Maximum file size: 10 MB</Typography>
                  <input ref={fileRef} type="file" accept=".csv,.xlsx" onChange={handleFileSelect} style={{ display: 'none' }} />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Required Columns</Typography>
                {EXPECTED_COLUMNS.map((col, i) => (
                  <Box key={col} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i < 4 ? '#d32f2f' : '#388e3c' }} />
                    <Typography variant="caption">{col}</Typography>
                    {i < 4 && <Chip label="Required" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#ffebee', color: '#d32f2f', '& .MuiChip-label': { px: 0.75 } }} />}
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Button variant="outlined" startIcon={<Download />} fullWidth size="small" sx={{ borderRadius: 2 }}>
                  Download Template
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Preview */}
      {activeStep === 1 && previewData.length > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight={700}>Preview: {file?.name}</Typography>
              <Chip label={`${previewData.length} records`} size="small" color="primary" />
              <Chip label={`${validRows.length} valid`} size="small" color="success" />
              {invalidRows.length > 0 && <Chip label={`${invalidRows.length} invalid`} size="small" color="error" />}
            </Box>
            <Box sx={{ overflow: 'auto', mb: 2, maxHeight: 350 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 700, fontSize: '0.75rem' }}>#</TableCell>
                    {EXPECTED_COLUMNS.map(col => <TableCell key={col} sx={{ bgcolor: '#f4f6f8', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{col}</TableCell>)}
                    <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, i) => {
                    const isValid = row['Email'] && row['First Name'] && row['Phone'];
                    return (
                      <TableRow key={i} sx={{ bgcolor: isValid ? 'transparent' : '#fff8f8' }}>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{i + 1}</TableCell>
                        {EXPECTED_COLUMNS.map(col => (
                          <TableCell key={col} sx={{ fontSize: '0.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: !row[col] && ['Email', 'First Name', 'Phone'].includes(col) ? 'error.main' : 'text.primary' }}>
                            {row[col] || <em style={{ color: '#bdbdbd' }}>empty</em>}
                          </TableCell>
                        ))}
                        <TableCell>
                          {isValid
                            ? <CheckCircle sx={{ fontSize: 16, color: '#388e3c' }} />
                            : <Error sx={{ fontSize: 16, color: '#d32f2f' }} />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            {invalidRows.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                {invalidRows.length} records have missing required fields (Email, First Name, or Phone) and will be skipped.
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ borderRadius: 2 }}>Change File</Button>
              <Button variant="contained" onClick={handleImport} sx={{ borderRadius: 2 }}>
                Import {validRows.length} Records
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Result */}
      {activeStep === 2 && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {importing ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Importing leads...</Typography>
                <LinearProgress sx={{ borderRadius: 2, height: 8 }} />
              </Box>
            ) : result && (
              <Box>
                <CheckCircle sx={{ fontSize: 64, color: '#388e3c', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Import Complete!</Typography>
                <Grid container spacing={2} sx={{ maxWidth: 400, mx: 'auto', mt: 2, mb: 3 }}>
                  {[
                    { label: 'Total', value: result.total, color: '#1976d2' },
                    { label: 'Imported', value: result.imported, color: '#388e3c' },
                    { label: 'Failed', value: result.failed, color: '#d32f2f' },
                    { label: 'Skipped', value: result.skipped, color: '#f57c00' },
                  ].map((s) => (
                    <Grid item xs={3} key={s.label}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Button variant="contained" onClick={() => navigate('/leads')} sx={{ borderRadius: 2, mr: 1.5 }}>View Leads</Button>
                <Button variant="outlined" onClick={() => { setActiveStep(0); setFile(null); setPreviewData([]); setResult(null); }} sx={{ borderRadius: 2 }}>Import More</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BulkImport;
